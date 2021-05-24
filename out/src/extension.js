"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
// src/extension.ts
const vscode = require("vscode");
const linter_provider_1 = require("./features/linter-provider");
// const hover_provider_1 = require("./features/hover-provider");
// const completion_provider_1 = require("./features/completion-provider");
// const document_symbol_provider_1 = require("./features/document-symbol-provider");
const helper_1 = require("./lib/helper");
// const lang_server_1 = require("./lang-server");
function activate(context) {
    console.log('Congratulations, your extension "helloworld-sample" is now active!');

    // const extensionConfig = vscode.workspace.getConfiguration(helper_1.EXTENSION_ID);
    // if (extensionConfig.get('linterEnabled', true)) {
    let linter = new linter_provider_1.default();
    linter.activate(context.subscriptions);
    vscode.languages.registerCodeActionsProvider(helper_1.FORTRAN_FREE_FORM_ID, linter);
    // }
    // if (extensionConfig.get('provideCompletion', true)) {
    //     let completionProvider = new completion_provider_1.FortranCompletionProvider();
    //     vscode.languages.registerCompletionItemProvider(helper_1.FORTRAN_FREE_FORM_ID, completionProvider);
    // }
    // if (extensionConfig.get('provideHover', true)) {
    //     let hoverProvider = new hover_provider_1.default();
    //     vscode.languages.registerHoverProvider(helper_1.FORTRAN_FREE_FORM_ID, hoverProvider);
    // }
    // if (extensionConfig.get('provideSymbols', true)) {
    //     let symbolProvider = new document_symbol_provider_1.FortranDocumentSymbolProvider();
    //     vscode.languages.registerDocumentSymbolProvider(helper_1.FORTRAN_FREE_FORM_ID, symbolProvider);
    // }
    // if (lang_server_1.checkForLangServer(extensionConfig)) {
    //     const langServer = new lang_server_1.FortranLangServer(context, extensionConfig);
    //     langServer.start();
    //     langServer.onReady().then(() => {
    //         const capabilities = langServer.getCapabilities();
    //         if (!capabilities) {
    //             return vscode.window.showErrorMessage('The language server is not able to serve any features at the moment.');
    //         }
    //     });
    // }
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map