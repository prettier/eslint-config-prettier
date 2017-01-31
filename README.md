# eslint-config-prettier [![Build Status][travis-badge]][travis]

Turns all rules that are unnecessary or might conflict with [prettier] off.

This let’s you use you favorite shareable config without letting its stylistic
choices get in the way when using prettier.

Intended to be used together with [eslint-plugin-prettier].

## Installation

First, install [eslint-plugin-prettier]. Follow the instructions over there.

Then, install eslint-config-prettier:

```
$ npm install --save-dev eslint-config-prettier
```

Finally, add eslint-config-prettier to the "extends" array in your `.eslintrc.*`
file. Make sure to put it **last,** so it gets the chance to override other
configs.

```json
{
  "extends": [
    "prettier"
  ]
}
```

If you use [React] and [eslint-plugin-react], there are exclusions for those
rules as well:

```json
{
  "extends": [
    "prettier",
    "prettier/react"
  ]
}
```

Do you know of some other eslint plugin that contains rules that
eslint-plugin-prettier could turn off? Send a pull request!

## CLI helper tool

eslint-config-prettier also ships with a little CLI tool to help you check if
your configuration contains any rules that are unnecessary or conflict with
prettier.

First, add a script for it to package.json:

```json
{
  "scripts": {
    "eslint-check": "eslint --print-config .eslintrc.js | eslint-config-prettier-check"
  }
}
```

Then run `npm run eslint-check`.

(Swap out .eslintrc.js with the path to your config if needed.)

## Example configuration

```json
{
  "extends": [
    "google",
    "plugin:react/all",
    "prettier",
    "prettier/react"
  ],
  "plugins": [
    "react",
    "prettier"
  ],
  "parserOptions": {
    "ecmaVersion": 2016,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "env": {
    "es6": true,
    "node": true
  },
  "rules": {
    "prettier/prettier": "error"
  }
}
```

## Exceptions

There a few rules that eslint-config-prettier disables that actually can be
enabled in some cases.

### [max-len]

Usually, prettier takes care of following a maximum line length automatically.
However, there are cases where prettier can’t do anything, such as for long
strings, regular expressions and comments. Those need to be split up by a human.

If you’d like to enforce an even stricter maximum line length policy than
prettier can provide automatically, you can enable this rule. Just remember to
keep `max-len`’s options and prettier’s `printWidth` option in sync.

Example configuration:

```json
{
  "rules": {
    "max-len": ["error", {"code": 80, "ignoreUrls": true}]
  }
}
```

### [no-mixed-operators]

This rule forbids mixing certain operators, such as `&&` and `||`.

For example, the rule could warn about this line:

```js
var foo = a && b || c;
```

The rule suggests adding parentheses, like this:

```js
var foo = (a && b) || c;
```

However, prettier prints the minimum amount of parentheses technically needed,
turning it back to:

```js
var foo = a && b || c;
```

If you want to use this rule with prettier, you need to split the expression
into another variable:

```js
var bar = a && b;
var foo = bar || c;
```

Example configuration:

```json
{
  "rules": {
    "no-mixed-operators": "error"
  }
}
```

### [quotes]

If you’d like to enforce the use of backticks rather than single or double
quotes for strings, you can enable this rule. Otherwise, there’s no need to.
Just remember to enable the `"backtick"` option!

Example configuration:

```json
{
  "rules": {
    "quotes": ["error", "backtick"]
  }
}
```

## License

[MIT](LICENSE).

[eslint-plugin-prettier]: https://github.com/not-an-aardvark/eslint-plugin-prettier
[eslint-plugin-react]: https://github.com/yannickcr/eslint-plugin-react
[max-len]: http://eslint.org/docs/rules/max-len
[no-mixed-operators]: http://eslint.org/docs/rules/no-mixed-operators
[prettier]: https://github.com/jlongster/prettier
[quotes]: http://eslint.org/docs/rules/quotes
[React]: https://facebook.github.io/react/
[travis-badge]: https://travis-ci.org/lydell/eslint-config-prettier.svg?branch=master
[travis]: https://travis-ci.org/lydell/eslint-config-prettier
