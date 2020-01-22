/**
 * Basic utilities module.
 * @module utils/basic
 */

/**
 * Formats a message replacing placeholders with variables values.
 * @param {string} message - A message that can contain placeholders.
 * @param {Object} [variables] - Variables for replacing message placeholders.
 *
 * @example
 * formatMessage("Hello {name}", {name: "John"});
 * // > "Hello John"
 *
 * formatMessage("Hello {{name}}", {name: "John"});
 * // > "Hello \"John\""
 */
export function formatMessage(message, variables) {
  return (
    message
      // Replace {{variable}} with `JSON.stringify(variableValue)`.
      .replace(/{{([0-9a-zA-Z-_. ]+)}}/g, function(_, variable) {
        // JSON.stringify(NaN) yields 'null', so we need a special case for NaN
        if (
          typeof variables[variable] === "number" &&
          isNaN(variables[variable])
        ) {
          return "NaN";
        }
        return JSON.stringify(variables[variable]);
      })
      // Replace {variable} with `variableValue`.
      .replace(/{([0-9a-zA-Z-_. ]+)}/g, function(_, variable) {
        return variables[variable];
      })
  );
}

/**
 * Checks if passed *object* is a plain object.
 * @param {*} object - Value subject to test.
 * @returns {boolean} Returns `true` if *object* is a plain object or `false`.
 *
 * @example
 *
 * isPlainObject(); // > false
 * isPlainObject(null); // > false
 * isPlainObject(new Date()); // > false
 * isPlainObject([]); // > false
 * isPlainObject(1); // > false
 * isPlainObject(true); // > false
 * isPlainObject("foo"); // > false
 * isPlainObject(function() {}); // > false
 * isPlainObject({a: 1}); // > true
 */
function isPlainObject(object) {
  // Inspired by jQuery Core, but reduced to our use case.
  return (
    object !== null &&
    "" + object === "[object Object]" &&
    object.constructor === Object
  );
}

/**
 * @param {Array} array - The list of strings to glue together as an English formatted list string.
 * @param {string} conjunction - Conjunction value, e.g., `'and'`, `'or'`.
 * @returns {string} Returns an English formatted list string using the passed *conjunction*.
 *
 * @example
 *
 * listFormat([], 'or'); // > ''
 * listFormat(['foo'], 'or'); // > 'foo'
 * listFormat(['foo', 'bar'], 'or'); // > 'foo or bar'
 * listFormat(['foo', 'bar', 'baz'], 'or'); // > 'foo, or bar, or baz'
 */
export function listFormat(array, conjunction) {
  if (array.length === 0) {
    return "";
  }
  if (array.length === 1) {
    return array[0];
  }
  if (array.length === 2) {
    return array.join(" " + conjunction + " ");
  }
  if (array.length > 2) {
    return array.join(", " + conjunction + " ");
  }
}

/**
 * Returns the type of a variable with additional types than native `typeof`.
 * @param {*} variable - A variable to deduce its type.
 *
 * @example
 * smarterTypeof(null); // > "null"
 * smarterTypeof({a: 1}); // > "plain object"
 * smarterTypeof([]); // > "array"
 * smarterTypeof(new Date()); // > "date"
 * smarterTypeof(<anything else>); // > result of regular typeof.
 */
export function smarterTypeof(variable) {
  if (variable === null) {
    return "null";
  }
  if (isPlainObject(variable)) {
    return "plain object";
  }
  if (Array.isArray(variable)) {
    return "array";
  }
  if (variable instanceof Date) {
    return "date";
  }
  return typeof variable;
}

/**
 * Returns `true` is *element* belongs to *collection*.
 * @param {*} element - The key of an Object or the element of an Array.
 * @param {(Array| Object)} Where to search for element at.
 *
 * @example
 *
 * withinRange("bar", ["foo", "bar", "baz"]);
 * // > true
 * withinRange("quax", ["foo", "bar", "baz"]);
 * // > false
 *
 * @example
 *
 * withinRange("bar", {foo: 1, bar: 2, baz: 3});
 * // > true
 * withinRange("quax", {foo: 1, bar: 2, baz: 3});
 * // > false
 */
export function withinRange(element, collection) {
  return Array.isArray(collection)
    ? collection.indexOf(element) !== -1
    : element in collection;
}
