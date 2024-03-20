const { expect } = require('chai');


describe("sample", () => {
    describe("サンプル", () => {
        let a = 1 + 2;
        it("1+2は3", () => {
            expect(a).to.equal(3);
        });
    });

    describe("環境変数確認", () => {
        it("テスト時は、NODE_ENV === development", () => {
            expect(process.env.NODE_ENV).to.equal("development");
        });
    });
});
