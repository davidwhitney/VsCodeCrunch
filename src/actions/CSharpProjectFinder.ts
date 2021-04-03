import { glob } from "glob";

export class CSharpProjectFinder {
    public async execute(path: string): Promise<string[]> {

        return new Promise((res, rej) => {
            glob(path + '/**/*.csproj', (err, matches) => {
                if (err) {
                    rej(err);
                }
                res(matches);
            });
        });
    }
}