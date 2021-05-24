"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getDerivedTypeDefinition(line) {
    const derivedTypeRegex = /^\s*type\s*(?:,\s*extends\(([a-z][a-z0-9]*)\))?(,\s*public)?\s*(::)?\s*([a-z][a-z0-9]*)/i;
    if (line.match(derivedTypeRegex)) {
        const execResult = derivedTypeRegex.exec(line);
        let [matchExp, hasExtendExpression, hasPublic, hasDotSeparator, declaredType] = execResult;
        if (isMissingSeparator({ hasExtendExpression, hasPublic, hasDotSeparator })) {
            return;
        }
        return { name: declaredType };
    }
}
exports.getDerivedTypeDefinition = getDerivedTypeDefinition;
function isMissingSeparator({ hasExtendExpression, hasPublic, hasDotSeparator }) {
    if ((hasExtendExpression || hasPublic) && !hasDotSeparator)
        return true;
    return false;
}
//# sourceMappingURL=index.js.map