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
import {
  commands,
  window,
  workspace,
  TreeDataProvider,
  TreeItem,
  ProviderResult,
  TreeItemCollapsibleState,
} from "vscode";

/**
 * Library to parse the Typescript.
 * Link : https://ts-morph.com/
 */
import {
  LabeledStatement,
  NoSubstitutionTemplateLiteral,
  Project,
} from "ts-morph";

import type { SourceFile, Node, ts } from "ts-morph";
import type { ExtensionContext, TextDocument, Disposable } from "vscode";

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
const parser = (lines: string[], node: Node, indent = 0): void => {
  lines.push(multChar(" ", indent) + node.getKindName());
  node.forEachChild((child) => parser(lines, child, indent + 2));
};

const countNodes = (node: Node<ts.Node>): number => {
  let total = 1;

  for (const child of node.getChildren()) {
    total += countNodes(child);
  }

  return total;
};

/**
 * ? ====== CLASS DECLARATION PART ======
 */
class TreeProvider implements TreeDataProvider<Node<ts.Node>> {
  constructor(private root: SourceFile) {}

  getTreeItem(element: Node<ts.Node>): TreeItem | Thenable<TreeItem> {
    return new TreeItem(
      element.getKindName(),
      TreeItemCollapsibleState.Expanded
    );
  }

  getChildren(
    element?: Node<ts.Node> | undefined
  ): ProviderResult<Node<ts.Node>[]> {
    if (element === undefined) {
      return [this.root];
    }

    return element.getChildren();
  }
}

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

  let sourceFile: SourceFile | undefined;
  let treeView: Disposable | undefined;

  // Event Handler
  //
  // Triggered when the user saves the document (ctrl + s or Save File)
  let saveEvent = workspace.onDidSaveTextDocument((file: TextDocument) => {
    // If there is no view loaded or the language of the current file
    // is not "typescript", we exit the function
    if (file.languageId !== "typescript") {
      return;
    }

    // ts-morph creates a temporary file with the content of the file
    // we are currently working on, it creates its own file so as to
    // handle its content
    sourceFile = project.createSourceFile("__temp__.ts", file.getText());

    if (!treeView) {
      treeView = window.registerTreeDataProvider(
        "treeView",
        new TreeProvider(sourceFile)
      );
      context.subscriptions.push(treeView);
    }
  });

  // Command Registration
  //
  // Register a command named "firstlesson.SeeTree", check the "package.json" file to
  // see the registered command.
  let disposable = commands.registerCommand("firstlesson.SeeTree", () => {
    console.log("Command called !");
  });

  let countNodesCommand = commands.registerCommand(
    "firstlesson.CountNodes",
    () => {
      if (sourceFile === undefined) {
        return;
      }

      const count = countNodes(sourceFile);
      window.showInformationMessage(
        `There are ${count} nodes in the abstract syntax tree.`
      );
    }
  );

  // Push the event handler and the command registration to the extension subscriptions
  // this is not compulsary but a good practice, it helps the extension handle things better.
  context.subscriptions.push(disposable, saveEvent, countNodesCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {}
