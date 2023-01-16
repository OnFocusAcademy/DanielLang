const { List } = require("../_internal/List");
const { Reader } = require("./Reader");
const { tokenize } = require("./tokenize");
const { TokenTypes } = require("./TokenTypes");

/**
 * Reads an atomic form (number, string, symbol, keyword, boolean, or nil)
 * @param {Reader} reader
 */
const readAtom = (reader) => {
  const token = reader.next();

  switch (token.type) {
    case TokenTypes.Number:
      return Number(token.value);
    case TokenTypes.String:
      return token.value;
    case TokenTypes.Boolean:
      return token.value === "true";
    case TokenTypes.Nil:
      return null;
    case TokenTypes.Keyword:
    case TokenTypes.Symbol:
      return Symbol.for(token.value);
    default:
      throw new Error(`Unexpected token type ${token.type}`);
  }
};

/**
 * Reads syntactic forms from the token stream
 * @param {Reader} reader
 */
const readForm = (reader) => {
  const token = reader.peek();

  switch (token.type) {
    default:
      return readAtom(reader);
  }
};

/**
 * Reads an input string into a syntax tree representing syntactic forms
 * @param {String} input
 */
exports.read = (input) => {
  const reader = new Reader(tokenize(input));
  const ast = new List();

  while (!reader.eof()) {
    ast.append(readForm(reader));
  }

  return ast;
};
