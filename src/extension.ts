import { window, workspace, Range, Position } from "vscode";

import type { ExtensionContext, TextEditor, DecorationOptions } from "vscode";

const decorationType = window.createTextEditorDecorationType({
  backgroundColor: "red",
  border: "1px solid white",
});

const decorateFile = (editor: TextEditor) => {
  const content = editor.document.getText();
  const lines = content.split("\n");

  const regex = /const/;

  let ranges: Range[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const match = lines[lineIndex].match(regex);
    console.log(`On line ${lineIndex}, the match is :`, match);

    if (match !== null && match.index !== undefined) {
      const range = new Range(
        new Position(lineIndex, match.index),
        new Position(lineIndex, match.index + match[1].length)
      );

      ranges.push(range);
    }
  }
  console.log(ranges);
  editor.setDecorations(decorationType, ranges);
};

export function activate(context: ExtensionContext) {
  console.log("Activated the extension");
  const saveEvent = workspace.onWillSaveTextDocument((event) => {
    console.log("Saved the file");
    const editor = window.visibleTextEditors.filter(
      (editor) => editor.document.uri === event.document.uri
    )[0];
    console.log("Editor :", editor);

    decorateFile(editor);
  });

  context.subscriptions.push(saveEvent);
}

export function deactivate() {}
