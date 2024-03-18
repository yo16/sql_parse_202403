const { Parser } = require("node-sql-parser");

const Stmt2Ary = require("./stmt2ary.js");
const ConnectStmts = require("./connectStmts.js");

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
        console.error("Error");
        console.error("e.message");
    }
    if (!stmt) {
        return null;
    }

    // array化
    const stmtArray = Stmt2Ary(stmt);

    // ConnectStmts
    const stmtsObj = ConnectStmts(stmtArray);

    return stmtsObj;
};

module.exports = {Sql2Ary};
