import { Logger } from "../infrastructure/Logger";
import * as fs from "fs";
import { window } from "vscode"
import * as vscode from "vscode";
import * as path from "path";

type LineCoverage = { lineNo: number, hits: number; lineIndex: number };

export class TestResultProcessor {

    private readonly decorationNone: vscode.TextEditorDecorationType;
    private readonly decorationPass: vscode.TextEditorDecorationType;
    private readonly decorationFail: vscode.TextEditorDecorationType;

    constructor() {
        this.decorationNone = this.getDecorationType("no-gutter");
        this.decorationPass = this.getDecorationType("gutter");
        this.decorationFail = this.getDecorationType("partial-gutter");
    }

    public processCoverageFile(coverageFilePath: string) {
        Logger.Log("Yes, found file!");

        const coverage = this.readCoverageFile(coverageFilePath);

        const textEditors = window.visibleTextEditors;

        textEditors.forEach((textEditor) => {
            // Remove all decorations first to prevent graphical issues
        });

        for (let textEditor of textEditors) {

            const coverageForThisFile = coverage.get(textEditor.document.fileName) || [];
            if (coverageForThisFile.length === 0) {
                continue;
            }

            const visitedLines = coverageForThisFile.filter(x => x.hits > 0);
            const singleLineRanges = visitedLines.map(line => new vscode.Range(line.lineIndex, 0, line.lineIndex, 99999));

            textEditor.setDecorations(
                this.decorationPass,
                singleLineRanges
            );

        }

    }


    private readCoverageFile(coverageFilePath: string): Map<string, LineCoverage[]> {
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


    private getDecorationType(state: string): vscode.TextEditorDecorationType {
        return vscode.window.createTextEditorDecorationType(
            {
                light:
                {
                    gutterIconPath: path.join(__dirname, '..', 'resources', `${state}-icon-light.svg`),
                    gutterIconSize: '85%',
                },
                dark:
                {
                    gutterIconPath: path.join(__dirname, '..', 'resources', `${state}-icon-dark.svg`),
                    gutterIconSize: '85%'
                }
            });
    }
}