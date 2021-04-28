import * as fs from "fs";
import { Logger } from "../infrastructure/Logger";
import { TestResultProcessor } from "./TestResultProcessor";
import path = require("path");
import { MonitoredProcess } from "./MonitoredProcess";
import events = require("events");

export class DotNetWatch {

    private _resultProcessor: any;
    private _tempDir: string;

    private get trxPath(): string { return `${this._tempDir}\\Logs.trx`; }

    constructor(tempDir: string, resultsProcessor: TestResultProcessor) {
        this._tempDir = tempDir;
        this._resultProcessor = resultsProcessor;
    }

    public async watchProject(fullProjectPath: string) {
        const projPath = path.dirname(fullProjectPath);
        const filename = path.basename(fullProjectPath);
        await this.watch(projPath, filename);
    }

    public async watch(path: string, project: string) {

        process.env.DOTNET_CLI_UI_LANGUAGE = "en";
        process.env.VSTEST_HOST_DEBUG = "0";

        const fullPath = path + "/" + project;

        fs.watchFile(fullPath, { persistent: false }, () => {
            this.instrumentProjectFile(path, project);
            Logger.Log("Updated Shadow Project due to changes");
        });

        const shadowPath = this.instrumentProjectFile(path, project);

        const command = `dotnet watch`
            + ` --project ${shadowPath}`
            + ` test ${shadowPath}`
            + ` --verbosity:quiet`
            + ` --logger "trx;LogFileName=${this.trxPath}"`
            + ` --collect:"XPlat Code Coverage"`
            + ` --results-directory="${this._tempDir}"`
            + ` -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format=json`
            + ` -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.IncludeTestAssembly=true`;

        const monp = new MonitoredProcess((lines: string[]) => {
            this.onProcessOutput(lines);
        });

        monp.exec(command, path);
    }

    private onProcessOutput(lines: string[]) {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            Logger.Log(`dotnet watch: ${line}`);

            if (line === "watch : Started") {

            }

            if (line === `Results File: ${this.trxPath}`) {

            }

            if (line === `Attachments:` && lines[i + 1].indexOf("coverage.json") != -1) {
                const attachedFile = lines[i + 1].trim();
                this._resultProcessor.processCoverageFile(attachedFile);
            }
        }
    }

    private instrumentProjectFile(path: string, project: string): string {
        const fullPath = `${path}/${project}`;
        const shadowProj = `_vscodecrunch.${project}`;
        const shadowPath = `${path}/${shadowProj}`;

        if (fs.existsSync(shadowPath)) {
            fs.unlinkSync(shadowPath);
        }
        fs.copyFileSync(fullPath, shadowPath);

        if (!this.requiresCoverlet(path, shadowProj)) {
            return shadowPath; // If the project supports coverlet already, just go with it.
        }

        const command = `dotnet add ${shadowProj} package coverlet.collector`;
        MonitoredProcess.execSync(command, path);

        return shadowPath;
    }

    private requiresCoverlet(path: string, project: string) {
        const pathAndFilename = path + "/" + project;
        const contents = fs.readFileSync(pathAndFilename, { encoding: "utf8" });

        if (contents.indexOf("Include=\"coverlet.collector\"") === -1) {
            return true;
        }
        return false;
    }
}