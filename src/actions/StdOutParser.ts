export function readStdOut(buf: any): string[] {

    let startedLine: string[] = [];
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
    return lines;
}