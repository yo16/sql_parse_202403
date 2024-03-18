const { Parser } = require("node-sql-parser");

const Stmt2Ary = require("./stmt2ary.js");

const parser = new Parser();

const Sql2Ary = (query, database) => {
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

    // array化
    let retArray = [];
    if (stmt) {
        retArray = Stmt2Ary(stmt);
    }
    return retArray;
};

module.exports = {Sql2Ary};
