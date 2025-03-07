---
"eslint-config-prettier": patch
---

fix: separate the `/flat` entry for compatibility

For flat config users, the previous `"eslint-config-prettier"` entry still works, but `"eslint-config-prettier/flat"` adds a new `name` property for [config-inspector](https://eslint.org/blog/2024/04/eslint-config-inspector/), we just can't add it for the default entry for compatibility.

See also <https://github.com/prettier/eslint-config-prettier/issues/308>

```ts
// before
import eslintConfigPrettier from "eslint-config-prettier";

// after
import eslintConfigPrettier from "eslint-config-prettier/flat";
```
