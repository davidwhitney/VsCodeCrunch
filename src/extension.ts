import * as vscode from 'vscode';
import { CSharpProjectFinder } from './actions/CSharpProjectFinder';
import { DotNetWatch } from './actions/DotNetWatch';
import { Logger } from './infrastructure/Logger';
import { TestResultProcessor } from './actions/TestResultProcessor';
import fs = require('fs');

export async function activate(context: vscode.ExtensionContext) {

	Logger.Log("VsCodeCrunch Enabled");

	const rootPath = vscode.workspace.rootPath || "";
	const tempDir = rootPath + "/.vscodecrunch";

	if (fs.existsSync(tempDir)) {
		fs.rmdirSync(tempDir, { recursive: true });
	}
	fs.mkdirSync(tempDir);

	const testFinder = new CSharpProjectFinder();
	const resultsProcessor = new TestResultProcessor();
	const testRunner = new DotNetWatch(tempDir, resultsProcessor);

	let disposable = vscode.commands.registerCommand('vscodecrunch.forcestart', () => {
		vscode.window.showInformationMessage('Force started.');
	});

	context.subscriptions.push(disposable);

	let projects = await testFinder.execute(rootPath);
	projects = projects.filter(project => !project.includes("_vscodecrunch."));

	Logger.Log("Monitoring Projects:" + projects.join(", "));

	for (let proj of projects) {
		testRunner.watchProject(proj);
	}
}

export function deactivate() { }
