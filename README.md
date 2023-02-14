# Daniel Programming Language

A Lisp-like language with macros for learning about programming languages and interpreters.

This implementation is a simple tree-walking interpreter. It uses linked lists as its abstract syntax tree (AST) for homoiconicity between source code and the underlying data structure read by the interpreter.

## Namesake

Daniel is named after two people:

- My son, Daniel Barr, who is the joy of my life
- Programming languages professor and researcher Daniel P. Friedman, author of the groundbreaking textbook _Essentials of Programming Languages_ and many other works

## Installation

Currently there is no NPM package for Daniel. You'll need to clone the repository and then if you want `daniel` available as a global command you'll need to run `npm link` in the repo root directory.

## Usage

- `daniel`: start a REPL session
- `daniel -i <filename>`: start a REPL session with the definitions from `filename` loaded. Definitions will be available as Filename.definition, just as if it were a module.
- `daniel <filename>`: Evaluate the code in `filename`.

## Documentation

[Daniel Language documentation](./docs/README.md)
