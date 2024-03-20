const { expect } = require('chai');
//const ConnectStmts, createMapName2Idx = require("../src/connectStmts.js");
const {
    createTableMapName2Idx,
    createTableIdx2MapName,
    createTableColumnMapName2Idx,
    createTableColumnIdx2MapName,
} = require("../src/connectStmts.js");


describe("ツール関数", () => {
    const statements = [
        {
            tableName: "a",
            columns: [
                {columnName: "a1"},
                {columnName: "a2"},
            ],
        }, {
            tableName: "b",
            columns: [
                {columnName: "b1"},
                {columnName: "b2"},
            ],
        }, {
            tableName: "c",
            columns: [
                {columnName: "c1"},
            ],
        }
    ];

    describe("createTableMapName2Idx", () => {
        const ret = createTableMapName2Idx(statements);
        it("aのindexは0", () => {
            expect(ret["a"]).to.equal(0);
        });
        it("bのindexは1", () => {
            expect(ret["b"]).to.equal(1);
        });
        it("cのindexは2", () => {
            expect(ret["c"]).to.equal(2);
        });
    });

    describe("createTableIdx2MapName", () => {
        const ret = createTableIdx2MapName(statements);
        it("index=0はa", () => {
            expect(ret[0]).to.equal("a");
        });
        it("index=1はb", () => {
            expect(ret[1]).to.equal("b");
        });
        it("index=2はc", () => {
            expect(ret[2]).to.equal("c");
        });
    });

    describe("createTableColumnMapName2Idx", () => {
        const ret = createTableColumnMapName2Idx(statements);

        it("retはobject", () => {
            expect(typeof ret).to.equal("object");
        });

        it("a.a1のtableIndexは0", () => {
            expect(ret["a"]["a1"].tableIndex).to.equal(0);
        });
        it("a.a1のcolumnIndexは0", () => {
            expect(ret["a"]["a1"].columnIndex).to.equal(0);
        });
        it("a.a2のtableIndexは0", () => {
            expect(ret["a"]["a2"].tableIndex).to.equal(0);
        });
        it("a.a2のcolumnIndexは0", () => {
            expect(ret["a"]["a2"].columnIndex).to.equal(1);
        });
        
        it("b.b1のtableIndexは1", () => {
            expect(ret["b"]["b1"].tableIndex).to.equal(1);
        });
        it("b.b1のcolumnIndexは0", () => {
            expect(ret["b"]["b1"].columnIndex).to.equal(0);
        });
        it("b.b2のtableIndexは1", () => {
            expect(ret["b"]["b2"].tableIndex).to.equal(1);
        });
        it("b.b2のcolumnIndexは1", () => {
            expect(ret["b"]["b2"].columnIndex).to.equal(1);
        });
        
        it("c.c1のtableIndexは2", () => {
            expect(ret["c"]["c1"].tableIndex).to.equal(2);
        });
        it("c.c1のcolumnIndexは0", () => {
            expect(ret["c"]["c1"].columnIndex).to.equal(0);
        });
    });

    describe("createTableColumnIdx2MapName", () => {
        const ret = createTableColumnIdx2MapName(statements);

        it("retはobject", () => {
            expect(typeof ret).to.equal("object");
        });

        it("index=0,0 tableNameはa", () => {
            expect(ret[0][0].tableName).to.equal("a");
        });
        it("index=0,0 columnNameはa1", () => {
            expect(ret[0][0].columnName).to.equal("a1");
        });
        it("index=0,1 tableNameはa", () => {
            expect(ret[0][1].tableName).to.equal("a");
        });
        it("index=0,1 columnNameはa2", () => {
            expect(ret[0][1].columnName).to.equal("a2");
        });

        it("index=1,0 tableNameはb", () => {
            expect(ret[1][0].tableName).to.equal("b");
        });
        it("index=1,0 columnNameはb1", () => {
            expect(ret[1][0].columnName).to.equal("b1");
        });
        it("index=1,1 tableNameはb", () => {
            expect(ret[1][1].tableName).to.equal("b");
        });
        it("index=1,1 columnNameはb2", () => {
            expect(ret[1][1].columnName).to.equal("b2");
        });

        it("index=2,0 tableNameはc", () => {
            expect(ret[2][0].tableName).to.equal("c");
        });
        it("index=2,0 columnNameはc1", () => {
            expect(ret[2][0].columnName).to.equal("c1");
        });
    });
});



describe("connectStmts", () => {
});
