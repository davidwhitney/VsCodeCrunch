import * as fs from "fs";
export type LineCoverage = { lineNo: number, hits: number; lineIndex: number };

// The underlying data returned from the coverage.json file is a messy nested
// behemoth. This is about as nice as it gets. Sorry! :)

export function readCoverageFile(coverageFilePath: string): Map<string, LineCoverage[]> {
    const contents = fs.readFileSync(coverageFilePath, { encoding: "utf8" });
    const coverageResults = JSON.parse(contents);
    return readCoverage(coverageResults);
}

export function readCoverage(coverageResults: any): Map<string, LineCoverage[]> {

    const assemblyCoverageData = [coverageResults].map(cr => {
        return Object.getOwnPropertyNames(cr).map(name => coverageResults[name]);
    }).flat();

    const fileCoverageData = assemblyCoverageData.map(assembly => {
        return Object.getOwnPropertyNames(assembly).map(file => { return { file: file, data: assembly[file] }; });
    }).flat();

    const fileCoverageDataByLine = new Map<string, any>();

    fileCoverageData.forEach(coverageData => {
        let { file, data } = coverageData;
        fileCoverageDataByLine.set(file, fileToLineCoverage(data));
    });

    return fileCoverageDataByLine;
}

function fileToLineCoverage(coverageForAllTypesInFile: any) {
    let lineCoverageInFile: LineCoverage[] = [];
    const typeNames = Object.getOwnPropertyNames(coverageForAllTypesInFile);

    for (let type of typeNames) {

        const methodsData = coverageForAllTypesInFile[type];
        const methodNames = Object.getOwnPropertyNames(methodsData);

        const linesInThisType = methodNames.map(method => methodsData[method]["Lines"]);
        const typeCoverageData = linesInThisType.map(line => methodToLineCoverage(line)).flat();
        lineCoverageInFile.push(...typeCoverageData);
    }

    return lineCoverageInFile;
}

function methodToLineCoverage(lines: any) {
    return Object.entries(lines).map(pair => {
        // Because of course, line numbers are strings.
        const lineNo = parseInt(pair[0]);
        const hits = pair[1] as number;

        return { lineNo, hits, lineIndex: lineNo - 1 }
    });
}