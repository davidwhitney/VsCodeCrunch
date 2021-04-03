import * as vscode from 'vscode';
import { CSharpProjectFinder } from './actions/CSharpProjectFinder';
import { DotNetWatch } from './actions/DotNetWatch';
import { Logger } from './infrastructure/Logger';
import { TestResultProcessor } from './actions/TestResultProcessor';
import fs = require('fs');

export async function activate(context: vscode.ExtensionContext) {

	Logger.Log("VsCodeCrunch Enabled");

	const testFinder = new CSharpProjectFinder();
	const resultsProcessor = new TestResultProcessor();
	const testRunner = new DotNetWatch(resultsProcessor);

	let disposable = vscode.commands.registerCommand('vscodecrunch.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from vscodecrunch!');
	});

	context.subscriptions.push(disposable);

	const rootPath = vscode.workspace.rootPath || "";
	const tempDir = rootPath + "/.vscodecrunch";

	if (fs.existsSync(tempDir)) {
		fs.rmdirSync(tempDir);
	}
	fs.mkdirSync(tempDir);


	const projects = await testFinder.execute(rootPath);

	for (let proj of projects) {
		testRunner.watchProject(proj);
	}
}

export function deactivate() { }
