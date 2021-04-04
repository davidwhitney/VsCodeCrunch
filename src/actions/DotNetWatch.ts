import { platform } from "os";
import * as fs from "fs";
import { exec } from "child_process";
import { Logger } from "../infrastructure/Logger";
import { TestResultProcessor } from "./TestResultProcessor";
import path = require("path");
import { MonitoredProcess } from "./MonitoredProcess";

export class DotNetWatch {

    private _resultProcessor: any;
    private _tempDir: string;

    constructor(tempDir: string, resultsProcessor: TestResultProcessor) {
        this._tempDir = tempDir;
        this._resultProcessor = resultsProcessor;
    }

    public watchProject(fullProjectPath: string) {
        const projPath = path.dirname(fullProjectPath);
        const filename = path.basename(fullProjectPath);
        this.watch(projPath, filename);
    }

    public watch(path: string, project: string) {

        process.env.DOTNET_CLI_UI_LANGUAGE = "en";
        process.env.VSTEST_HOST_DEBUG = "0";

        this.ensureCoverletCollectorInstalled(path, project);

        const trxPath = `${this._tempDir}\\Logs.trx`;

        const command = `dotnet watch test`
            + ` --verbosity:quiet`
            + ` --logger "trx;LogFileName=${trxPath}"`
            + ` --collect:"XPlat Code Coverage"`
            + ` --results-directory="${this._tempDir}"`
            + ` -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format=json`
            + ` -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.IncludeTestAssembly=true`;

        const monp = new MonitoredProcess((lines: string[]) => {
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                Logger.Log(`dotnet watch: ${line}`);

                if (line === "watch : Started") {

                }

                if (line === `Results File: ${trxPath}`) {

                }

                if (line === `Attachments:` && lines[i + 1].indexOf("coverage.json") != -1) {
                    const attachedFile = lines[i + 1].trim();
                    this._resultProcessor.processCoverageFile(attachedFile);
                }
            }
        });

        monp.exec(command, path);
    }

    private ensureCoverletCollectorInstalled(path: string, project: string) {
        const pathAndFilename = path + "/" + project;
        const contents = fs.readFileSync(pathAndFilename, { encoding: "utf8" });

        if (contents.indexOf("Include=\"coverlet.collector\"") === -1) {
            const command = "dotnet add package coverlet.collector";
            MonitoredProcess.exec(command, path);
        }
    }
}