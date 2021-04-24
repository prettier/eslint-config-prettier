# eslint-config-prettier

Turns off all rules that are unnecessary or might conflict with [Prettier].

This lets you use your favorite shareable config without letting its stylistic choices get in the way when using Prettier.

Note that this config _only_ turns rules _off,_ so it only makes sense using it together with some other config.

---

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
  - [Excluding deprecated rules](#excluding-deprecated-rules)
- [CLI helper tool](#cli-helper-tool)
  - [Legacy](#legacy)
- [Special rules](#special-rules)
  - [arrow-body-style and prefer-arrow-callback](#arrow-body-style-and-prefer-arrow-callback)
  - [curly](#curly)
  - [lines-around-comment](#lines-around-comment)
  - [max-len](#max-len)
  - [no-confusing-arrow](#no-confusing-arrow)
  - [no-mixed-operators](#no-mixed-operators)
  - [no-tabs](#no-tabs)
  - [no-unexpected-multiline](#no-unexpected-multiline)
  - [quotes](#quotes)
    - [Enforce backticks](#enforce-backticks)
    - [Forbid unnecessary backticks](#forbid-unnecessary-backticks)
      - [Example double quote configuration](#example-double-quote-configuration)
      - [Example single quote configuration](#example-single-quote-configuration)
  - [vue/html-self-closing](#vuehtml-self-closing)
- [Other rules worth mentioning](#other-rules-worth-mentioning)
  - [no-sequences](#no-sequences)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

Install eslint-config-prettier:

```
npm install --save-dev eslint-config-prettier
```

Then, add `"prettier"` to the "extends" array in your `.eslintrc.*` file. Make sure to put it **last,** so it gets the chance to override other configs.

<!-- prettier-ignore -->
```json
{
  "extends": [
    "some-other-config-you-use",
    "prettier"
  ]
}
```

That’s it! Extending `"prettier"` turns off a bunch of core ESLint rules, as well as a few rules from these plugins:

- [@typescript-eslint/eslint-plugin]
- [@babel/eslint-plugin]
- [eslint-plugin-babel]
- [eslint-plugin-flowtype]
- [eslint-plugin-react]
- [eslint-plugin-standard]
- [eslint-plugin-unicorn]
- [eslint-plugin-vue]

> 👉 Using [eslint-plugin-prettier]? Check out [eslint-plugin-prettier’s recommended config][eslint-plugin-prettier-recommended].

> ℹ️ Note: You might find guides on the Internet saying you should also extend stuff like `"prettier/react"`. Since version 8.0.0 of eslint-config-prettier, all you need to extend is `"prettier"`! That includes all plugins.

### Excluding deprecated rules

Some of the rules that eslint-config-prettier turns off may be deprecated. **This is perfectly fine,** but if you really need to omit the deprecated rules, you can do so by setting the `ESLINT_CONFIG_PRETTIER_NO_DEPRECATED` environment variable to a non-empty value. For example:

```
env ESLINT_CONFIG_PRETTIER_NO_DEPRECATED=true npx eslint-find-rules --deprecated index.js
```

## CLI helper tool

eslint-config-prettier also ships with a little CLI tool to help you check if your configuration contains any rules that are unnecessary or conflict with Prettier.

You can run it using `npx`:

```
npx eslint-config-prettier path/to/main.js
```

(Change `path/to/main.js` to a file that exists in your project.)

In theory you need to run the tool for every single file in your project to be 100% sure that there are no conflicting rules, because ESLint supports having different rules for different files. But usually you’ll have about the same rules for all files, so it is good enough to run the command on one file. But if you use [multiple configuration files] or [overrides], you can provide several files check:

```
npx eslint-config-prettier index.js test/index.js legacy/main.js
```

Exit codes:

- 0: No problems found.
- 1: Unexpected error.
- 2: Conflicting rules found.

### Legacy

eslint-config-prettier versions before 7.0.0 had a slightly different CLI tool that was run in a different way. For example:

```
npx eslint --print-config index.js | npx eslint-config-prettier-check
```

If you find something like that in a tutorial, this is what the command looks like in 7.0.0 or later:

```
npx eslint-config-prettier index.js
```

## Special rules

There a few rules that eslint-config-prettier disables that actually can be enabled in some cases.

- Some require certain options. The CLI helper tool validates this.
- Some require special attention when writing code. The CLI helper tool warns you if any of those rules are enabled, but can’t tell if anything is problematic.
- Some can cause problems if using [eslint-plugin-prettier] and `--fix`.

For maximum ease of use, the special rules are disabled by default (provided that you include all needed things in `"extends"`). If you want them, you need to explicitly specify them in your ESLint config.

### [arrow-body-style] and [prefer-arrow-callback]

**These rules might cause problems if using [eslint-plugin-prettier] and `--fix`.**

See the [`arrow-body-style` and `prefer-arrow-callback` issue][eslint-plugin-prettier-autofix-issue] for details.

There are a couple of ways to turn these rules off:

- Put `"plugin:prettier/recommended"` in your `"extends"`. That’s [eslint-<strong>plugin</strong>-prettier’s recommended config][eslint-plugin-prettier-recommended].
- Put `"prettier/prettier"` in your `"extends"`. (Yes, there’s both a _rule_ called `"prettier/prettier"` and a _config_ called `"prettier/prettier"`.)
- Remove them from your config or turn them off manually.

It doesn’t matter which approach you use. `"plugin:prettier/recommended"` is probably the easiest.

Note: The CLI tool only reports these as problematic if the `"prettier/prettier"` _rule_ is enabled for the same file.

These rules are safe to use if you don’t use [eslint-plugin-prettier]. In other words, if you run `eslint --fix` and `prettier --write` as separate steps.

### [curly]

**This rule requires certain options.**

If a block (for example after `if`, `else`, `for` or `while`) contains only one statement, JavaScript allows omitting the curly braces around that statement. This rule enforces if or when those optional curly braces should be omitted.

If you use the `"multi-line"` or `"multi-or-nest"` option, the rule can conflict with Prettier.

For example, the `"multi-line"` option allows this line:

<!-- prettier-ignore -->
```js
if (cart.items && cart.items[0] && cart.items[0].quantity === 0) updateCart(cart);
```

However, Prettier might consider the line too long and turn it into the following, which the `"multi-line"` option does _not_ allow:

<!-- prettier-ignore -->
```js
if (cart.items && cart.items[0] && cart.items[0].quantity === 0)
  updateCart(cart);
```

If you like this rule, it can be used just fine with Prettier as long as you don’t use the `"multi-line"` or `"multi-or-nest"` option.

Example ESLint configuration:

<!-- prettier-ignore -->
```json
{
  "rules": {
    "curly": ["error", "all"]
  }
}
```

### [lines-around-comment]

**This rule can be used with certain options.**

This rule requires empty lines before and/or after comments. Prettier preserves blank lines, with two exceptions:

- Several blank lines in a row are collapsed into a single blank line. This is fine.
- Blank lines at the beginning and end of blocks, objects and arrays are always removed. This may lead to conflicts.

By default, ESLint requires a blank line above the comment is this case:

<!-- prettier-ignore -->
```js
if (result) {

  /* comment */
  return result;
}
```

However, Prettier removes the blank line:

<!-- prettier-ignore -->
```js
if (result) {
  /* comment */
  return result;
}
```

If you like this rule, it can be used just fine with Prettier as long as you add some extra configuration to allow comments at the start and end of blocks, objects and arrays.

Example ESLint configuration:

<!-- prettier-ignore -->
```json
{
  "rules": {
    "lines-around-comment": [
      "error",
      {
        "beforeBlockComment": true,
        "afterBlockComment": true,
        "beforeLineComment": true,
        "afterLineComment": true,
        "allowBlockStart": true,
        "allowBlockEnd": true,
        "allowObjectStart": true,
        "allowObjectEnd": true,
        "allowArrayStart": true,
        "allowArrayEnd": true
      }
    ]
  }
}
```

### [max-len]

(The following applies to [vue/max-len] as well.)

**This rule requires special attention when writing code.**

Usually, Prettier takes care of following a maximum line length automatically. However, there are cases where Prettier can’t do anything, such as for long strings, regular expressions and comments. Those need to be split up by a human.

If you’d like to enforce an even stricter maximum line length policy than Prettier can provide automatically, you can enable this rule. Just remember to keep `max-len`’s options and Prettier’s `printWidth` option in sync.

Keep in mind that you might have to refactor code slightly if Prettier formats lines in a way that the `max-len` rule does not approve of.

Example ESLint configuration:

<!-- prettier-ignore -->
```json
{
  "rules": {
    "max-len": ["error", {"code": 80, "ignoreUrls": true}]
  }
}
```

### [no-confusing-arrow]

**This rule requires certain options.**

For example, the rule could warn about this line:

<!-- prettier-ignore -->
```js
var x = a => 1 ? 2 : 3;
```

With `{allowParens: true}` (the default since ESLint 6.0.0), adding parentheses is considered a valid way to avoid the arrow confusion:

<!-- prettier-ignore -->
```js
var x = a => (1 ? 2 : 3);
```

While Prettier keeps those parentheses, it removes them if the line is long enough to introduce a line break:

<!-- prettier-ignore -->
```js
EnterpriseCalculator.prototype.calculateImportantNumbers = inputNumber =>
  1 ? 2 : 3;
```

With `{allowParens: false}`, ESLint instead suggests switching to an explicit return:

<!-- prettier-ignore -->
```js
var x = a => { return 1 ? 2 : 3; };
```

That causes no problems with Prettier.

If you like this rule, it can be used just fine with Prettier as long as the `allowParens` option is off.

Example ESLint configuration:

<!-- prettier-ignore -->
```json
{
  "rules": {
    "no-confusing-arrow": ["error", { "allowParens": false }]
  }
}
```

(Note: The CLI helper tool considers `{allowParens: true}` to be the default, which is the case since ESLint 6.0.0. The tool will produce a warning if you use the default even if you use an older version of ESLint. It doesn’t hurt to explicitly set `{allowParens: false}` even though it is technically redundant. This way you are prepared for a future ESLint upgrade and the CLI tool can be kept simple.)

### [no-mixed-operators]

**This rule requires special attention when writing code.**

This rule forbids mixing certain operators, such as `&&` and `||`.

For example, the rule could warn about this line:

<!-- prettier-ignore -->
```js
var foo = a + b * c;
```

The rule suggests adding parentheses, like this:

<!-- prettier-ignore -->
```js
var foo = a + (b * c);
```

However, Prettier removes many “unnecessary” parentheses, turning it back to:

<!-- prettier-ignore -->
```js
var foo = a + b * c;
```

If you want to use this rule with Prettier, you need to split the expression into another variable:

<!-- prettier-ignore -->
```js
var bar = b * c;
var foo = a + bar;
```

Keep in mind that Prettier prints _some_ “unnecessary” parentheses, though:

<!-- prettier-ignore -->
```js
var foo = (a && b) || c;
```

Example ESLint configuration:

<!-- prettier-ignore -->
```json
{
  "rules": {
    "no-mixed-operators": "error"
  }
}
```

### [no-tabs]

**This rule requires certain options.**

This rule disallows the use of tab characters. By default the rule forbids _all_ tab characters. That can be used just fine with Prettier as long as you don’t configure Prettier to indent using tabs.

Luckily, it’s possible to configure the rule so that it works regardless of whether Prettier uses spaces or tabs: Set `allowIndentationTabs` to `true`. This way Prettier takes care of your indentation, while the `no-tabs` takes care of potential tab characters anywhere else in your code.

Example ESLint configuration:

<!-- prettier-ignore -->
```json
{
  "rules": {
    "no-tabs": ["error", {"allowIndentationTabs": true}]
  }
}
```

### [no-unexpected-multiline]

**This rule requires special attention when writing code.**

This rule disallows confusing multiline expressions where a newline looks like it is ending a statement, but is not.

For example, the rule could warn about this:

<!-- prettier-ignore -->
```js
var hello = "world"
[1, 2, 3].forEach(addNumber)
```

Prettier usually formats this in a way that makes it obvious that a semicolon was missing:

<!-- prettier-ignore -->
```js
var hello = "world"[(1, 2, 3)].forEach(addNumber);
```

However, there are cases where Prettier breaks things into several lines such that the `no-unexpected-multiline` conflicts.

<!-- prettier-ignore -->
```js
const value = text.trim().split("\n")[position].toLowerCase();
```

Prettier breaks it up into several lines, though, causing a conflict:

<!-- prettier-ignore -->
```js
const value = text
  .trim()
  .split("\n")
  [position].toLowerCase();
```

If you like this rule, it can usually be used with Prettier without problems, but occasionally you might need to either temporarily disable the rule or refactor your code.

<!-- prettier-ignore -->
```js
const value = text
  .trim()
  .split("\n")
  // eslint-disable-next-line no-unexpected-multiline
  [position].toLowerCase();

// Or:

const lines = text.trim().split("\n");
const value = lines[position].toLowerCase();
```

**Note:** If you _do_ enable this rule, you have to run ESLint and Prettier as two separate steps (and ESLint first) in order to get any value out of it. Otherwise Prettier might reformat your code in such a way that ESLint never gets a chance to report anything (as seen in the first example).

Example configuration:

<!-- prettier-ignore -->
```json
{
  "rules": {
    "no-unexpected-multiline": "error"
  }
}
```

### [quotes]

(The following applies to [babel/quotes] and [@typescript-eslint/quotes] as well.)

**This rule requires certain options and certain Prettier options.**

Usually, you don’t need this rule at all. But there are two cases where it could be useful:

- To enforce the use of backticks rather than single or double quotes for strings.
- To forbid backticks where regular strings could have been used.

#### Enforce backticks

If you’d like all strings to use backticks (never quotes), enable the `"backtick"` option.

Example ESLint configuration:

<!-- prettier-ignore -->
```json
{
  "rules": {
    "quotes": ["error", "backtick"]
  }
}
```

#### Forbid unnecessary backticks

In the following example, the first array item could have been written with quotes instead of backticks.

<!-- prettier-ignore -->
```js
const strings = [
  `could have been a regular string`,
  `
    multiple
    lines
  `,
  `uses ${interpolation}`,
  String.raw`\tagged/`,
];
```

If you’d like ESLint to enforce `` `could have been a regular string` `` being written as either `"could have been a regular string"` or `'could have been a regular string'`, you need to use some specific configuration. The `quotes` rule has two options, a string option and an object option.

- The first (string) option needs to be set to `"single"` or `"double"` and be kept in sync with Prettier’s [singleQuote] option.
- The second (object) option needs the following properties:
  - `"avoidEscape": true` to follow Prettier’s [string formatting rules].
  - `"allowTemplateLiterals": false` to disallow unnecessary backticks.

##### Example double quote configuration

ESLint:

<!-- prettier-ignore -->
```json
{
  "rules": {
    "quotes": [
      "error",
      "double",
      { "avoidEscape": true, "allowTemplateLiterals": false }
    ]
  }
}
```

Prettier (this is the default, so adding this is not required):

<!-- prettier-ignore -->
```json
{
  "singleQuote": false
}
```

##### Example single quote configuration

ESLint:

<!-- prettier-ignore -->
```json
{
  "rules": {
    "quotes": [
      "error",
      "single",
      { "avoidEscape": true, "allowTemplateLiterals": false }
    ]
  }
}
```

Prettier:

<!-- prettier-ignore -->
```json
{
  "singleQuote": true
}
```

### [vue/html-self-closing]

**This rule requires certain options.**

This rule enforces whether elements should be self-closing or not.

Prettier generally preserves the way you wrote your elements:

<!-- prettier-ignore -->
```vue
<div />
<div></div>
<MyComponent />
<MyComponent></MyComponent>
<svg><path d="" /></svg>
<svg><path d=""></path></svg>
```

But for known _void_ HTML elements, Prettier always uses the self-closing style. For example, `<img>` is turned into `<img />`.

If you like this rule, it can be used just fine with Prettier as long as you set `html.void` to `"any"`.

Example ESLint configuration:

<!-- prettier-ignore -->
```json
{
  "rules": {
    "vue/html-self-closing": [
      "error",
      {
        "html": {
          "void": "any"
        }
      }
    ]
  }
}
```

## Other rules worth mentioning

These rules don’t conflict with Prettier, but have some gotchas when used with Prettier.

### [no-sequences]

This rule forbids using JavaScript’s confusing comma operator (sequence expressions). This piece of code is not doing what it looks like:

<!-- prettier-ignore -->
```js
matrix[4, 7];
```

Prettier adds parentheses to the above to make it clear that a sequence expression is used:

<!-- prettier-ignore -->
```js
matrix[(4, 7)];
```

However, the `no-sequences` rule allows comma operators if the expression sequence is explicitly wrapped in parentheses. Since Prettier automatically wraps them in parentheses, you might never see any warnings from ESLint about comma operators.

Ending up with an accidental sequence expression can easily happen while refactoring. If you want ESLint to catch such mistakes, it is recommended to forbid sequence expressions entirely using [no-restricted-syntax] \([as mentioned in the `no-sequences` documentation][no-sequences-full]):

<!-- prettier-ignore -->
```json
{
  "rules": {
    "no-restricted-syntax": ["error", "SequenceExpression"]
  }
}
```

If you still need to use the comma operator for some edge case, you can place an `// eslint-disable-next-line no-restricted-syntax` comment on the line above the expression. `no-sequences` can safely be disabled if you use the `no-restricted-syntax` approach.

You can also supply a custom message if you want:

<!-- prettier-ignore -->
```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "SequenceExpression",
        "message": "The comma operator is confusing and a common mistake. Don’t use it!"
      }
    ]
  }
}
```

## Contributing

eslint-config-prettier has been tested with:

- ESLint 7.25.0
  - eslint-config-prettier 7.0.0 requires ESLint 7.0.0 or newer, while eslint-config-prettier 6.15.0 and older should also work with ESLint versions down to 3.x.
  - eslint-config-prettier 6.11.0 and older were tested with ESLint 6.x
  - eslint-config-prettier 5.1.0 and older were tested with ESLint 5.x
  - eslint-config-prettier 2.10.0 and older were tested with ESLint 4.x
  - eslint-config-prettier 2.1.1 and older were tested with ESLint 3.x
- prettier 2.2.1
- @babel/eslint-plugin 7.13.16
- @typescript-eslint/eslint-plugin 4.22.0
- eslint-plugin-babel 5.3.1
- eslint-plugin-flowtype 5.7.2
- eslint-plugin-prettier 3.4.0
- eslint-plugin-react 7.23.2
- eslint-plugin-standard 4.0.2
- eslint-plugin-unicorn 31.0.0
- eslint-plugin-vue 7.9.0

Have new rules been added since those versions? Have we missed any rules? Is there a plugin you would like to see exclusions for? Open an issue or a pull request!

If you’d like to add support for eslint-plugin-foobar, this is how you’d go about it:

First, add rules to `index.js`:

<!-- prettier-ignore -->
```js
"foobar/some-rule": "off"
```

Then, create `test-lint/foobar.js`:

<!-- prettier-ignore -->
```js
/* eslint-disable quotes */
"use strict";

// Prettier does not want spaces before the parentheses, but
// `plugin:foobar/recommended` wants one.
console.log();
```

`test-lint/foobar.js` must fail when used with eslint-plugin-foobar and eslint-plugin-prettier at the same time – until `"prettier/foobar"` is added to the "extends" property of an ESLint config. The file should be formatted according to Prettier, and that formatting should disagree with the plugin.

Finally, you need to mention the plugin in several places:

- Add eslint-plugin-foobar to the "devDependencies" field in `package.json`.
- Make sure that at least one rule from eslint-plugin-foobar gets used in `.eslintrc.base.js`.
- Add it to the lists of supported plugins and in this `README.md`.

When you’re done, run `npm test` to verify that you got it all right. It runs several other npm scripts:

- `"test:lint"` makes sure that the files in `test-lint/` pass ESLint when the exclusions from eslint-config-prettier are used. It also lints the code of eslint-config-prettier itself, and checks that Prettier has been run on all files.
- `"test:lint-verify-fail"` is run by a test in `test/lint-verify-fail.test.js`.
- `"test:lint-rules"` is run by a test in `test/rules.test.js`.
- `"test:jest"` runs unit tests that check a number of things:
  - That eslint-plugin-foobar is mentioned in all the places shown above.
  - That no unknown rules are turned off. This helps catching typos, for example.
  - That the CLI works.
- `"test:cli-sanity"` and `"test:cli-sanity-warning"` are sanity checks for the CLI.

## License

[MIT](LICENSE).

[@babel/eslint-plugin]: https://github.com/babel/babel/tree/main/eslint/babel-eslint-plugin
[@typescript-eslint/eslint-plugin]: https://github.com/typescript-eslint/typescript-eslint
[@typescript-eslint/quotes]: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/quotes.md
[arrow-body-style]: https://eslint.org/docs/rules/arrow-body-style
[babel/quotes]: https://github.com/babel/eslint-plugin-babel#rules
[curly]: https://eslint.org/docs/rules/curly
[eslint-plugin-babel]: https://github.com/babel/eslint-plugin-babel
[eslint-plugin-flowtype]: https://github.com/gajus/eslint-plugin-flowtype
[eslint-plugin-prettier-autofix-issue]: https://github.com/prettier/eslint-plugin-prettier#arrow-body-style-and-prefer-arrow-callback-issue
[eslint-plugin-prettier-recommended]: https://github.com/prettier/eslint-plugin-prettier#recommended-configuration
[eslint-plugin-prettier]: https://github.com/prettier/eslint-plugin-prettier
[eslint-plugin-react]: https://github.com/yannickcr/eslint-plugin-react
[eslint-plugin-standard]: https://github.com/xjamundx/eslint-plugin-standard
[eslint-plugin-unicorn]: https://github.com/sindresorhus/eslint-plugin-unicorn
[eslint-plugin-vue]: https://github.com/vuejs/eslint-plugin-vue
[lines-around-comment]: https://eslint.org/docs/rules/lines-around-comment
[max-len]: https://eslint.org/docs/rules/max-len
[multiple configuration files]: https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
[no-confusing-arrow]: https://eslint.org/docs/rules/no-confusing-arrow
[no-mixed-operators]: https://eslint.org/docs/rules/no-mixed-operators
[no-restricted-syntax]: https://eslint.org/docs/rules/no-restricted-syntax
[no-sequences-full]: https://eslint.org/docs/rules/no-sequences#when-not-to-use-it
[no-sequences]: https://eslint.org/docs/rules/no-sequences
[no-tabs]: https://eslint.org/docs/rules/no-tabs
[no-unexpected-multiline]: https://eslint.org/docs/rules/no-unexpected-multiline
[overrides]: https://eslint.org/docs/user-guide/configuring#configuration-based-on-glob-patterns
[prefer-arrow-callback]: https://eslint.org/docs/rules/prefer-arrow-callback
[prettier]: https://github.com/prettier/prettier
[quotes]: https://eslint.org/docs/rules/quotes
[singlequote]: https://prettier.io/docs/en/options.html#quotes
[string formatting rules]: https://prettier.io/docs/en/rationale.html#strings
[vue/html-self-closing]: https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/html-self-closing.md
[vue/max-len]: https://github.com/vuejs/eslint-plugin-vue/blob/master/docs/rules/max-len.md
