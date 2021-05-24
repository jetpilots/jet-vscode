"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const cp = require("child_process");
const helper_1 = require("../lib/helper");
const vscode = require("vscode");
class JetLintingProvider {
    constructor() { }
    doJetLint(textDocument) {
        // const errorRegex = /^([a-zA-Z]:\\)*([^:]*):([0-9]+):([0-9]+):\s+(.*)\s+.*?\s+(Error|Warning|Fatal Error):\s(.*)$/gm;
        const errorRegex = /^([a-zA-Z]:\\)*([^:]*):([0-9]+):([0-9]+)(-[0-9]+)?: (error|warning): (.*)$/gm;
        if (textDocument.languageId !== helper_1.LANGUAGE_ID || textDocument.uri.scheme !== "file") {
            return;
        }
        let decoded = "";
        let diagnostics = [];
        let command = this.getCJetPath();
        let argList = this.constructArgumentList(textDocument);
        let filePath = path.parse(textDocument.fileName).dir;
        let fileBase = path.parse(textDocument.fileName).base;
        /*
         * reset localization settings to traditional C English behavior in case
         * gfortran is set up to use the system provided localization information,
         * so errorRegex can nevertheless be used to filter out errors and warnings
         *
         * see also: https://gcc.gnu.org/onlinedocs/gcc/Environment-Variables.html
         */
        const env = process.env;
        env.LC_ALL = 'C';
        if (process.platform === 'win32') {
            // Windows needs to know the path of other tools
            if (!env.Path.includes(path.dirname(command))) {
                env.Path = `${path.dirname(command)}${path.delimiter}${env.Path}`;
            }
        }
        let childProcess = cp.spawn(command, argList, { cwd: filePath, env: env });
        // vscode.window.showInformationMessage(`spawning ${command} ${argList} in ${filePath}`);
        if (childProcess.pid) {
            childProcess.stdout.on("data", (data) => {
                // console.log(`stdout:\n${data}`);
                decoded += data;
            });
            childProcess.stderr.on("data", data => {
                // console.log(`stderr:\n${data}`);
                decoded += data;
            });
            childProcess.stderr.on("end", () => {
                let matchesArray;
                while ((matchesArray = errorRegex.exec(decoded)) !== null) {
                    let elements = matchesArray.slice(1); // get captured expressions
                    let startLine = parseInt(elements[2]);
                    let startColumn = parseInt(elements[3]);
                    let endColumn = parseInt(elements[4]) * -1;
                    let type = elements[5]; // error or warning
                    let severity = type.toLowerCase() === "warning"
                        ? vscode.DiagnosticSeverity.Information
                        : vscode.DiagnosticSeverity.Error;
                    let message = elements[6];
                    message = message.replace(/;;/g, "\n") + "\n";
                    startLine = Math.max(startLine, 1)
                    let range = new vscode.Range(new vscode.Position(startLine - 1, Math.max(startColumn - 1, 0)), new vscode.Position(startLine - 1, Math.max(endColumn - 1, startColumn)));
                    let diagnostic = new vscode.Diagnostic(range, message, severity);
                    diagnostic.code = {
                        value: "help",
                        target: vscode.Uri.parse('https://jetpilots.dev/manual/errors/err-desc.html')
                    }
                    console.log(message);
                    diagnostics.push(diagnostic);
                }
                this.diagnosticCollection.set(textDocument.uri, diagnostics);
            });
            childProcess.stdout.on("close", code => {
                console.log(`child process exited with code ${code}`);
            });
            // childProcess.stdout.on('data', (data) => {
            //     console.log(`stdout: ${data}`);
            // });

            // childProcess.stderr.on('data', (data) => {
            //     console.error(`stderr: ${data}`);
            // });
        }
        else {
            childProcess.on("error", (err) => {
                if (err.code === "ENOENT") {
                    vscode.window.showErrorMessage(`cjet can't be found in $PATH. Update your settings with a proper path or disable the linter. (${childProcess.pid}, ${err.code})`);
                }
            });
        }
    }
    constructArgumentList(textDocument) {
        let options = vscode.workspace.rootPath
            ? { cwd: vscode.workspace.rootPath }
            : undefined;
        let relPath = path.parse(textDocument.fileName).base;
        // let relPath = textDocument.fileName.replace(vscode.workspace.rootPath, ".");
        let args = [
            ...this.getLinterExtraArgs()
        ];
        let includePaths = this.getIncludePaths();
        let extensionIndex = textDocument.fileName.lastIndexOf(".");
        let fileNameWithoutExtension = textDocument.fileName.substring(0, extensionIndex);
        let argList = [
            ...args,
            ...helper_1.getIncludeParams(includePaths),
            relPath,
            "l"
        ];
        return argList.map(arg => arg.trim()).filter(arg => arg !== "");
    }
    provideCodeActions(document, range, context, token) {
        return;
        // let diagnostic: vscode.Diagnostic = context.diagnostics[0];
        // return [{
        // 	title: "Accept gfortran suggestion",
        // 	command: JetLintingProvider.commandId,
        // 	arguments: [document, diagnostic.range, diagnostic.message]
        // }];
    }
    activate(subscriptions) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
        vscode.workspace.onDidOpenTextDocument(this.doJetLint, this, subscriptions);
        vscode.workspace.onDidCloseTextDocument(textDocument => {
            this.diagnosticCollection.delete(textDocument.uri);
        }, null, subscriptions);
        vscode.workspace.onDidSaveTextDocument(this.doJetLint, this);
        // Run gfortran in all open fortran files
        vscode.workspace.textDocuments.forEach(this.doJetLint, this);
    }
    dispose() {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
        this.command.dispose();
    }
    getIncludePaths() {
        let config = vscode.workspace.getConfiguration("jet");
        let includePaths = config.get("includePaths", []);
        return includePaths;
    }
    getCJetPath() {
        return "cjet";
        // let config = vscode.workspace.getConfiguration("jet");
        // return config.get("cjetExecutable", "cjet");
    }
    getLinterExtraArgs() {
        let config = vscode.workspace.getConfiguration("jet");
        return config.get("linterExtraArgs", []);
    }
}
exports.default = JetLintingProvider;
JetLintingProvider.commandId = "cjet.lint.runCodeAction";
//# sourceMappingURL=linter-provider.js.map