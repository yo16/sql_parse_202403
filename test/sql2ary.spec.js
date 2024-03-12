const { expect } = require('chai');
const Sql2Ary = require("../src/sql2ary").default;
//import expect from "chai";
//import Sql2Ary from "../src/sql2ary";

// https://yucatio.hatenablog.com/entry/2020/02/06/085930
const zip = (...arrays) => {
    const length = Math.min(...(arrays.map(arr => arr.length)))
    return new Array(length).fill().map((_, i) => arrays.map(arr => arr[i]))
}

// 同一であることの確認
// オブジェクトは完全一致でなく、expが持つkeyのvalueが一致することを確認する(他のkeyがある可能性がある)
const validateElm = (test, exp) => {
    if (exp == null) {
        it("nullであること", () => {
            expect(test).to.be.null;
        })
    } else if (Array.isArray(exp)) {
        validateAry(test, exp);
    } else if (typeof exp === "object") {
        validateObj(test, exp);
    } else {
        // 単純比較
        // 数値か文字列を想定
        it("値が一致すること", () => {
            expect(test).to.equal(exp);
        });
    }
    
}

const validateAry = (test, exp) => {
    it("配列であること", () => {
        expect(test).to.be.an.instanceOf(Array);
    });
    it("要素数が一致すること", () => {
        expect(test.length).to.equal(exp.length);
    });
    // 各要素が一致すること
    exp.forEach( (e, i) => {
        validateElm(test[i], e);
    });
}

const validateObj = (test, exp) => {
    // Keyの一致(expが持つキーを全部持っている)
    it("Keyが一致すること", () => {
        expect(test).to.include.all.keys(...Object.keys(exp));
    });

    // 値が一致
    Object.keys(exp).map( k => validateElm(test[k], exp[k]));
}

describe("sql2ary", () => {
    describe("１つのテーブルから読んでSelectする場合", () => {
        const res = Sql2Ary("select t1.col1 from t1 where t1.col2=\"abc\"");
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
        
        validateElm(res, exp);
    });

    describe("with句が１つある場合", () => {
        const res = Sql2Ary(
            "with t2 as (" +
                "select " +
                    "t1.id as id, name " +
                "from t1" + 
            ") select t2.col1 from t2, t3 where t2.id=t3.id"
        );
        const exp = [{
            tableName: "__top__",
            columns: [
                {
                    as: null,
                    expr: {
                        type: "column_ref",
                        table: "t2",
                        column: "col1",
                    },
                },
            ],
            fromTableNames: [
                "t2",
                "t3",
            ],
        },
        {
            tableName: "t2",
            columns: [
                {
                    as: "id",
                    expr: {
                        type: "column_ref",
                        table: "t1",
                        column: "id",
                    }
                },
                {
                    as: null,
                    expr: {
                        type: "column_ref",
                        table: null,
                        column: "name",
                    }
                },
            ]
        }
    ];
        
        validateElm(res, exp);
    })
});
