import * as vscode from 'vscode';
import { TestRunner } from './actions/TestRunner';
import { Logger } from './infrastructure/Logger';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "vscodecrunch" is now active!');
	Logger.Log("Hi from the logger");


	let disposable = vscode.commands.registerCommand('vscodecrunch.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World from vscodecrunch!');
	});

	context.subscriptions.push(disposable);

	const testRunner = new TestRunner();
	testRunner.watch();

}

export function deactivate() { }
