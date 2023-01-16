const { Lexer } = require("./Lexer");

const tokenize = (input) => new Lexer(input).tokenize();

exports.tokenize = tokenize;
