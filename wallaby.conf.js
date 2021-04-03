module.exports = function (wallaby) {

    return {

        files: [
            '/**/*.[tj]s',
            '!/**/*.test.[tj]s',
            '!/node_modules/**/*.[tj]s',
        ],

        tests: [
            '/**/*.test.[tj]s',
            '/test/*.test.[tj]s',
            '!/node_modules/**/*.[tj]s'
        ],

        env: { type: 'node' },
        testFramework: 'jest',
    }
};