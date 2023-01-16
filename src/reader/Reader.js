// eslint-disable-next-line
const { Token } = require("./Token");

/**
 * Manages the reader state after the input is tokenized
 * @property {Token[]} tokens
 * @property {Number} pos
 */
exports.Reader = class Reader {
  /**
   * Constructs the Reader class
   * @param {Token[]} tokens
   */
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  /**
   * Get the current token
   * @returns {Token}
   */
  peek() {
    return this.tokens[this.pos];
  }

  /**
   * Get the current token and advance the token stream by 1
   * @returns {Token}
   */
  next() {
    return this.tokens[this.pos++];
  }

  /**
   * Advance the token stream without returning the current token
   */
  skip() {
    this.pos++;
  }
};
