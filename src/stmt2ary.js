
const Stmt2Ary = stmt => stmtParse({stmt});

const stmtParse = ({name = null, stmt}) => {
    const stmtParseFn = {
        "select": selectAst,
    };

    return stmtParseFn[stmt.ast.type](
        name ? name : {value: "__top__"},
        stmt,
    );
};

const selectAst = (name, stmt) => {
    const tableName = name.value;
    const ast = stmt.ast;
    //const tableList = stmt.tableList;
    //const columnList = stmt.columnList;


    const fromTableNames = ast.from.map(f => f.as ? f.as : f.table);
    // fromの中のselectも後で考える
    //const fromAry = fromTableNames;
    const fromAry = [];


    // with
    const withAry = ast.with ? 
        ast.with.map(w => stmtParse({name: w.name, stmt: w.stmt})).flat()
        : [];

    return [
        {
            tableName,
            fromTableNames,
            columns: ast.columns,
        },
        ...fromAry,
        ...withAry,
    ];
};

module.exports = Stmt2Ary;
