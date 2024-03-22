const TOP_STMT_TABLE_NAME = "__top__";

const Stmt2Ary = stmt => stmtParse({stmt});

const stmtParse = ({name = null, stmt}) => {
    // stmtが配列の場合は、エラーとする
    if (Array.isArray(stmt.ast)) {
        throw new Error("stmt shoud not Array!");
    }

    const stmtParseFn = {
        "select": selectAst,
        "insert": insertAst,
    };

    return stmtParseFn[stmt.ast.type](
        name ? name : {value: TOP_STMT_TABLE_NAME},
        stmt,
        true,   // isTopQuery
    );
};

const selectAst = (name, stmt, isTopQuery = false) => {
    const tableName = name.value;
    const ast = stmt.ast;
    //const tableList = stmt.tableList;
    //const columnList = stmt.columnList;

    // columnsの複数の異なるタイプをここで吸収し、統一する
    const columns = ast.columns.map(c => getFormattedColumnObject(c));

    const fromTableNames = ast.from.map(f => f.as ? f.as : f.table);

    // 列の元テーブルがnullの場合の補完
    columns.forEach(c => {
        // from句が１つしかない場合は、設定する
        c.fromColumns.forEach(cFrom => {
            if (fromTableNames.length === 1) {
                cFrom.tableName = fromTableNames[0];
            }
        });

    });


    // from句のテーブルの中で、唯一持っている列の場合は、設定する


    // fromの中のselectも後で考える
    //const fromAry = fromTableNames;
    const fromAry = [];


    // with
    const withAry = ast.with ? 
        ast.with.map(w => stmtParse({name: w.name, stmt: w.stmt})).flat()
        : [];

    return [
        {
            tableName,
            columns,
            fromTableNames,
            isTopQuery,
        },
        ...fromAry,
        ...withAry,
    ];
};

const insertAst = (name, stmt, isTopQuery = true) => {
    // insertは、topQueryしかないはず
    
    // insert selectにだけ対応
    if (stmt.ast.values.type !== "select") {
        throw new Error(`Unknown stmt.values.type (${stmt.values.type})`);
    }

    // nameをinsert先のテーブルにする
    const tableName = stmt.ast.table[0].as ? stmt.ast.table[0].as : stmt.ast.table[0].table;

    // stmtは、insert selectのselect部を設定
    return selectAst({value: tableName}, {ast: stmt.ast.values}, isTopQuery);
};

// {table, column} の配列を返す
/* eslint-disable key-spacing */
const extractFromExprFn = {
    alter           : extractFromAlter,
    aggr_func       : extractFromAggrFunc,
    any_value       : extractFromAnyValue,
    window_func     : extractFromWindowFunc,
    "array"         : extractFromArray,
    assign          : extractFromAssign,
    binary_expr     : extractFromBinaryExpr,
    case            : extractFromCase,
    cast            : extractFromCast,
    column_ref      : extractFromColumn_ref,
    datatype        : extractFromDatatype,
    extract         : extractFromExtract,
    flatten         : extractFromFlatten,
    fulltext_search : extractFromFulltextSearch,
    function        : extractFromFunction,
    insert          : extractFromInsert,
    interval        : extractFromInterval,
    show            : extractFromShow,
    struct          : extractFromStruct,
    tables          : extractFromTables,
    unnest          : extractFromUnnest,
    "window"        : extractFromWindow,
    "number"        : extractFromNumber,
};
/* eslint-enable key-spacing */
// extractFromExprFnの関数群
/* eslint-disable no-unused-vars */
function unsupport(ex){console.error(`Unsupported expr type! ${ex.type}`);}
function extractFromAlter(expr){unsupport(expr);return [];}
function extractFromAggrFunc(expr){unsupport(expr); return [];}
function extractFromAnyValue(expr){unsupport(expr); return [];}
function extractFromWindowFunc(expr){unsupport(expr); return [];}
function extractFromArray(expr){unsupport(expr); return [];}
function extractFromAssign(expr){unsupport(expr); return [];}
function extractFromBinaryExpr(expr){unsupport(expr); return [];}
function extractFromCase(expr){unsupport(expr); return [];}
function extractFromCast(expr){
    // cast前の情報を引き継ぐ
    return extractFromExprFn[expr.expr.type](expr.expr);
}
function extractFromColumn_ref(expr){
    return [{tableName: expr.table, columnName: expr.column}];
}
function extractFromDatatype(expr){unsupport(expr); return [];}
function extractFromExtract(expr){unsupport(expr); return [];}
function extractFromFlatten(expr){unsupport(expr); return [];}
function extractFromFulltextSearch(expr){unsupport(expr); return [];}
function extractFromFunction(expr){
    console.log(expr);
    return [].concat(...expr.args.value.map(v => extractFromExprFn[v.type](v)));
}
function extractFromInsert(expr){unsupport(expr); return [];}
function extractFromInterval(expr){unsupport(expr); return [];}
function extractFromShow(expr){unsupport(expr); return [];}
function extractFromStruct(expr){unsupport(expr); return [];}
function extractFromTables(expr){unsupport(expr); return [];}
function extractFromUnnest(expr){unsupport(expr); return [];}
function extractFromWindow(expr){unsupport(expr); return [];}
function extractFromNumber(expr){unsupport(expr); return [];}
/* eslint-enable no-unused-vars */

// 列情報を取得
const getFormattedColumnObject = astCol => {
    const fromColumns = extractFromExprFn[astCol.expr.type](astCol.expr);
    const columnName = astCol.as ?
        astCol.as :
        ((astCol.expr.type === "column_ref") ?
            astCol.expr.column :
            `(${astCol.expr.type})`     // 参照されることはないと思う
        )
    ;
    
    return {
        columnName,
        fromColumns,    // fromColumns: {tableName, columnName} の配列
    };
};

module.exports = {Stmt2Ary};
