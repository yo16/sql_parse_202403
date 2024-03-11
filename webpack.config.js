const path = require('path');

const isProd = process.argv.includes('production');
const isTest = process.argv.includes('test');
const subDir = isProd ? 'output/prod' : isTest ? 'output/test' : 'output/dev';
const outputPath = path.join(__dirname, subDir);

module.exports = {
    entry: "./src/index.js",
    output: {
        path: outputPath,
        devtoolModuleFilenameTemplate: info => path.resolve(__dirname, info.resourcePath),
    },
};
