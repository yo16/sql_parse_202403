const { expect } = require('chai');
const Sql2Ary = require("../src/sql2ary").default;

describe("sql2ary", () => {
    describe("main", () => {
        it("sample test", () => {
            const res = Sql2Ary(1,2);
            const exp = [1,2,3];
            
            expect(res.length)
                .to.equal(exp.length);
            res.forEach((r, i) => {
                expect(r)
                    .to.equal(exp[i]);
            });
        });
    });
});
