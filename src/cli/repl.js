const os = require("os");
const readlineSync = require("readline-sync");
const chalk = require("chalk");
const { read } = require("../reader/read");
const { evaluate } = require("../interpreter/evaluate");
const { print } = require("../printer/print");
const { inputFinished, countIndent } = require("./utils");
const { Env } = require("../interpreter/Env");
const { provides: core } = require("../../lib/js/core");

const DO_OVER = Symbol("DO_OVER");

const replEnv = Env.from(core);

const REP = (input) => {
  const ast = read(input);
  const output = evaluate(ast, replEnv);
  console.log(print(output));
};

const getInput = (prompt) => {
  try {
    return readlineSync.question(prompt);
  } catch (e) {
    console.error(chalk.redBright(`Error fetching input: ${e.message}`));
    return DO_OVER;
  }
};

const repl = () => {
  let prompt = "> ";
  let input = "";
  let indent = 0;

  // eslint-disable-next-line
  while (true) {
    let query = getInput(prompt + "  ".repeat(indent));

    if (query === DO_OVER) {
      continue;
    }

    input += query;

    if (input === "") {
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
      }
    } else {
      input += os.EOL;
      indent = countIndent(input);
    }
  }
};

exports.repl = repl;
