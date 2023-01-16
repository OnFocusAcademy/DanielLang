const {
  isWhitespace,
  isSemicolon,
  isNewline,
  isSymbolStart,
  isSymbolChar,
  isColon,
  isMinus,
  isDigit,
  isZero,
  isHexDigit,
  isOctDigit,
  isBinDigit,
  isDot,
  isDoubleQuote,
  isLParen,
  isRParen,
  isLBrace,
  isRBrace,
  isQuote,
  isQQuote,
  isUQuote,
  isAt,
} = require("./helpers");
const { Input } = require("./Input");
// eslint-disable-next-line
const { Token, token } = require("./Token");
const { TokenTypes } = require("./TokenTypes");

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

  /**
   * Reads a string value with valid escape sequences
   */
  readEscaped() {
    let str = "";
    let escaped = false;
    let ended = false;

    while (!this.input.eof()) {
      let ch = this.input.next();

      if (escaped) {
        str += this.readEscapeSequence(ch);
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (isDoubleQuote(ch)) {
        ended = true;
        break;
      } else if (ch === "\n") {
        throw new Error(
          "Unexpected newline in nonterminated single-line string literal"
        );
      } else {
        str += ch;
      }
    }

    if (!ended && this.input.eof()) {
      throw new Error("Expected double quote to close string literal; got EOF");
    }

    return str;
  }

  /**
   * Read a valid escape sequence into a character
   * @returns {String}
   */
  readEscapeSequence(c) {
    let str = "";
    let seq = "";

    if (c === "n") {
      str += "\n";
    } else if (c === "b") {
      str += "\b";
    } else if (c === "f") {
      str += "\f";
    } else if (c === "r") {
      str += "\r";
    } else if (c === "t") {
      str += "\t";
    } else if (c === "v") {
      str += "\v";
    } else if (c === "0") {
      str += "\0";
    } else if (c === "'") {
      str += "'";
    } else if (c === '"') {
      str += '"';
    } else if (c === "\\") {
      str += "\\";
    } else if (c === "u" || c === "U") {
      // is Unicode escape sequence
      seq += this.input.readWhile(isHexDigit);
      str += String.fromCodePoint(parseInt(seq, 16));
    }

    return str;
  }

  /**
   * Read a keyword token
   * @returns {Token}
   */
  readKeyword() {
    const pos = this.input.pos;
    let kw = this.input.next();
    kw += this.input.readWhile(isSymbolChar);
    return token(TokenTypes.Keyword, kw, pos);
  }

  /**
   * Reads a number token
   * @returns {Token}
   */
  readNumber() {
    const pos = this.input.pos;
    let num = "";

    if (isMinus(this.input.peek())) {
      num += this.input.next();
    }

    if (isZero(this.input.peek())) {
      num += this.input.next();
      let numberType = "decimal";
      let nextChar = this.input.peek();

      if (nextChar === "x") {
        numberType = "hexadecimal";
      } else if (nextChar === "o") {
        numberType = "octal";
      } else if (nextChar === "b") {
        numberType = "binary";
      }

      if (numberType !== "decimal") {
        // consume the int type indicator
        num += this.input.next();

        if (numberType === "hexadecimal") {
          num += this.input.readWhile(isHexDigit);

          if (isDigit(this.input.peek())) {
            throw new Error(
              `Invalid character ${this.input.peek()} in hexadecimal integer literal`
            );
          }
        } else if (numberType === "octal") {
          num += this.input.readWhile(isOctDigit);

          if (isDigit(this.input.peek())) {
            throw new Error(
              `Invalid character ${this.input.peek()} in octal integer literal`
            );
          }
        } else {
          // must be binary
          num += this.input.readWhile(isBinDigit);

          if (isDigit(this.input.peek())) {
            throw new Error(
              `Invalid character ${this.input.peek()} in binary integer literal`
            );
          }
        }

        if (isDot(this.input.peek())) {
          throw new Error(
            `Only a decimal number may be read as floating point; ${numberType} given`
          );
        }
      } else {
        num += this.input.readWhile(isDigit);
      }
    } else {
      num += this.input.readWhile(isDigit);
    }

    if (isDot(this.input.peek())) {
      num += this.input.next();
      num += this.input.readWhile(isDigit);
    }

    if (this.input.peek() === "e") {
      num += this.input.next();

      if (this.input.peek() !== "+" && this.input.peek() !== "-") {
        throw new Error(
          `Exponential notation requires a plus or minus sign after the e; ${this.input.peek()} given`
        );
      }

      num += this.input.next();
      num += this.input.readWhile(isDigit);
    }

    return token(TokenTypes.Number, num, pos);
  }

  /**
   * Reads a string token
   * @returns {Token}
   */
  readString() {
    const pos = this.input.pos;
    this.input.skip(); // skip opening double quote
    let str = this.readEscaped();

    return token(TokenTypes.String, str, pos);
  }

  /**
   * Reads a symbol token
   * @returns {Token}
   */
  readSymbol() {
    const pos = this.input.pos;
    const sym = this.input.readWhile(isSymbolChar);

    if (sym === "Infinity" || sym === "-Infinity" || sym === "NaN") {
      return token(TokenTypes.Number, sym, pos);
    } else if (sym === "true" || sym === "false") {
      return token(TokenTypes.Boolean, sym, pos);
    } else if (sym === "nil") {
      return token(TokenTypes.Nil, sym, pos);
    }

    return token(TokenTypes.Symbol, sym, pos);
  }

  /**
   * Parses a string of code into tokens
   * @returns {Token[]}
   */
  tokenize() {
    /**
     * @type {Token[]}
     */
    let tokens = [];

    while (!this.input.eof()) {
      let char = this.input.peek();

      if (isWhitespace(char)) {
        // skip whitespace
        this.input.readWhile((c) => isWhitespace(c));
      } else if (isSemicolon(char)) {
        // skip comment
        this.input.readWhile((c) => !isNewline(c));
      } else if (isMinus(char)) {
        const next = this.input.lookahead(1);

        // if next char is a digit, treat it as a number
        // this leaves out potentially legal symbol names
        // under the technical syntactic definition, but
        // I just don't want to deal with trying to read
        // symbol names like -123_abc anyway so... lol
        if (isDigit(next)) {
          tokens.push(this.readNumber());
        } else {
          tokens.push(this.readSymbol());
        }
      } else if (isDigit(char)) {
        tokens.push(this.readNumber());
      } else if (isDoubleQuote(char)) {
        tokens.push(this.readString());
      } else if (isColon(char)) {
        tokens.push(this.readKeyword());
      } else if (isSymbolStart(char)) {
        tokens.push(this.readSymbol());
      } else if (isLParen(char)) {
        tokens.push(token(TokenTypes.LParen, char, this.input.pos));
        this.input.skip();
      } else if (isRParen(char)) {
        tokens.push(token(TokenTypes.RParen, char, this.input.pos));
        this.input.skip();
      } else if (isLBrace(char)) {
        tokens.push(token(TokenTypes.LBrace, char, this.input.pos));
        this.input.skip();
      } else if (isRBrace(char)) {
        tokens.push(token(TokenTypes.RBrace, char, this.input.pos));
        this.input.skip();
      } else if (isQuote(char)) {
        tokens.push(token(TokenTypes.Quote, char, this.input.pos));
        this.input.skip();
      } else if (isQQuote(char)) {
        tokens.push(token(TokenTypes.QQuote, char, this.input.pos));
        this.input.skip();
      } else if (isUQuote(char)) {
        const pos = this.input.pos;
        let sym = this.input.next();
        if (isAt(this.input.peek())) {
          sym = this.input.next();
          tokens.push(token(TokenTypes.SUQuote, sym, pos));
        } else {
          tokens.push(token(TokenTypes.UQuote, char, this.input.pos));
        }
      } else {
        throw new Error(`Unknown token ${char} at position ${this.input.pos}`);
      }
    }

    return tokens;
  }
};
