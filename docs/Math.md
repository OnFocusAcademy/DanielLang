# Math Module Documentation

The Math module is not added to the global environment, so you will need to explicitly import it.

This is a very small module, just created to make sure importing a native JavaScript module into the language works.

## Constants

#### PI

The number Pi.

Usage: `Math.PI`

#### Abs

Get the absolute value of a number.

Usage: `(Math.abs num)`

```clojure
(Math.abs 3) ;=> 3
(Math.abs -3) ;=> 3
```

#### Sqrt

Gets the square root of a number.

Usage: `(Math.sqrt num)`

```clojure
(Math.sqrt 4) ;=> 2
```

#### Pow

Raises `num` to the power `pow`.

Usage: `(Math.pow num pow)`

```clojure
(Math.pow 3 4) ;=> 81
```
