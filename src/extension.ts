'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Tab-Indent Space-Align activated.');
	
	// Insert tab or spaces depending on position of cursor in line.
	// Perform a tab and space preserving block indent over a selection.
	let indent = vscode.commands.registerCommand(
		'Alignment Preserving Indent',
		() =>
	{
		let editor = vscode.window.activeTextEditor;
		if(!editor) {
			return;
		}
		
		editor.edit((edit: vscode.TextEditorEdit) => {
			if(!editor) {
				return;
			}
			
			let document = editor.document;
			let tabSize = editor.options.tabSize as number;
			let tab = editor.options.insertSpaces
			        ? ' '.repeat(tabSize)
			        : '\t';
			
			editor.selections.forEach(it => {
				// Insert tab or spaces if the selection is empty.
				if(it.isEmpty) {
					// Insert tab if the line contains only tab characters prior
					// to the cursor.
					let line = document.lineAt(it.start.line).text;
					let indent = line.search(/[^\t]|$/);
					if(it.start.character <= indent) {
						edit.insert(it.active, tab);
					} else {
						// TODO: Determine tab-stops from surrounding lines.
						//       For now, pad to next multiple of tabSize.
						let used = (it.start.character - indent) % tabSize;
						edit.insert(it.active, ' '.repeat(tabSize - used));
					}
				// Otherwise perform a block indent.
				} else {
					// Include last line of selection if only one line is
					// selected or if a character on the last line is selected.
					let line = it.start.line;
					let end = it.end.line;
					if(end === line || it.end.character > 0) {
						++end;
					}
					// Insert a leading tab into each line of the selection.
					for(; line < end; ++line) {
						edit.replace(new vscode.Position(line, 0), tab);
					}
				}
			});
		});
	});
	context.subscriptions.push(indent);
	
	// Perform a tab and space preserving block outdent.
	let outdent = vscode.commands.registerCommand(
		'Alignment Preserving Outdent',
		() =>
	{
		let editor = vscode.window.activeTextEditor;
		if(!editor) {
			return;
		}
		
		editor.edit((edit: vscode.TextEditorEdit) => {
			if(!editor) {
				return;
			}
			
			let document = editor.document;
			let tab = editor.options.insertSpaces
			        ? ' '.repeat(editor.options.tabSize as number)
			        : '\t';
			
			editor.selections.forEach(it => {
				// Include last line of selection if only one line is selected
				// or if a character on the last line is selected.
				let line = it.start.line;
				let end = it.end.line;
				if(end === line || it.end.character > 0) {
					++end;
				}
				// Remove a leading tab from each line of the selection.
				for(; line < end; ++line) {
					if(document.lineAt(line).text.startsWith(tab)) {
						edit.delete(new vscode.Range(line, 0, line, tab.length));
					}
				}
			});
		});
	});
	context.subscriptions.push(outdent);
	
	// Copy indentation and alignment from previous line.
	// Preserves tabs for indentation and spaces for alignment.
	let newline = vscode.commands.registerCommand(
		'Alignment Preserving Newline',
		() =>
	{
		let editor = vscode.window.activeTextEditor;
		if(!editor) {
			return;
		}
		
		editor.edit((edit: vscode.TextEditorEdit) => {
			if(!editor) {
				return;
			}
			
			let document = editor.document;
			editor.selections.forEach(it => {
				// Retrieve leading whitespace from current line.
				let text = document.lineAt(it.active.line).text;
				let prefix = text.substring(0, text.search(/\S|$/));
				
				// TODO: Auto-indent if surrounded by braces etc.
				edit.delete(it);
				edit.insert(it.start, '\n' + prefix);
			});
		});
	});
	context.subscriptions.push(newline);
}
