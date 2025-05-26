"use strict";
/**
 * Formats validation errors into a readable string for debugging.
 * @param errors - Array of error objects.
 * @returns Formatted error message string.
 */
function formatValidationErrors(errors) {
    if (!errors)
        return 'No validation errors provided.';
    return errors
        .map((error) => {
        const instancePath = error.instancePath || '(root)';
        const message = typeof error.message === 'string'
            ? error.message
            : `Error details: ${JSON.stringify(error)}`;
        return `${instancePath} ${message}`;
    })
        .join('\n');
}
//# sourceMappingURL=jsonValidator.js.map