const path = require("path");
const { read } = require("../reader/read");
const { evaluate } = require("../interpreter/evaluate");
const { repl } = require("./repl");
const { global } = require("./global");
const { readfile } = require("./utils");

exports.run = (argv) => {
  const [fst] = argv;

  switch (typeof fst) {
    case "string": {
      if (fst === "-i") {
        const [, pathString] = argv;
        const code = readfile(
          pathString.startsWith("//")
            ? path.join(process.cwd(), pathString)
            : pathString
        );

        global.set(Symbol.for("argv"), argv);
        const moduleName = `__${path.basename(pathString).split(".")[0]}__`;
        const moduleEnv = global.extend(moduleName);

        evaluate(read(code), moduleEnv);
        const namespace = moduleEnv.toModule();
        global.set(Symbol.for(moduleName), namespace);

        repl(global);
        break;
      }
      const pathString = fst;
      const code = readfile(
        pathString.startsWith("//")
          ? path.join(process.cwd(), pathString)
          : pathString
      );
      global.set(Symbol.for("argv"), argv);
      let env = global.extend("__main__");
      return evaluate(read(code), env);
    }

    default:
      global.set(Symbol.for("argv"), argv);
      repl();
  }
};
