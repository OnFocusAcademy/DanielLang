// eslint-disable-next-line
const { Token } = require("./Token");

/**
 * Manages the reader state after the input is tokenized
 * @property {Token[]} tokens
 * @property {Number} pos
 * @property {Number} length
 */
exports.Reader = class Reader {
  /**
   * Constructs the Reader class
   * @param {Token[]} tokens
   */
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
    this.length = tokens.length;
  }

  /**
   * Check if we've consumed the entire token stream
   * @returns {Boolean}
   */
  eof() {
    return this.pos >= this.length;
  }

  /**
   * Gets the nth token from the current pos
   * @param {Number} n
   * @returns {Token}
   */
  lookahead(n = 1) {
    return this.tokens[this.pos + n];
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
