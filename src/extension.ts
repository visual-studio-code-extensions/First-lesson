/**
 *
 * UX Guidelines Documentation for VS Code
 *  - https://code.visualstudio.com/api/ux-guidelines/overview
/**
 * ? ====== IMPORT SECTION ======
 *
 * With the vscode extension library (the library used to create extensions) you
 * need to import classes and functions to make it work. This is where we
 * import theses things.
 */
import { commands, window, workspace, ViewColumn } from "vscode";

/**
 * Library to parse the Typescript.
 * Link : https://ts-morph.com/
 */
import { Project, ts } from "ts-morph";

import type { SourceFile, Node } from "ts-morph";
import type { ExtensionContext, TextDocument, WebviewPanel } from "vscode";

/**
 * ? ====== FUNCTION DECLARATION ======
 */

/**
 * Multiply a character.
 *
 * char - The character to multiply
 * amount - The amount of times the character is multiplied
 *
 * Ex: multChar("a", 5) -> "aaaaa"
 *     multChar(" ", 2) -> "  "
 */
const multChar = (char: string, amount: number): string => {
  return Array(amount).fill(char).join("");
};

/**
 * Update the [lines] array to contain the nodes with their hierarchy.
 *
 * lines - The array containing the lines
 * node - The actual node
 * indent - The indentation (the space before the node's name)
 */
const parser = (
  lines: {
    label: string;
    indent: number;
    pos: number;
    end: number;
    flags: ts.NodeFlags;
  }[],
  node: Node,
  indent = 0
): void => {
  lines.push({
    label: node.getKindName(),
    indent: indent,
    pos: node.getPos(),
    end: node.getEnd(),
    flags: node.getFlags(),
  });
  node.forEachChild((child) => parser(lines, child, indent + 2));
};

/**
 * ? ====== EXTENSION PART ======
 *
 * Activation Events : https://code.visualstudio.com/api/references/activation-events
 *
 * The [activate] and [deactivate] functions are need by the vscode extension library.
 * The [activate] function runs at start of extensions and [deactivate] at the end.
 */
export function activate(context: ExtensionContext) {
  // A message printed on the debug console when the extension loads
  console.log('Congratulations, your extension "firstlesson" is now active!');

  // Project instance created by ts-morph, this one is needed by the ts-morph library
  //
  // the "useInMemorySystem" property is used to virtualize the saved files by
  // ts-morph
  const project = new Project({
    useInMemoryFileSystem: true,
  });

  // The webview (aka. right panel containing the AST)
  // Type is also undefined because it is not yet defined.
  let view: WebviewPanel | undefined;

  // Event Handler
  //
  // Triggered when the user saves the document (ctrl + s or Save File)
  let saveEvent = workspace.onDidSaveTextDocument((file: TextDocument) => {
    // If there is no view loaded or the language of the current file
    // is not "typescript", we exit the function
    console.log(view, file.languageId);
    if (view === undefined || file.languageId !== "typescript") {
      return;
    }

    // ts-morph creates a temporary file with the content of the file
    // we are currently working on, it creates its own file so as to
    // handle its content
    const sourceFile: SourceFile = project.createSourceFile(
      "__temp__.ts",
      file.getText()
    );
    console.log(sourceFile.getKindName());

    let lines: {
      label: string;
      indent: number;
      pos: number;
      end: number;
      flags: ts.NodeFlags;
    }[] = [];

    // Parse the sourceFile (the parser function will update the lines array with the right content)
    parser(lines, sourceFile);

    // Update the webview HTML content with the lines
    view.webview.html = `
      <!DOCTYPE html>
			<html>
        <head>
          <title>Page Title</title>
        </head>

        <style>
          * {
            margin: 0;
            padding: 0;
          }

          p:hover {
            text-decoration: underline;
          }
        </style>

        <body>
          ${lines
            .map((line, index) => {
              return `<div
                        style="margin-left: ${line.indent * 8}px"
                      >
                        <p>${line.label}</p>
                        <ul>
                          <li>pos : ${line.pos}</li>
                          <li>end : ${line.end}</li>
                          <li>flags : ${line.flags}</li>
                        </ul>
                      </div>`;
            })
            .join("\n")}
        </body>
      </html>
    `;
  });

  // Command Registration
  //
  // Register a command named "firstlesson.SeeTree", check the "package.json" file to
  // see the registered command.
  let disposable = commands.registerCommand("firstlesson.SeeTree", () => {
    // if (view) view.dispose();

    // Update the view variable with the newly created webview.
    // The first parameter is the identifier of the webview (not very important),
    // the second one is the title (what is showed as the title of the tab) and the last one
    // is the place where it will pop on the window (here, the second column).
    view = window.createWebviewPanel("webtree", "seetree", ViewColumn.Two);

    // Update the webview HTML
    view.webview.html = `
      <!DOCTYPE html>
			<html>
        <head>
          <title>Page Title</title>
        </head>
   
        <body>  
          <h1>This is a Heading</h1>
          <p>This is a paragraph.</p>
        </body>
      </html>
    `;
  });

  // Push the event handler and the command registration to the extension subscriptions
  // this is not compulsary but a good practice, it helps the extension handle things better.
  context.subscriptions.push(disposable, saveEvent);
}

// this method is called when your extension is deactivated
export function deactivate() {}
