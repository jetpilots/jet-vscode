"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageclient_1 = require("vscode-languageclient");
const helper_1 = require("./lib/helper");
class FortranLangServer {
    constructor(context, config) {
        let langServerFlags = config.get('languageServerFlags', []);
        const serverOptions = {
            command: helper_1.getBinPath('fortran-langserver'),
            args: [...langServerFlags],
            options: {},
        };
        const clientOptions = {
            documentSelector: [helper_1.FORTRAN_FREE_FORM_ID],
        };
        this.c = new vscode_languageclient_1.LanguageClient('fortran-langserver', serverOptions, clientOptions);
    }
    start() {
        this.c.start();
    }
    onReady() {
        return this.c.onReady();
    }
    getCapabilities() {
        const capabilities = this.c.initializeResult && this.c.initializeResult.capabilities;
        return capabilities;
    }
}
exports.FortranLangServer = FortranLangServer;
//# sourceMappingURL=langServer.js.map