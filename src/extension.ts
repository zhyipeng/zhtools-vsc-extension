// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { PythonExtension } from '@vscode/python-extension';
import * as vscode from 'vscode';
import * as cp from 'child_process';
import path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "zhtools" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('zhtools.generateAllExpression', async () => {
		const api = await PythonExtension.api();
		const pythonPath = api.environments.getActiveEnvironmentPath().path;
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		const content = editor.document.getText();
		const scriptPath = path.join(context.extensionPath, 'dist', 'scripts', 'gen_all.py');
		const process = cp.spawn(pythonPath ?? 'python', [scriptPath, content]);
		let result = '';
		process.stdout.on('data', (data) => {
			result += data.toString();
		});
		process.stderr.on('data', (data) => {
			vscode.window.showErrorMessage(`Error: ${data}`);
		});

		process.on('close', (code) => {
			if (code !== 0) {
				vscode.window.showErrorMessage(`Process exited with code ${code}`);
				return;
			}
			const pattern = /__all__\s*=\s*\[.*?\]/g;
			let newContent = content.replace(pattern, result);
			if (newContent === content) {
				newContent = result + '\n' + newContent
			}
			editor.edit(editBuilder => {
				const range = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(content.length));
				editBuilder.replace(range, newContent);
			});
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
