/*
sql2aryで作成された配列を読み
それらのテーブル間、列間の関係性を構築する
*/

const TOP_STMT_TABLE_NAME = "__top__";

const ConnectStmts = stmts => {
   const main = stmts => {
      // テーブル参照の有向グラフ(1:fromTable、2:toTable。いずれもindex)
      const graphTable = stmts.map(s => {
         // stmtsを参照し、参照するテーブルを返す
         // getTableIndex()の中で、mapName2Idxが更新されている
         return s.fromTableNames.map(t => getTableIndex(t, stmts));
      });
      // 列参照の有効グラフ(1:fromTable, 2:fromTableColumn, 3:{tableIndex, columnIndex}
      const graphColumn = stmts.map(s => {   // 1:table
         return s.columns.map(c => {            // 2:statementsのcolumn
            return c.fromColumns.map(fc => {       // 3:fromTable, 4:fromColumn
               // この形式で取得{tableIndex: -1, columnIndex: -1}
               return getTableColumnIndex(fc.tableName, fc.columnName, stmts);
            });
         });
      });

      // {from:(テーブル名), to:(テーブル名)}の配列
      const tableConns = graphTable.map((fromTblIdxs, toTblIdx) => 
            fromTblIdxs.map(fromTblIdx => ({
               fromTableName: mapTableIdx2Name[fromTblIdx],
               toTableName: mapTableIdx2Name[toTblIdx],
            })),
      ).flat();
      // {from:(テーブル名.列名), to:(テーブル名.列名)}の配列
      const colConns = graphColumn.map((colObjs, toTblIdx) => 
         colObjs.map((fromIdxObjs, toColIdx) => (
            fromIdxObjs.map(fromIdxObj => {
               const {tableName: fromTableName, columnName: fromColumnName}
                  = getTableCoumnName(fromIdxObj.tableIndex, fromIdxObj.columnIndex);
               const {tableName: toTableName, columnName: toColumnName}
                  = getTableCoumnName(toTblIdx, toColIdx);
               return {
                  fromTableName,
                  fromColumnName,
                  toTableName,
                  toColumnName,
               };
            })
         )).flat(),
      ).flat();

      // テーブルごとの配列
      // 1. 順序(depth: トップが0で、元へさかのぼるほど増える)を追加する
      // 2. クエリがないテーブル(＝stmtsにない)を簡単に追加する
      const upd_stmts = updateStatements(stmts, graphTable);  

      return {
         stmts: upd_stmts,
         tableConns,
         colConns,
      };
   };

   let mapTableName2Idx = null;
   let mapTableIdx2Name = null;
   const getTableIndex = (tableName, stmts) => {
      // まだ作成されていなければ作成
      if (!mapTableName2Idx) {
         mapTableName2Idx = createTableMapName2Idx(stmts);
         mapTableIdx2Name = createTableIdx2MapName(stmts);
      }
      let retIdx = -1;
      if (Object.prototype.hasOwnProperty.call(mapTableName2Idx, tableName)) {
         retIdx = mapTableName2Idx[tableName];
      } else {
         // 存在しない場合は、Idxを追加する
         // その場合、stmtsの長さをindexが超えるので注意
         retIdx = Object.keys(mapTableName2Idx).length;    // lengthなので次のindexとしてそのまま使える
         mapTableName2Idx[tableName] = retIdx;
         mapTableIdx2Name[retIdx] = tableName;
      }
      return retIdx;
   };
   /* eslint-disable no-unused-vars */
   const getTableName = tableIdx => {
      if (Object.prototype.hasOwnProperty.call(mapTableIdx2Name, tableIdx)) {
         return mapTableIdx2Name[tableIdx];
      }
      console.error(`存在しない. getTableName(${tableIdx})`);
   };
   /* eslint-enable no-unused-vars */
   
   let mapTableColumnName2Idx = null;
   let mapTableColumnIdx2Name = null;
   // テーブル名と列名から、テーブル名のindexと列名のindexを返す
   const getTableColumnIndex = (tableName, columnName, stmts) => {
      // 作られていない場合は作成
      if (!mapTableColumnName2Idx) {
         mapTableColumnName2Idx = createTableColumnMapName2Idx(stmts);
         mapTableColumnIdx2Name = createTableColumnIdx2MapName(stmts);
      }
      
      const tableIdx = getTableIndex(tableName, stmts);
      const retObj = {tableIndex: -1, columnIndex: -1};
      if (!Object.prototype.hasOwnProperty.call(mapTableColumnName2Idx, tableName)) {
         // テーブルがない場合はテーブルを追加
         mapTableColumnName2Idx[tableName] = {};
         mapTableColumnIdx2Name[tableIdx] = {};
      }
      if (Object.prototype.hasOwnProperty.call(mapTableColumnName2Idx[tableName], columnName)) {
         // テーブルも列もある場合はそのindexを返す
         const {tableIndex: locTableIndex, columnIndex: locColumnIndex}
            = mapTableColumnName2Idx[tableName][columnName];
         retObj.tableIndex = locTableIndex;
         retObj.columnIndex = locColumnIndex;
      } else {
         // 列名がない場合は追加
         const columnIdx = Object.keys(mapTableColumnName2Idx[tableName]).length;
         mapTableColumnName2Idx[tableName][columnName] = {
            tableIndex: tableIdx,
            columnIndex: columnIdx,
         };
         mapTableColumnIdx2Name[tableIdx][columnIdx] = {
            tableName,
            columnName,
         };
         retObj.tableIndex = tableIdx;
         retObj.columnIndex = columnIdx;
      }
      
      return retObj;
   };
   
   const getTableCoumnName = (tableIndex, columnIndex) => {
      if (Object.prototype.hasOwnProperty.call(mapTableColumnIdx2Name, tableIndex)) {
         if (Object.prototype.hasOwnProperty.call(mapTableColumnIdx2Name[tableIndex], columnIndex)) {
            // {tableName, columnName} オブジェクトを返す
            return mapTableColumnIdx2Name[tableIndex][columnIndex];
         }
      }
      console.error(`存在しない. getTableCoumnName(${tableIndex}, ${columnIndex})`);
   };
   
   // stmtsを更新
   // 1. 順序(depth: トップが0で、元へさかのぼるほど増える)を追加する
   // 2. クエリがないテーブル(＝stmtsにない)を簡単に追加する
   const updateStatements = (stmts, graphTable) => {
      // depthを取得
      const getDepth = (sts, idx) => {
         const curStmt = getStmt(sts, idx);
         if (Object.prototype.hasOwnProperty.call(curStmt, "depth")) {
            return curStmt.depth;
         }
         return -1;
      };
      // depthを設定
      const setDepth = (sts, idx, depth) => {
         const curSt = getStmt(sts, idx);
         curSt["depth"] = depth;
      };
      // stmtを取得、なければ作る
      const getStmt = (sts, idx) => {
         const tableName = mapTableIdx2Name[idx];
         const curSt = sts.filter(s => s.tableName === tableName);
         if (curSt.length > 0) {
            return curSt[0];
         }
         // ないので作る
         while (sts.length <= idx) {
            sts.push({});
         }
         // tableName
         sts[idx]["tableName"] = mapTableIdx2Name[idx];
         // columns.columnName
         if (Object.prototype.hasOwnProperty.call(mapTableColumnName2Idx, tableName)) {
            sts[idx]["columns"] = Object.keys(mapTableColumnName2Idx[tableName]).map(c => ({columnName: c}));
         } else {
            // 存在しない場合(=fromにはあるがselect句で使ってないなど)は、空にしておく
            sts[idx]["columns"] = [];
         }
         return sts[idx];
      };
   
      // stmtsをdeep copy
      const updStmts = JSON.parse(JSON.stringify(stmts));
   
      // トップのdepthを0に設定
      const topTableIdx = mapTableName2Idx[TOP_STMT_TABLE_NAME];
      setDepth(updStmts, topTableIdx, 0);
   
      graphTable.forEach((graph, toIdx) => {
         graph.forEach(fromIdx => {
            const toDepth = getDepth(updStmts, toIdx);
            if (toDepth >= 0) {
               // toに設定されている場合は、+1の値をfromへ設定
               setDepth(updStmts, fromIdx, toDepth + 1);
            } else {
               // 設定されていない場合は、fromを見る
               const fromDepth = getDepth(updStmts, fromIdx);
               if (fromDepth >= 0) {
                  // fromに設定されている場合は、-1の値をtoへ設定
                  setDepth(updStmts, toIdx, fromDepth - 1);
               } else {
                  // どちらにも設定されていない場合は、0と1を設定
                  setDepth(updStmts, fromIdx, 1);
                  setDepth(updStmts, toIdx, 0);
               }
            }
         });
      });
   
      return updStmts;
   };

   return main(stmts);
};

// テーブル名から配列のindexを参照するためのマップを返す
const createTableMapName2Idx = stmts => 
   stmts.reduce((m, v, i) => (
      {...m, [v.tableName]: i}
   ), {});

// 配列のindexからテーブル名を参照するためのマップを返す
const createTableIdx2MapName = stmts =>
   stmts.reduce((m, v, i) => (
      {...m, [i]: v.tableName}
   ), {});

// テーブル名と列名から配列のindexを参照するためのマップを返す
const createTableColumnMapName2Idx = stmts => 
   stmts.reduce((m, v, i) => (
      {
         ...m,
         [v.tableName]: v.columns.reduce((cm, cv, ci) => (
            {...cm, [cv.columnName]: {tableIndex: i, columnIndex: ci}}
         ), {}),
      }
   ), {});

// 配列のindexからテーブル名を参照するためのマップを返す
const createTableColumnIdx2MapName = stmts =>
   stmts.reduce((m, v, i) => (
      {
         ...m,
         [i]: v.columns.reduce((cm, cv, ci) => (
            {...cm, [ci]: {tableName: v.tableName, columnName: cv.columnName}}
         ), {}),
      }
   ), {});


module.exports = {ConnectStmts};
if (process.env.NODE_ENV === "development") {
   // for test
   module.exports = {
      ...module.exports,
      createTableMapName2Idx,
      createTableIdx2MapName,
      createTableColumnMapName2Idx,
      createTableColumnIdx2MapName,
   };
}
