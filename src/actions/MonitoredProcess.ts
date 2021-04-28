import { platform } from "os";
import { ChildProcess, exec, execSync } from "child_process";
import { Logger } from "../infrastructure/Logger";
import { readStdOut } from "./StdOutParser";

export class MonitoredProcess {

    private _onOutputAvailableCallback: CallableFunction;

    constructor(onOutputAvailableCallback: CallableFunction) {
        this._onOutputAvailableCallback = onOutputAvailableCallback || (() => { });
    }

    public exec(command: string, cwd?: string): any {
        const proc = MonitoredProcess.exec(command, cwd);

        proc.stdout?.on("data", async (buf: any) => {
            const lines = readStdOut(buf);
            this._onOutputAvailableCallback(lines);
        });
    }

    public static exec(command: string, cwd?: string): ChildProcess {
        cwd = cwd || process.cwd();
        const callback = (err: any, stdout: string) => { Logger.Log(err); };

        const childProcess = exec(MonitoredProcess.handleWindowsEncoding(command), { encoding: "utf8", maxBuffer: 5120000, cwd }, callback);

        if (childProcess === null || childProcess.stdout === null) {
            throw new Error("Couldn't start process");
        }

        return childProcess;
    }

    public static execSync(command: string, cwd?: string) {
        cwd = cwd || process.cwd();
        execSync(MonitoredProcess.handleWindowsEncoding(command), { encoding: "utf8", maxBuffer: 5120000, cwd });
    }

    private static isWindows: boolean = platform() === "win32";

    private static handleWindowsEncoding(command: string): string {
        return this.isWindows ? `chcp 65001 | ${command}` : command;
    }
}
