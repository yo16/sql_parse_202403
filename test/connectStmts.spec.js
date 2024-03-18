const { expect } = require('chai');
//const ConnectStmts, createMapName2Idx = require("../src/connectStmts.js");
const {createMapName2Idx} = require("../src/connectStmts.js");


describe("createMapName2Idx", () => {
    describe("サンプル", () => {
        const ret = createMapName2Idx([1,2,3]);
        expect(ret).to.equal(3);
    });
});


