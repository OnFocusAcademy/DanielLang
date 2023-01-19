const path = require("path");
const { read } = require("../reader/read");
const { evaluate } = require("../interpreter/evaluate");
const { repl } = require("./repl");
const { global } = require("./global");
const { readfile } = require("./utils");

exports.run = (argv) => {
  switch (typeof argv[0]) {
    case "string": {
      const [pathString] = argv[0];
      const code = readfile(
        pathString.startsWith("//")
          ? path.join(process.cwd(), pathString)
          : pathString
      );
      let env = global.extend("<main>");
      return evaluate(read(code), env);
    }

    default:
      repl();
  }
};
