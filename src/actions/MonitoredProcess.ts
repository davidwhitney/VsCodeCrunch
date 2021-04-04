import { platform } from "os";
import { exec } from "child_process";
import { Logger } from "../infrastructure/Logger";
import { readStdOut } from "./StdOutParser";

export class MonitoredProcess {

    private _onOutputAvailableCallback: CallableFunction;

    constructor(onOutputAvailableCallback: CallableFunction) {
        this._onOutputAvailableCallback = onOutputAvailableCallback || (() => { });
    }

    public exec(command: string, cwd?: string): any {
        const childProcess = MonitoredProcess.exec(command, cwd);

        if (childProcess === null || childProcess.stdout === null) {
            throw new Error("Couldn't start process");
        }

        childProcess.stdout.on("data", async (buf: any) => {
            const lines = readStdOut(buf);
            this._onOutputAvailableCallback(lines);
        });
    }

    public static exec(command: string, cwd?: string): any {
        cwd = cwd || process.cwd();
        const callback = (err: any, stdout: string) => { Logger.Log(err); };

        const childProcess = exec(MonitoredProcess.handleWindowsEncoding(command), { encoding: "utf8", maxBuffer: 5120000, cwd }, callback);

        if (childProcess === null || childProcess.stdout === null) {
            throw new Error("Couldn't start process");
        }

        return childProcess;
    }

    private static isWindows: boolean = platform() === "win32";

    private static handleWindowsEncoding(command: string): string {
        return this.isWindows ? `chcp 65001 | ${command}` : command;
    }
}
