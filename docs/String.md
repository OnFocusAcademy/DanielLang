# String Module Documentation

The String module is loaded into the global environment under the namespace String, so you use its functions like `(String.upcase "hi")`, which returns "HI".

## Functions

#### Upcase

Uppercases a string.

Usage: `(String.upcase str)`

```clojure
(String.upcase "hi") ;=> "HI"
```

#### Downcase

Lowercases a string.

Usage: `(String.downcase str)`

```clojure
(String.downcase "HI") ;=> "hi"
```

#### Capitalize

Capitalizes the first letter of a string and lowercases the rest.

Usage: `(String.capitalize str)`

```clojure
(String.capitalize "the quick brown fox") ;=> "The quick brown fox"
```

#### Trim

Trims whitespace off the ends of a string

Usage: `(String.trim str)`

```clojure
(String.trim "   hi   ") ;=> "hi"
```

#### Split

Splits a string up into a list on the `delimiter` character, defaults to per UTF-16 character.

Usage: `(String.split str [delimiter=""])`

```clojure
(String.split "Hello there", " ") ;=> ("Hello" "there")
```

#### Starts-with?

Checks to see if `str` begins with `starts`.

Usage: `(String.starts-with? starts str)`

```clojure
(String.starts-with? "ab", "abcd") ;=> true
(String.starts-with? "z", "abcd") ;=> false
```

#### Ends-with?

Checks to see if `str` ends with `ends`.

Usage: `(String.ends-with? ends str)`

```clojure
(String.ends-with? "d", "abcd") ;=> true
```

#### Code-point-at

Gets the Unicode code point at `index`.

Usage: `(String.code-point-at index str)`

```clojure
(String.code-point-at 2 "Hello") ;=> 101
```

#### From-code-point

Gets the character for each code point given to it and returns a string with those characters.

Usage: `(String.from-code-point char1 ...)`

```clojure
(String.from-code-point 101 65) ;=> "eA"
```

#### Replace

Replaces `search` with `replace` in `str`.

Usage: `(String.replace str search replace)`

```clojure
(String.replace "Hello", "H", "J") ;=> "Jello"
```

#### Includes?

Checks if `str` includes `search`.

Usage: `(String.includes search str)`

```clojure
(String.includes "Hello", "Hello world") ;=> true
```

#### Chars

Splits a string up into a list of its characters (Unicode scalars, which can be represented as individual code points).

Usage: `(String.chars str)`

```clojure
(String.chars "😀😁😂") ;=> (😀 😁 😂)
```

#### Join

Joins a list's contents (presumably strings) into a single string

Usage: `(String.join list [separator=""])`

```clojure
(define names ["Jason", "Gretchen", "Daniel"])
(String.join(names, " and ")) ;=> "Jason and Gretchen and Daniel"
```
