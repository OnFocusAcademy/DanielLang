const { read } = require("../reader/read");
const { evaluate } = require("../interpreter/evaluate");
const { print } = require("../printer/print");

const REP = (input) => {
  const ast = read(input);
  const output = evaluate(ast);
  console.log(print(output));
};

const repl = () => {};
