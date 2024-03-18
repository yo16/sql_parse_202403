const { expect } = require('chai');


describe("sample", () => {
    describe("サンプル", () => {
        let a = 1 + 2;
        it("1+2は3", () => {
            expect(a).to.equal(3);
        });
    });
});
