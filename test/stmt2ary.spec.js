const { expect } = require('chai');
const { Parser } = require("node-sql-parser");
const { Stmt2Ary } = require("../src/stmt2ary");

const parser = new Parser();

describe("Stmt2Ary", () => {
    const opt = {
        database: "BigQuery",
    };

    describe("query1", () => {
        const query = "select t1.col1 from t1 where t1.col2=\"a\"";
        const stmt = parser.parse(query, opt);
        const ret = Stmt2Ary(stmt);

        it("length==1", () => {
            expect(ret.length).to.equal(1);
        });
    });

    describe("query2", () => {
        const query = 
        "with t2 as (" +
            "select " +
                "id, t1.name, col1 " +
            "from t1" + 
        ") select t2.col1 from t2, t3 where t2.id=t3.id";
        const stmt = parser.parse(query, opt);
        const ret = Stmt2Ary(stmt);

        it("length==2, t3は含まれない", () => {
            expect(ret.length).to.equal(2);
        });
    });

    describe("query3", () => {
        const query = "with t1 as (select id, name,col1, col2 from t01), "
            + "t2 as (select t02.id, name from t02) "
            + "select t1.col1 from t1, t2 where t1.id=t2.id";
        const stmt = parser.parse(query, opt);
        const ret = Stmt2Ary(stmt);

        it("length==3", () => {
            expect(ret.length).to.equal(3);
        });
    });

    describe("query4", () => {
        const query = "with t1 as (select id, name,col1, col2 from t01), "
            +"t2 as (select t02.id, name from t02)" 
            + " select t1.col1 from t1, t2,(select id, name from t03) as t3 where t1.id=t2.id and t1.id=t3.id";
        const stmt = parser.parse(query, opt);
        const ret = Stmt2Ary(stmt);

        it("length==3, 内部にあっても含まれない", () => {
            expect(ret.length).to.equal(3);
        });
    });

    describe("query5", () => {
        const query = "select col1 from t1;";
        const stmt = parser.parse(query, opt);

        it("セミコロンがあると空のができるから、そのまま突っ込むとエラーになる", () => {
            expect(() => Stmt2Ary(stmt)).to.throw(Error);
        });
    });

    describe("insert1", () => {
        const query = "insert t2 select col1 from t1";
        const stmt = parser.parse(query, opt);
        const ret = Stmt2Ary(stmt);

        it("１件", () => {
            expect(ret.length).to.equal(1);
        });
    });

    describe("from句でasでリネーム", () => {
        const query = "select a.col1 from tableA as a";
        const stmt = parser.parse(query, opt);
        const ret = Stmt2Ary(stmt);

        it("１件", () => {
            expect(ret.length).to.equal(1);
        });
        it("col1の元テーブルがリネーム前のテーブル名", () => {
            expect(ret[0].columns[0].fromColumns[0].tableName).to.equal("tableA");
        });
        it("fromテーブルがリネーム前のテーブル名", () => {
            expect(ret[0].fromTableNames[0]).to.equal("tableA");
        });

    })
});
