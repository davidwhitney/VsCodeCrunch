
import { platform } from "os";
import { ChildProcess, exec } from "child_process";
import { Logger } from "../infrastructure/Logger";
import { TestResultProcessor } from "./TestResultProcessor";
import path = require("path");

export class DotNetWatch {

    private _resultProcessor: any;

    constructor(resultsProcessor: TestResultProcessor) {
        this._resultProcessor = resultsProcessor;
    }

    public watchProject(fullProjectPath: string) {
        const projPath = path.dirname(fullProjectPath);
        const filename = path.basename(fullProjectPath);
        this.watch(projPath, filename);
    }

    public watch(path: string, project: string) {

        const command = `dotnet watch test`
            + ` --verbosity:quiet`
            + ` --logger "trx;LogFileName=Logs.trx"`
            + ` --collect:"XPlat Code Coverage"`
            + ` -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.IncludeTestAssembly=true`;

        Logger.Log("Invoking " + command);

        const p = DotNetWatch.exec(command, (err: any, stdout: string) => {

            Logger.Log(err);
            Logger.Log(stdout);

        }, path);


        let startedLine: string[] = [];

        p.stdout.on("data", async (buf: any) => {
            const stdout = String(buf);

            // The string contained in `buf` may contain less or more
            // than one line. But we want to parse lines as a whole.
            // Consequently, we have to join them.
            const lines = [];
            let lastLineStart = 0;
            for (let i = 0; i < stdout.length; i++) {
                const c = stdout[i];
                if (c === "\r" || c === "\n") {
                    startedLine.push(stdout.substring(lastLineStart, i));
                    const line = startedLine.join("");
                    startedLine = [];
                    lines.push(line);
                    if (c === "\r" && stdout[i + 1] === "\n") {
                        i++;
                    }
                    lastLineStart = i + 1;
                }
            }
            startedLine.push(stdout.substring(lastLineStart, stdout.length));

            // Parse the output.
            for (const line of lines) {

                Logger.Log(`dotnet watch: ${line}`);

                /*

                if (line === "watch : Started") {
                    this.testCommands.sendRunningTest({ testName: namespaceForDirectory, isSingleTest: false });
                } else if (line === `Results File: ${trxPath}`) {
                    Logger.Log("Results file detected.");
                    const results = await parseResults(trxPath);
                    this.testCommands.sendNewTestResults({ clearPreviousTestResults: false, testResults: results });
                } else if (line.indexOf(": error ") > -1) {
                    this.testCommands.sendBuildFailed({ testName: namespaceForDirectory, isSingleTest: false });
                }*/
            }
        });


    }


    public static exec(command: string, callback: any, cwd?: string): any {
        // DOTNET_CLI_UI_LANGUAGE does not seem to be respected when passing it as a parameter to the exec
        // function so we set the variable here instead
        process.env.DOTNET_CLI_UI_LANGUAGE = "en";
        process.env.VSTEST_HOST_DEBUG = "0";

        cwd = cwd || process.cwd();
        Logger.Log(cwd);

        const childProcess = exec(this.handleWindowsEncoding(command), { encoding: "utf8", maxBuffer: 5120000, cwd }, callback);

        /*
        if (addToProcessList) {

            Logger.Log(`Process ${childProcess.pid} started`);

            this.processes.push(childProcess);

            childProcess.on("close", (code: number) => {

                const index = this.processes.map((p) => p.pid).indexOf(childProcess.pid);
                if (index > -1) {
                    this.processes.splice(index, 1);
                    Logger.Log(`Process ${childProcess.pid} finished`);
                }
            });
        }*/

        return childProcess;
    }

    private static isWindows: boolean = platform() === "win32";

    private static handleWindowsEncoding(command: string): string {
        return this.isWindows ? `chcp 65001 | ${command}` : command;
    }
}