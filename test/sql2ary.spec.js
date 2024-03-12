const { expect } = require('chai');
const Sql2Ary = require("../src/sql2ary").default;
//import expect from "chai";
//import Sql2Ary from "../src/sql2ary";

// https://yucatio.hatenablog.com/entry/2020/02/06/085930
const zip = (...arrays) => {
    const length = Math.min(...(arrays.map(arr => arr.length)))
    return new Array(length).fill().map((_, i) => arrays.map(arr => arr[i]))
}

const validateTableElm = (res, exp) => {
    // table
    expect(res.length)
        .to.equal(exp.length);
    zip(res, exp).forEach(elm => {
        const r = elm[0];
        const e = elm[1];
        expect(r).to.have.property("tableName");
        expect(r).to.have.property("columns");
        expect(r).to.have.property("fromTableNames");

        // tableName
        expect(r.tableName).to.equal(e.tableName);

        // columns
        expect(r.columns.length).to.equal(e.columns.length);
        zip(r.columns, e.columns).forEach((elm1) => {
            const rc = elm1[0];
            const ec = elm1[1];
            expect(rc).to.have.property("expr");
            expect(rc.expr).to.have.property("type");
            expect(rc.expr).to.have.property("table");
            expect(rc.expr).to.have.property("column");
            expect(rc.expr.type).to.equal(ec.expr.type);
            expect(rc.expr.table).to.equal(ec.expr.table);
            expect(rc.expr.column).to.equal(ec.expr.column);
        });

        // fromTableNames
        expect(r.fromTableNames.length).to.equal(e.fromTableNames.length);
        zip(r.fromTableNames, e.fromTableNames).forEach(elm1 => {
            const rt = elm1[0];
            const et = elm1[1];
            expect(rt).to.equal(et);
        });
    });
}

describe("sql2ary", () => {
    describe("main", () => {
        it("sample test", () => {
            const res = Sql2Ary("select t1.col1 from t1 where t1.col2=\"abc\"");
            //console.log({res});
            const exp = [{
                tableName: "__top__",
                columns: [
                    {
                        expr: {
                            type: "column_ref",
                            table: "t1",
                            column: "col1",
                        },
                    },
                ],
                fromTableNames: [
                    "t1",
                ],
            },];
            
            validateTableElm(res, exp);
        });
    });
});
