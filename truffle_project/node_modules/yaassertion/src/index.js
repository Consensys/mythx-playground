/**
 * Assertion utilities module.
 * @module utils/assertion
 *
 * @example
 *
 * function myFunction(foo, bar) {
 *   assertType(foo, 'foo', ['string']);
 *   assertType(bar, 'bar', ['plain object']);
 * }
 *
 * myFunction(1);
 * // > TypeError: Parameter `foo` must be a string, not number `1`
 *
 * myFunction("1", []);
 * // > TypeError: Parameter `bar` must be a plain object, not array `[]`
 */
import { formatMessage, listFormat, smarterTypeof, withinRange } from "./utils";

/**
 * Asserts values that are assumed to be true.
 * @param {boolean} condition - Won't throw if true, will throw if false.
 * @param {string} errorMessage - The error message. Can contain placeholders for variable
 *        replacement, e.g., 'Hello {name}' where the value for name comes from `options.name`.
 * @param {Object} [options]
 * @param {Object} [options.errorClass=Error] The class of the error to throw.
 * @param {string} [options.*] Any other option will be used for variable replacement in
 *        errorMessage.
 * @returns Returns `true` if *condition* if `true`.
 * @throws Will throw *option.errorClass* if *condition* if `false`.
 *
 * @example
 *
 * // This will not throw and return true.
 * assert(truthyValue, 'error message');
 * // > true
 *
 * @example
 *
 * // This will throw an error with this error message.
 * assert(falseyValue, 'error message');
 * // > throw Error('error message')
 */
export function assert(condition, errorMessage, options) {
  var error, errorClass;

  if (condition) {
    return true;
  }

  options = options || {};
  // Assign errorClass and remove it from options.
  errorClass = options.errorClass || Error;

  errorMessage = formatMessage(errorMessage, options);
  error = new errorClass(errorMessage);
  error.attributes = options;

  throw error;
}

/**
 * Throw a TypeError in case *parameterValue* isn't any of *expectedTypes*.
 *
 * @param {*} parameterValue - Used in the error message as *parameterValue* and the deduced *parameterType* variables.
 * @param {string} parameterName - Used in the error message as *parameterName* variable.
 * @param {Array} expectedTypes - A list of expected (smart) typeofs.
 * @param {Object} [options]
 * @param {boolean} [options.condition] An optional condition that overrides the default logic, in which case *expectedTypes* values are completely ignored.
 * @param {String} [options.errorMessage] An optional error message that overrides the default one. Note the error message can use the following automatically set variables: parameterName, parameterValue, parameterType.
 *
 * @example
 *
 * myParam = "foo";
 * assertType(
 *   myParam,
 *   'myParam',
 *   ["number"]
 * );
 * // > TypeError: Parameter `myParam` must be a number, not string `"foo"`
 *
 * myParam = [];
 * assertType(
 *   myParam,
 *   'myParam',
 *   ["number", "string"]
 * );
 * // > TypeError: Parameter `myParam` must be a number or string, not array `[]`
 */
export function assertType(
  parameterValue,
  parameterName,
  expectedTypes,
  options
) {
  var parameterType = smarterTypeof(parameterValue);

  options = options || {};
  var condition =
    options.condition || expectedTypes.indexOf(parameterType) !== -1;
  var errorMessage =
    options.errorMessage ||
    "Parameter `{parameterName}` must be a {expectedTypesMessage}, not {parameterType} `{{parameterValue}}`";

  assert(condition, errorMessage, {
    errorClass: TypeError,
    expectedTypesMessage: listFormat(expectedTypes, "or"),
    parameterName: parameterName,
    parameterType: parameterType,
    parameterValue: parameterValue
  });
}

/**
 * Throw a RangeError in case *element* isn't included in the *collection*.
 *
 * @param {*} element - The key of an Object or the element of an Array.
 * @param {(Array|Object)} collection - Where to search for element at.
 * @param {string} errorMessage - See assert().
 * @param {Object} [options] - See assert().
 *
 * @example
 * assertRange("quax", ["foo", "bar", "baz"], "Invalid element");
 * // > RangeError: Invalid element
 *
 * assertRange("quax", {"foo": 1, "bar": 2, "baz": 3}, "Invalid key");
 * // > RangeError: Invalid key
 */
export function assertRange(element, collection, errorMessage, options) {
  assert(
    withinRange(element, collection),
    errorMessage,
    Object.assign({ errorClass: RangeError }, options)
  );
}
