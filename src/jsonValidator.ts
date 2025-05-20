import Ajv, { ErrorObject, Options } from 'ajv';

/**
 * Validates a JSON object against a given schema.
 * @param jsonData - The JSON object to validate.
 * @param schema - The schema to validate against.
 * @param ajvOptions - Optional Ajv configuration options.
 * @throws Throws an error with detailed messages if validation fails.
 */
export function validateJson(
  jsonData: object,
  schema: object,
  ajvOptions: Options = {}
): void {
  const ajv = new Ajv(ajvOptions);
  const validate = ajv.compile(schema);
  const valid = validate(jsonData);

  if (!valid) {
    const errorDetails = formatAjvErrors(validate.errors);
    throw new Error(`JSON validation failed:\n${errorDetails}`);
  }
}

/**
 * Formats Ajv validation errors into a readable string.
 * @param errors - Array of error objects from Ajv.
 * @returns Formatted error message string.
 */
function formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors) return 'Unknown error';

  return errors
    .map((error) => `${error.instancePath || '(root)'} ${error.message}`)
    .join('\n');
}