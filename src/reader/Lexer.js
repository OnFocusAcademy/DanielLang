const { Input } = require("./Input");

/**
 * Class holding the functions that tokenize an input string
 * @property {Input} input
 */
exports.Lexer = class Lexer {
  /**
   * Constructs the Lexer object
   * @param {String} input program to lex
   */
  constructor(input) {
    this.input = new Input(input);
  }
};
