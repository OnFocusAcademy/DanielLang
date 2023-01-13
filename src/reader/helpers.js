exports.isDigit = (ch) => /[0-9]/.test(ch);
exports.isHexDigit = (ch) => /[0-9a-fA-F]/.test(ch);
exports.isOctDigit = (ch) => /[0-7]/.test(ch);
exports.isBinDigit = (ch) => /[0-1]/.test(ch);
// eslint-disable-next-line
exports.isSymbolStart = (ch) => /[=<>%:\|\?\\\/\*\.\p{L}_\$!\+-]/.test(ch);
exports.isSymbolChar = (ch) =>
  // eslint-disable-next-line
  /[:=@~<>%:&\|\?\\\/\^\*\.&#'\p{L}\p{N}_\$!\+-]/.test(ch);
exports.isQuote = (ch) => /'/.test(ch);
exports.isDoubleQuote = (ch) => /"/.test(ch);
exports.isColon = (ch) => /:/.test(ch);
exports.isDot = (ch) => /\./.test(ch);
exports.isAmp = (ch) => /&/.test(ch);
exports.isSemicolon = (ch) => /;/.test(ch);
