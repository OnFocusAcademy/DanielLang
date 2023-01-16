const { List } = require("../_internal/List");
const { Reader } = require("./Reader");
const { tokenize } = require("./tokenize");
const { TokenTypes } = require("./TokenTypes");

/**
 * @typedef {number|string|symbol|boolean|null} Atom
 */
/**
 * @typedef {Atom|Map|Array|List} AST
 */

/**
 * Reads an atomic form (number, string, symbol, keyword, boolean, or nil)
 * @param {Reader} reader
 * @returns {Atom}
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
 * @returns {AST}
 */
const readForm = (reader) => {
  const token = reader.peek();

  switch (token.type) {
    case TokenTypes.RParen:
    case TokenTypes.RBrack:
    case TokenTypes.RBrace:
      throw new Error(`Unexpected ${token.value}`);
    case TokenTypes.LParen:
      // eslint-disable-next-line
      const l = readList(reader, TokenTypes.LParen, TokenTypes.RParen);
      return l.length === 0 ? null : l;
    default:
      return readAtom(reader);
  }
};

/**
 * Reads a list form into a Daniel data structure
 * @param {Reader} reader
 * @param {TokenTypes} start a token type
 * @param {TokenTypes} end a token type
 */
const readList = (reader, start, end) => {
  let token = reader.next();
  let ast = new List();

  if (token.type !== start) {
    throw new Error(`Expected ${start}; got ${token.type}`);
  }

  token = reader.peek();

  while (token?.type !== end) {
    if (!token) {
      // Whoops, we're past the end of the token stream
      throw new Error(`Expected ${end}; got EOF`);
    }

    ast.append(readForm(reader));
    token = reader.peek();
  }

  return ast;
};

/**
 * Reads an input string into a syntax tree representing syntactic forms
 * @param {String} input
 */
const read = (input) => {
  const reader = new Reader(tokenize(input));
  const ast = new List();

  while (!reader.eof()) {
    ast.append(readForm(reader));
  }

  return ast;
};

exports.read = read;

console.log(read(`123`));
