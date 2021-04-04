import { window } from "vscode"
import * as vscode from "vscode";
import * as path from "path";
import { LineCoverage, readCoverageFile } from "./CoverletJsonParser";

export class TestResultProcessor {

    private readonly decorationNone: vscode.TextEditorDecorationType;
    private readonly decorationPass: vscode.TextEditorDecorationType;
    private readonly decorationFail: vscode.TextEditorDecorationType;
    private coverageCache: Map<string, LineCoverage[]>;

    constructor() {
        this.decorationNone = this.getDecorationType("no-gutter");
        this.decorationPass = this.getDecorationType("gutter");
        this.decorationFail = this.getDecorationType("partial-gutter");
        this.coverageCache = new Map<string, LineCoverage[]>();

        vscode.window.onDidChangeVisibleTextEditors((editors) => {
            this.renderGutters(editors);
        });
    }

    public processCoverageFile(coverageFilePath: string) {
        this.coverageCache = readCoverageFile(coverageFilePath);
        this.renderGutters(window.visibleTextEditors);
    }

    private renderGutters(textEditors: vscode.TextEditor[]) {

        textEditors.forEach((textEditor) => {
            const allLineRange = new vscode.Range(0, 0, textEditor.document.lineCount, 999999);
            //textEditor.setDecorations(this.decorationNone, [allLineRange]);
        });

        for (let textEditor of textEditors) {
            const coverageForThisFile = this.coverageCache.get(textEditor.document.fileName) || [];
            if (coverageForThisFile.length === 0) {
                continue;
            }

            const visitedLines = coverageForThisFile.filter(x => x.hits > 0);
            const singleLineRanges = visitedLines.map(line => new vscode.Range(line.lineIndex, 0, line.lineIndex, 99999));

            textEditor.setDecorations(this.decorationPass, singleLineRanges);
        }
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