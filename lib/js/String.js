const { makeModule, makeFunction } = require("../../src/runtime");
const { capitalize } = require("../../src/utils");
const { list } = require("../../src/_internal/List");
const { print } = require("../../src/printer/print");

const NAME = "String";

// eslint-disable-next-line
module.exports = makeModule(NAME, () => ({
  upcase: makeFunction((str) => str.toUpperCase(), {
    name: `${NAME}.upcase`,
  }),
  downcase: makeFunction((str) => str.toLowerCase(), {
    name: `${NAME}.downcase`,
  }),
  capitalize: makeFunction(capitalize, { name: `${NAME}.capitalize` }),
  trim: makeFunction((str) => str.trim(), { name: `${NAME}.trim` }),
  split: makeFunction((str, delimiter = "") => list(...str.split(delimiter)), {
    name: `${NAME}.split`,
  }),
  "starts-with?": makeFunction((start, str) => str.startsWith(start), {
    name: `${NAME}.starts-with?`,
  }),
  "ends-with?": makeFunction((end, str) => str.endsWith(end), {
    name: `${NAME}.ends-with?`,
  }),
  "code-point-at": makeFunction((idx, str) => str.codePointAt(idx), {
    name: `${NAME}.code-point-at`,
  }),
  "from-code-point": makeFunction((cp) => String.fromCodePoint(cp), {
    name: `${NAME}.from-code-point`,
  }),
  replace: makeFunction(
    (str, search, replace) => str.replace(search, replace),
    { name: `${NAME}.replace` }
  ),
  "includes?": makeFunction((search, str) => str.includes(search), {
    name: `${NAME}.includes?`,
  }),
  // separates a string into a list of Unicode scalars (representable by a single code point)
  chars: makeFunction((str) => list(...str), { name: `${NAME}.chars` }),
  join: makeFunction((list, separator = "") => list.join(separator, print), {
    name: `${NAME}.join`,
  }),
}));
