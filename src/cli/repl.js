const os = require("os");
const readlineSync = require("readline-sync");
const chalk = require("chalk");
const { read } = require("../reader/read");
const { evaluate } = require("../interpreter/evaluate");
const { print } = require("../printer/print");
const { inputFinished, countIndent } = require("./utils");

const DO_OVER = Symbol("DO_OVER");

const getInput = (prompt) => {
  try {
    return readlineSync.question(prompt);
  } catch (e) {
    console.error(chalk.redBright(`Error fetching input: ${e.message}`));
    return DO_OVER;
  }
};

const repl = (globalEnv) => {
  let prompt = "> ";
  let input = "";
  let indent = 0;
  let main = globalEnv.extend("__main__");

  const REP = (input) => {
    const ast = read(input);
    const result = evaluate(ast, main);
    const output = print(result);
    console.log(output);
  };

  // eslint-disable-next-line
  while (true) {
    let query = getInput(prompt + "  ".repeat(indent));

    if (query === DO_OVER) {
      continue;
    }

    input += query;

    if (input === "") {
      process.exit();
      break;
    }

    if (inputFinished(input)) {
      try {
        REP(input);
      } catch (e) {
        console.error(chalk.redBright(e.stack));
      } finally {
        input = "";
        prompt = "> ";
        indent = 0;
      }
    } else {
      input += os.EOL;
      indent = countIndent(input);
    }
  }
};

exports.repl = repl;
