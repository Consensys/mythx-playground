'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

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
function formatMessage(message, variables) {
  return message
  // Replace {{variable}} with `JSON.stringify(variableValue)`.
  .replace(/{{([0-9a-zA-Z-_. ]+)}}/g, function (_, variable) {
    // JSON.stringify(NaN) yields 'null', so we need a special case for NaN
    if (typeof variables[variable] === "number" && isNaN(variables[variable])) {
      return "NaN";
    }
    return JSON.stringify(variables[variable]);
  })
  // Replace {variable} with `variableValue`.
  .replace(/{([0-9a-zA-Z-_. ]+)}/g, function (_, variable) {
    return variables[variable];
  });
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
  return object !== null && "" + object === "[object Object]" && object.constructor === Object;
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
function listFormat(array, conjunction) {
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
function smarterTypeof(variable) {
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
  return typeof variable === "undefined" ? "undefined" : _typeof(variable);
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
function withinRange(element, collection) {
  return Array.isArray(collection) ? collection.indexOf(element) !== -1 : element in collection;
}

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
function assert(condition, errorMessage, options) {
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
function assertType(parameterValue, parameterName, expectedTypes, options) {
  var parameterType = smarterTypeof(parameterValue);

  options = options || {};
  var condition = options.condition || expectedTypes.indexOf(parameterType) !== -1;
  var errorMessage = options.errorMessage || "Parameter `{parameterName}` must be a {expectedTypesMessage}, not {parameterType} `{{parameterValue}}`";

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
function assertRange(element, collection, errorMessage, options) {
  assert(withinRange(element, collection), errorMessage, Object.assign({ errorClass: RangeError }, options));
}

exports.assert = assert;
exports.assertType = assertType;
exports.assertRange = assertRange;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEJhc2ljIHV0aWxpdGllcyBtb2R1bGUuXG4gKiBAbW9kdWxlIHV0aWxzL2Jhc2ljXG4gKi9cblxuLyoqXG4gKiBGb3JtYXRzIGEgbWVzc2FnZSByZXBsYWNpbmcgcGxhY2Vob2xkZXJzIHdpdGggdmFyaWFibGVzIHZhbHVlcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gQSBtZXNzYWdlIHRoYXQgY2FuIGNvbnRhaW4gcGxhY2Vob2xkZXJzLlxuICogQHBhcmFtIHtPYmplY3R9IFt2YXJpYWJsZXNdIC0gVmFyaWFibGVzIGZvciByZXBsYWNpbmcgbWVzc2FnZSBwbGFjZWhvbGRlcnMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGZvcm1hdE1lc3NhZ2UoXCJIZWxsbyB7bmFtZX1cIiwge25hbWU6IFwiSm9oblwifSk7XG4gKiAvLyA+IFwiSGVsbG8gSm9oblwiXG4gKlxuICogZm9ybWF0TWVzc2FnZShcIkhlbGxvIHt7bmFtZX19XCIsIHtuYW1lOiBcIkpvaG5cIn0pO1xuICogLy8gPiBcIkhlbGxvIFxcXCJKb2huXFxcIlwiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRNZXNzYWdlKG1lc3NhZ2UsIHZhcmlhYmxlcykge1xuICByZXR1cm4gKFxuICAgIG1lc3NhZ2VcbiAgICAgIC8vIFJlcGxhY2Uge3t2YXJpYWJsZX19IHdpdGggYEpTT04uc3RyaW5naWZ5KHZhcmlhYmxlVmFsdWUpYC5cbiAgICAgIC5yZXBsYWNlKC97eyhbMC05YS16QS1aLV8uIF0rKX19L2csIGZ1bmN0aW9uKF8sIHZhcmlhYmxlKSB7XG4gICAgICAgIC8vIEpTT04uc3RyaW5naWZ5KE5hTikgeWllbGRzICdudWxsJywgc28gd2UgbmVlZCBhIHNwZWNpYWwgY2FzZSBmb3IgTmFOXG4gICAgICAgIGlmIChcbiAgICAgICAgICB0eXBlb2YgdmFyaWFibGVzW3ZhcmlhYmxlXSA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgIGlzTmFOKHZhcmlhYmxlc1t2YXJpYWJsZV0pXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybiBcIk5hTlwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YXJpYWJsZXNbdmFyaWFibGVdKTtcbiAgICAgIH0pXG4gICAgICAvLyBSZXBsYWNlIHt2YXJpYWJsZX0gd2l0aCBgdmFyaWFibGVWYWx1ZWAuXG4gICAgICAucmVwbGFjZSgveyhbMC05YS16QS1aLV8uIF0rKX0vZywgZnVuY3Rpb24oXywgdmFyaWFibGUpIHtcbiAgICAgICAgcmV0dXJuIHZhcmlhYmxlc1t2YXJpYWJsZV07XG4gICAgICB9KVxuICApO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBwYXNzZWQgKm9iamVjdCogaXMgYSBwbGFpbiBvYmplY3QuXG4gKiBAcGFyYW0geyp9IG9iamVjdCAtIFZhbHVlIHN1YmplY3QgdG8gdGVzdC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiAqb2JqZWN0KiBpcyBhIHBsYWluIG9iamVjdCBvciBgZmFsc2VgLlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogaXNQbGFpbk9iamVjdCgpOyAvLyA+IGZhbHNlXG4gKiBpc1BsYWluT2JqZWN0KG51bGwpOyAvLyA+IGZhbHNlXG4gKiBpc1BsYWluT2JqZWN0KG5ldyBEYXRlKCkpOyAvLyA+IGZhbHNlXG4gKiBpc1BsYWluT2JqZWN0KFtdKTsgLy8gPiBmYWxzZVxuICogaXNQbGFpbk9iamVjdCgxKTsgLy8gPiBmYWxzZVxuICogaXNQbGFpbk9iamVjdCh0cnVlKTsgLy8gPiBmYWxzZVxuICogaXNQbGFpbk9iamVjdChcImZvb1wiKTsgLy8gPiBmYWxzZVxuICogaXNQbGFpbk9iamVjdChmdW5jdGlvbigpIHt9KTsgLy8gPiBmYWxzZVxuICogaXNQbGFpbk9iamVjdCh7YTogMX0pOyAvLyA+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmplY3QpIHtcbiAgLy8gSW5zcGlyZWQgYnkgalF1ZXJ5IENvcmUsIGJ1dCByZWR1Y2VkIHRvIG91ciB1c2UgY2FzZS5cbiAgcmV0dXJuIChcbiAgICBvYmplY3QgIT09IG51bGwgJiZcbiAgICBcIlwiICsgb2JqZWN0ID09PSBcIltvYmplY3QgT2JqZWN0XVwiICYmXG4gICAgb2JqZWN0LmNvbnN0cnVjdG9yID09PSBPYmplY3RcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSAtIFRoZSBsaXN0IG9mIHN0cmluZ3MgdG8gZ2x1ZSB0b2dldGhlciBhcyBhbiBFbmdsaXNoIGZvcm1hdHRlZCBsaXN0IHN0cmluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBjb25qdW5jdGlvbiAtIENvbmp1bmN0aW9uIHZhbHVlLCBlLmcuLCBgJ2FuZCdgLCBgJ29yJ2AuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIGFuIEVuZ2xpc2ggZm9ybWF0dGVkIGxpc3Qgc3RyaW5nIHVzaW5nIHRoZSBwYXNzZWQgKmNvbmp1bmN0aW9uKi5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGxpc3RGb3JtYXQoW10sICdvcicpOyAvLyA+ICcnXG4gKiBsaXN0Rm9ybWF0KFsnZm9vJ10sICdvcicpOyAvLyA+ICdmb28nXG4gKiBsaXN0Rm9ybWF0KFsnZm9vJywgJ2JhciddLCAnb3InKTsgLy8gPiAnZm9vIG9yIGJhcidcbiAqIGxpc3RGb3JtYXQoWydmb28nLCAnYmFyJywgJ2JheiddLCAnb3InKTsgLy8gPiAnZm9vLCBvciBiYXIsIG9yIGJheidcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RGb3JtYXQoYXJyYXksIGNvbmp1bmN0aW9uKSB7XG4gIGlmIChhcnJheS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfVxuICBpZiAoYXJyYXkubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGFycmF5WzBdO1xuICB9XG4gIGlmIChhcnJheS5sZW5ndGggPT09IDIpIHtcbiAgICByZXR1cm4gYXJyYXkuam9pbihcIiBcIiArIGNvbmp1bmN0aW9uICsgXCIgXCIpO1xuICB9XG4gIGlmIChhcnJheS5sZW5ndGggPiAyKSB7XG4gICAgcmV0dXJuIGFycmF5LmpvaW4oXCIsIFwiICsgY29uanVuY3Rpb24gKyBcIiBcIik7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB0eXBlIG9mIGEgdmFyaWFibGUgd2l0aCBhZGRpdGlvbmFsIHR5cGVzIHRoYW4gbmF0aXZlIGB0eXBlb2ZgLlxuICogQHBhcmFtIHsqfSB2YXJpYWJsZSAtIEEgdmFyaWFibGUgdG8gZGVkdWNlIGl0cyB0eXBlLlxuICpcbiAqIEBleGFtcGxlXG4gKiBzbWFydGVyVHlwZW9mKG51bGwpOyAvLyA+IFwibnVsbFwiXG4gKiBzbWFydGVyVHlwZW9mKHthOiAxfSk7IC8vID4gXCJwbGFpbiBvYmplY3RcIlxuICogc21hcnRlclR5cGVvZihbXSk7IC8vID4gXCJhcnJheVwiXG4gKiBzbWFydGVyVHlwZW9mKG5ldyBEYXRlKCkpOyAvLyA+IFwiZGF0ZVwiXG4gKiBzbWFydGVyVHlwZW9mKDxhbnl0aGluZyBlbHNlPik7IC8vID4gcmVzdWx0IG9mIHJlZ3VsYXIgdHlwZW9mLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc21hcnRlclR5cGVvZih2YXJpYWJsZSkge1xuICBpZiAodmFyaWFibGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gXCJudWxsXCI7XG4gIH1cbiAgaWYgKGlzUGxhaW5PYmplY3QodmFyaWFibGUpKSB7XG4gICAgcmV0dXJuIFwicGxhaW4gb2JqZWN0XCI7XG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkodmFyaWFibGUpKSB7XG4gICAgcmV0dXJuIFwiYXJyYXlcIjtcbiAgfVxuICBpZiAodmFyaWFibGUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcmV0dXJuIFwiZGF0ZVwiO1xuICB9XG4gIHJldHVybiB0eXBlb2YgdmFyaWFibGU7XG59XG5cbi8qKlxuICogUmV0dXJucyBgdHJ1ZWAgaXMgKmVsZW1lbnQqIGJlbG9uZ3MgdG8gKmNvbGxlY3Rpb24qLlxuICogQHBhcmFtIHsqfSBlbGVtZW50IC0gVGhlIGtleSBvZiBhbiBPYmplY3Qgb3IgdGhlIGVsZW1lbnQgb2YgYW4gQXJyYXkuXG4gKiBAcGFyYW0geyhBcnJheXwgT2JqZWN0KX0gV2hlcmUgdG8gc2VhcmNoIGZvciBlbGVtZW50IGF0LlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogd2l0aGluUmFuZ2UoXCJiYXJcIiwgW1wiZm9vXCIsIFwiYmFyXCIsIFwiYmF6XCJdKTtcbiAqIC8vID4gdHJ1ZVxuICogd2l0aGluUmFuZ2UoXCJxdWF4XCIsIFtcImZvb1wiLCBcImJhclwiLCBcImJhelwiXSk7XG4gKiAvLyA+IGZhbHNlXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiB3aXRoaW5SYW5nZShcImJhclwiLCB7Zm9vOiAxLCBiYXI6IDIsIGJhejogM30pO1xuICogLy8gPiB0cnVlXG4gKiB3aXRoaW5SYW5nZShcInF1YXhcIiwge2ZvbzogMSwgYmFyOiAyLCBiYXo6IDN9KTtcbiAqIC8vID4gZmFsc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhpblJhbmdlKGVsZW1lbnQsIGNvbGxlY3Rpb24pIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoY29sbGVjdGlvbilcbiAgICA/IGNvbGxlY3Rpb24uaW5kZXhPZihlbGVtZW50KSAhPT0gLTFcbiAgICA6IGVsZW1lbnQgaW4gY29sbGVjdGlvbjtcbn1cbiIsIi8qKlxuICogQXNzZXJ0aW9uIHV0aWxpdGllcyBtb2R1bGUuXG4gKiBAbW9kdWxlIHV0aWxzL2Fzc2VydGlvblxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gbXlGdW5jdGlvbihmb28sIGJhcikge1xuICogICBhc3NlcnRUeXBlKGZvbywgJ2ZvbycsIFsnc3RyaW5nJ10pO1xuICogICBhc3NlcnRUeXBlKGJhciwgJ2JhcicsIFsncGxhaW4gb2JqZWN0J10pO1xuICogfVxuICpcbiAqIG15RnVuY3Rpb24oMSk7XG4gKiAvLyA+IFR5cGVFcnJvcjogUGFyYW1ldGVyIGBmb29gIG11c3QgYmUgYSBzdHJpbmcsIG5vdCBudW1iZXIgYDFgXG4gKlxuICogbXlGdW5jdGlvbihcIjFcIiwgW10pO1xuICogLy8gPiBUeXBlRXJyb3I6IFBhcmFtZXRlciBgYmFyYCBtdXN0IGJlIGEgcGxhaW4gb2JqZWN0LCBub3QgYXJyYXkgYFtdYFxuICovXG5pbXBvcnQgeyBmb3JtYXRNZXNzYWdlLCBsaXN0Rm9ybWF0LCBzbWFydGVyVHlwZW9mLCB3aXRoaW5SYW5nZSB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbi8qKlxuICogQXNzZXJ0cyB2YWx1ZXMgdGhhdCBhcmUgYXNzdW1lZCB0byBiZSB0cnVlLlxuICogQHBhcmFtIHtib29sZWFufSBjb25kaXRpb24gLSBXb24ndCB0aHJvdyBpZiB0cnVlLCB3aWxsIHRocm93IGlmIGZhbHNlLlxuICogQHBhcmFtIHtzdHJpbmd9IGVycm9yTWVzc2FnZSAtIFRoZSBlcnJvciBtZXNzYWdlLiBDYW4gY29udGFpbiBwbGFjZWhvbGRlcnMgZm9yIHZhcmlhYmxlXG4gKiAgICAgICAgcmVwbGFjZW1lbnQsIGUuZy4sICdIZWxsbyB7bmFtZX0nIHdoZXJlIHRoZSB2YWx1ZSBmb3IgbmFtZSBjb21lcyBmcm9tIGBvcHRpb25zLm5hbWVgLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zLmVycm9yQ2xhc3M9RXJyb3JdIFRoZSBjbGFzcyBvZiB0aGUgZXJyb3IgdG8gdGhyb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuKl0gQW55IG90aGVyIG9wdGlvbiB3aWxsIGJlIHVzZWQgZm9yIHZhcmlhYmxlIHJlcGxhY2VtZW50IGluXG4gKiAgICAgICAgZXJyb3JNZXNzYWdlLlxuICogQHJldHVybnMgUmV0dXJucyBgdHJ1ZWAgaWYgKmNvbmRpdGlvbiogaWYgYHRydWVgLlxuICogQHRocm93cyBXaWxsIHRocm93ICpvcHRpb24uZXJyb3JDbGFzcyogaWYgKmNvbmRpdGlvbiogaWYgYGZhbHNlYC5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIFRoaXMgd2lsbCBub3QgdGhyb3cgYW5kIHJldHVybiB0cnVlLlxuICogYXNzZXJ0KHRydXRoeVZhbHVlLCAnZXJyb3IgbWVzc2FnZScpO1xuICogLy8gPiB0cnVlXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXJyb3Igd2l0aCB0aGlzIGVycm9yIG1lc3NhZ2UuXG4gKiBhc3NlcnQoZmFsc2V5VmFsdWUsICdlcnJvciBtZXNzYWdlJyk7XG4gKiAvLyA+IHRocm93IEVycm9yKCdlcnJvciBtZXNzYWdlJylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIGVycm9yTWVzc2FnZSwgb3B0aW9ucykge1xuICB2YXIgZXJyb3IsIGVycm9yQ2xhc3M7XG5cbiAgaWYgKGNvbmRpdGlvbikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIC8vIEFzc2lnbiBlcnJvckNsYXNzIGFuZCByZW1vdmUgaXQgZnJvbSBvcHRpb25zLlxuICBlcnJvckNsYXNzID0gb3B0aW9ucy5lcnJvckNsYXNzIHx8IEVycm9yO1xuXG4gIGVycm9yTWVzc2FnZSA9IGZvcm1hdE1lc3NhZ2UoZXJyb3JNZXNzYWdlLCBvcHRpb25zKTtcbiAgZXJyb3IgPSBuZXcgZXJyb3JDbGFzcyhlcnJvck1lc3NhZ2UpO1xuICBlcnJvci5hdHRyaWJ1dGVzID0gb3B0aW9ucztcblxuICB0aHJvdyBlcnJvcjtcbn1cblxuLyoqXG4gKiBUaHJvdyBhIFR5cGVFcnJvciBpbiBjYXNlICpwYXJhbWV0ZXJWYWx1ZSogaXNuJ3QgYW55IG9mICpleHBlY3RlZFR5cGVzKi5cbiAqXG4gKiBAcGFyYW0geyp9IHBhcmFtZXRlclZhbHVlIC0gVXNlZCBpbiB0aGUgZXJyb3IgbWVzc2FnZSBhcyAqcGFyYW1ldGVyVmFsdWUqIGFuZCB0aGUgZGVkdWNlZCAqcGFyYW1ldGVyVHlwZSogdmFyaWFibGVzLlxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtZXRlck5hbWUgLSBVc2VkIGluIHRoZSBlcnJvciBtZXNzYWdlIGFzICpwYXJhbWV0ZXJOYW1lKiB2YXJpYWJsZS5cbiAqIEBwYXJhbSB7QXJyYXl9IGV4cGVjdGVkVHlwZXMgLSBBIGxpc3Qgb2YgZXhwZWN0ZWQgKHNtYXJ0KSB0eXBlb2ZzLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jb25kaXRpb25dIEFuIG9wdGlvbmFsIGNvbmRpdGlvbiB0aGF0IG92ZXJyaWRlcyB0aGUgZGVmYXVsdCBsb2dpYywgaW4gd2hpY2ggY2FzZSAqZXhwZWN0ZWRUeXBlcyogdmFsdWVzIGFyZSBjb21wbGV0ZWx5IGlnbm9yZWQuXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuZXJyb3JNZXNzYWdlXSBBbiBvcHRpb25hbCBlcnJvciBtZXNzYWdlIHRoYXQgb3ZlcnJpZGVzIHRoZSBkZWZhdWx0IG9uZS4gTm90ZSB0aGUgZXJyb3IgbWVzc2FnZSBjYW4gdXNlIHRoZSBmb2xsb3dpbmcgYXV0b21hdGljYWxseSBzZXQgdmFyaWFibGVzOiBwYXJhbWV0ZXJOYW1lLCBwYXJhbWV0ZXJWYWx1ZSwgcGFyYW1ldGVyVHlwZS5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIG15UGFyYW0gPSBcImZvb1wiO1xuICogYXNzZXJ0VHlwZShcbiAqICAgbXlQYXJhbSxcbiAqICAgJ215UGFyYW0nLFxuICogICBbXCJudW1iZXJcIl1cbiAqICk7XG4gKiAvLyA+IFR5cGVFcnJvcjogUGFyYW1ldGVyIGBteVBhcmFtYCBtdXN0IGJlIGEgbnVtYmVyLCBub3Qgc3RyaW5nIGBcImZvb1wiYFxuICpcbiAqIG15UGFyYW0gPSBbXTtcbiAqIGFzc2VydFR5cGUoXG4gKiAgIG15UGFyYW0sXG4gKiAgICdteVBhcmFtJyxcbiAqICAgW1wibnVtYmVyXCIsIFwic3RyaW5nXCJdXG4gKiApO1xuICogLy8gPiBUeXBlRXJyb3I6IFBhcmFtZXRlciBgbXlQYXJhbWAgbXVzdCBiZSBhIG51bWJlciBvciBzdHJpbmcsIG5vdCBhcnJheSBgW11gXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRUeXBlKFxuICBwYXJhbWV0ZXJWYWx1ZSxcbiAgcGFyYW1ldGVyTmFtZSxcbiAgZXhwZWN0ZWRUeXBlcyxcbiAgb3B0aW9uc1xuKSB7XG4gIHZhciBwYXJhbWV0ZXJUeXBlID0gc21hcnRlclR5cGVvZihwYXJhbWV0ZXJWYWx1ZSk7XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBjb25kaXRpb24gPVxuICAgIG9wdGlvbnMuY29uZGl0aW9uIHx8IGV4cGVjdGVkVHlwZXMuaW5kZXhPZihwYXJhbWV0ZXJUeXBlKSAhPT0gLTE7XG4gIHZhciBlcnJvck1lc3NhZ2UgPVxuICAgIG9wdGlvbnMuZXJyb3JNZXNzYWdlIHx8XG4gICAgXCJQYXJhbWV0ZXIgYHtwYXJhbWV0ZXJOYW1lfWAgbXVzdCBiZSBhIHtleHBlY3RlZFR5cGVzTWVzc2FnZX0sIG5vdCB7cGFyYW1ldGVyVHlwZX0gYHt7cGFyYW1ldGVyVmFsdWV9fWBcIjtcblxuICBhc3NlcnQoY29uZGl0aW9uLCBlcnJvck1lc3NhZ2UsIHtcbiAgICBlcnJvckNsYXNzOiBUeXBlRXJyb3IsXG4gICAgZXhwZWN0ZWRUeXBlc01lc3NhZ2U6IGxpc3RGb3JtYXQoZXhwZWN0ZWRUeXBlcywgXCJvclwiKSxcbiAgICBwYXJhbWV0ZXJOYW1lOiBwYXJhbWV0ZXJOYW1lLFxuICAgIHBhcmFtZXRlclR5cGU6IHBhcmFtZXRlclR5cGUsXG4gICAgcGFyYW1ldGVyVmFsdWU6IHBhcmFtZXRlclZhbHVlXG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93IGEgUmFuZ2VFcnJvciBpbiBjYXNlICplbGVtZW50KiBpc24ndCBpbmNsdWRlZCBpbiB0aGUgKmNvbGxlY3Rpb24qLlxuICpcbiAqIEBwYXJhbSB7Kn0gZWxlbWVudCAtIFRoZSBrZXkgb2YgYW4gT2JqZWN0IG9yIHRoZSBlbGVtZW50IG9mIGFuIEFycmF5LlxuICogQHBhcmFtIHsoQXJyYXl8T2JqZWN0KX0gY29sbGVjdGlvbiAtIFdoZXJlIHRvIHNlYXJjaCBmb3IgZWxlbWVudCBhdC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBlcnJvck1lc3NhZ2UgLSBTZWUgYXNzZXJ0KCkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gU2VlIGFzc2VydCgpLlxuICpcbiAqIEBleGFtcGxlXG4gKiBhc3NlcnRSYW5nZShcInF1YXhcIiwgW1wiZm9vXCIsIFwiYmFyXCIsIFwiYmF6XCJdLCBcIkludmFsaWQgZWxlbWVudFwiKTtcbiAqIC8vID4gUmFuZ2VFcnJvcjogSW52YWxpZCBlbGVtZW50XG4gKlxuICogYXNzZXJ0UmFuZ2UoXCJxdWF4XCIsIHtcImZvb1wiOiAxLCBcImJhclwiOiAyLCBcImJhelwiOiAzfSwgXCJJbnZhbGlkIGtleVwiKTtcbiAqIC8vID4gUmFuZ2VFcnJvcjogSW52YWxpZCBrZXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFJhbmdlKGVsZW1lbnQsIGNvbGxlY3Rpb24sIGVycm9yTWVzc2FnZSwgb3B0aW9ucykge1xuICBhc3NlcnQoXG4gICAgd2l0aGluUmFuZ2UoZWxlbWVudCwgY29sbGVjdGlvbiksXG4gICAgZXJyb3JNZXNzYWdlLFxuICAgIE9iamVjdC5hc3NpZ24oeyBlcnJvckNsYXNzOiBSYW5nZUVycm9yIH0sIG9wdGlvbnMpXG4gICk7XG59XG4iXSwibmFtZXMiOlsiZm9ybWF0TWVzc2FnZSIsIm1lc3NhZ2UiLCJ2YXJpYWJsZXMiLCJyZXBsYWNlIiwiXyIsInZhcmlhYmxlIiwiaXNOYU4iLCJKU09OIiwic3RyaW5naWZ5IiwiaXNQbGFpbk9iamVjdCIsIm9iamVjdCIsImNvbnN0cnVjdG9yIiwiT2JqZWN0IiwibGlzdEZvcm1hdCIsImFycmF5IiwiY29uanVuY3Rpb24iLCJsZW5ndGgiLCJqb2luIiwic21hcnRlclR5cGVvZiIsIkFycmF5IiwiaXNBcnJheSIsIkRhdGUiLCJ3aXRoaW5SYW5nZSIsImVsZW1lbnQiLCJjb2xsZWN0aW9uIiwiaW5kZXhPZiIsImFzc2VydCIsImNvbmRpdGlvbiIsImVycm9yTWVzc2FnZSIsIm9wdGlvbnMiLCJlcnJvciIsImVycm9yQ2xhc3MiLCJFcnJvciIsImF0dHJpYnV0ZXMiLCJhc3NlcnRUeXBlIiwicGFyYW1ldGVyVmFsdWUiLCJwYXJhbWV0ZXJOYW1lIiwiZXhwZWN0ZWRUeXBlcyIsInBhcmFtZXRlclR5cGUiLCJUeXBlRXJyb3IiLCJhc3NlcnRSYW5nZSIsImFzc2lnbiIsIlJhbmdlRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkEsQUFBTyxTQUFTQSxhQUFULENBQXVCQyxPQUF2QixFQUFnQ0MsU0FBaEMsRUFBMkM7U0FFOUNEOztHQUVHRSxPQUZILENBRVcseUJBRlgsRUFFc0MsVUFBU0MsQ0FBVCxFQUFZQyxRQUFaLEVBQXNCOztRQUd0RCxPQUFPSCxVQUFVRyxRQUFWLENBQVAsS0FBK0IsUUFBL0IsSUFDQUMsTUFBTUosVUFBVUcsUUFBVixDQUFOLENBRkYsRUFHRTthQUNPLEtBQVA7O1dBRUtFLEtBQUtDLFNBQUwsQ0FBZU4sVUFBVUcsUUFBVixDQUFmLENBQVA7R0FWSjs7R0FhR0YsT0FiSCxDQWFXLHVCQWJYLEVBYW9DLFVBQVNDLENBQVQsRUFBWUMsUUFBWixFQUFzQjtXQUMvQ0gsVUFBVUcsUUFBVixDQUFQO0dBZEosQ0FERjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxQ0YsU0FBU0ksYUFBVCxDQUF1QkMsTUFBdkIsRUFBK0I7O1NBRzNCQSxXQUFXLElBQVgsSUFDQSxLQUFLQSxNQUFMLEtBQWdCLGlCQURoQixJQUVBQSxPQUFPQyxXQUFQLEtBQXVCQyxNQUh6Qjs7Ozs7Ozs7Ozs7Ozs7O0FBbUJGLEFBQU8sU0FBU0MsVUFBVCxDQUFvQkMsS0FBcEIsRUFBMkJDLFdBQTNCLEVBQXdDO01BQ3pD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
