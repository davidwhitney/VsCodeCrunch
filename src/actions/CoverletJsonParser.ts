
import * as fs from "fs";

export type LineCoverage = { lineNo: number, hits: number; lineIndex: number };

// Sorry mum.

export function readCoverageFile(coverageFilePath: string): Map<string, LineCoverage[]> {
    const contents = fs.readFileSync(coverageFilePath, { encoding: "utf8" });
    const coverageResults = JSON.parse(contents);

    const assemblyNames = Object.getOwnPropertyNames(coverageResults);

    const coverageByFile = new Map<string, any>();

    for (let assembly of assemblyNames) {

        const fileNames = Object.getOwnPropertyNames(coverageResults[assembly]);

        for (let file of fileNames) {

            const lineCoverageInFile: LineCoverage[] = [];

            for (let type of Object.getOwnPropertyNames(coverageResults[assembly][file])) {

                for (let method of Object.getOwnPropertyNames(coverageResults[assembly][file][type])) {

                    const lines = coverageResults[assembly][file][type][method]["Lines"];
                    const asPairs = Object.entries(lines);

                    for (let pair of asPairs) {

                        const lineNo = parseInt(pair[0]);
                        const hits = parseInt(pair[1] + "");

                        lineCoverageInFile.push({ lineNo, hits, lineIndex: lineNo - 1 });
                    }
                }
            }

            coverageByFile.set(file, lineCoverageInFile);

        }

    }

    return coverageByFile;
}
