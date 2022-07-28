import { languages } from "vscode";

import type { ExtensionContext } from "vscode";

export function activate(context: ExtensionContext) {
  console.log("Activated the extension");

  const provider = languages.registerHoverProvider("typescript", {
    provideHover(document, position, token) {
      const range = document.getWordRangeAtPosition(position);
      const word = document.getText(range);

      if (word === "const") {
        return {
          contents: ["This is a const keyword."],
        };
      }

      if (word === "console") {
        return {
          contents: ["This is a console keyword."],
        };
      }

      return {
        contents: ["Hello World"],
      };
    },
  });

  context.subscriptions.push(provider);
}

export function deactivate() {}
