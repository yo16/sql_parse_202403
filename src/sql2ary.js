const { Parser } = require("node-sql-parser");

const { Stmt2Ary } = require("./stmt2ary.js");
const { ConnectStmts } = require("./connectStmts.js");

const parser = new Parser();

const Sql2Ary = (query, database = "BigQuery") => {
    // ast化(stmt化)
    let stmt = {};
    try {
        const opt = {
            database,
        };
        const {ast, tableList, columnList} = parser.parse(query, opt);
        stmt = {ast, tableList, columnList};
    } catch(e) {
        console.error("Error at Parser.parse().");
        console.error("e.message");
        throw new Error(`Error in Parsing-Process: ${e.message}`);
    }
    if (!stmt) {
        return null;
    }

    // array化
    let stmtArray = null;
    try {
        if (Array.isArray(stmt)) {
            stmtArray = [];
            stmt.forEach(s => {
                const one_stmtArray = Stmt2Ary(s);
                // 全部単純に結合する
                // ★ todo: 同じテーブル名は、マージする？
                // とりあえず１つのクエリのみを対象とする前提でおくが
                // 万が一複数になっても落ちないようにこの暫定対応としておく
                stmtArray = stmtArray.concat(one_stmtArray);
            });
        } else {
            stmtArray = Stmt2Ary(stmt);
        }
    } catch(e) {
        console.error("Error at Stmt2Ary().");
        console.error(e.message);
        throw new Error(`Error in Arraying-Process: ${e.message}`);
    }

    // ConnectStmts
    let stmtsObj = null;
    try {
        stmtsObj = ConnectStmts(stmtArray);
    } catch(e) {
        console.error("Error at ConnectStmts().");
        console.error(e.message);
        throw new Error(`Error in Connecting-Process: ${e.message}`);
    }

    return stmtsObj;
};

module.exports = {Sql2Ary};
