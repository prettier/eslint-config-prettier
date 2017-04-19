### Version 1.7.0 (2017-04-19)

- Changed: The [no-confusing-arrow] is no longer a special rule, but simply
  turned off, since recent Prettier versions make it redundant.
- Improved: The CLI helper tool now has a more helpful message for special
  rules, and exits with a different status code if only special rules were
  found. The exit codes are now documented as well.

### Version 1.6.0 (2017-04-05)

- Added: The [curly] rule. Thanks to Martin Rädlinger (@formatlos)!

### Version 1.5.0 (2017-03-04)

- Added: The [nonblock-statement-body-position] rule.

### Version 1.4.1 (2017-02-28)

- Improved: eslint-config-prettier is now part of the [prettier] organization!
  This version updates all URLs to point to the new home of the project.

### Version 1.4.0 (2017-02-26)

- Added: The [no-confusing-arrow] rule (as a
  [special rule][no-confusing-arrow-special]). Thanks to Dominik Ferber
  (@dferber90)!
- Added: Deprecated or removed rules that might conflict with prettier. Thanks
  to Dominik Ferber (@dferber90)!

### Version 1.3.0 (2017-02-21)

- Added: The [template-tag-spacing] rule. Thanks to Thibault Derousseaux
  (@tibdex)!

### Version 1.2.0 (2017-02-14)

- Added: The [one-var-declaration-per-line] rule. Thanks to Ruben Oostinga
  (@0xR)!

### Version 1.1.1 (2017-02-12)

- Minor documentation tweak: Changed "Exceptions" into "Special rules".

### Version 1.1.0 (2017-02-10)

- Fixed: The [eslint-plugin-react] exclusion rules now actually work.
- Fixed: The CLI helper tool now works in Node.js 4. Thanks to Nathan Friedly
  (@nfriedly)!
- Added: Support for [eslint-plugin-flowtype].
- Improved: Minor things for the CLI helper tool.
- Improved: There are now tests for everything.

### Version 1.0.3 (2017-02-03)

- Fixed: `"extends": "prettier/react"` now actually works.

### Version 1.0.2 (2017-01-30)

- Improved: CLI helper tool instructions.

### Version 1.0.1 (2017-01-29)

- No difference from 1.0.0. Just an `npm publish` mistake.

### Version 1.0.0 (2017-01-29)

- Initial release.

[eslint-plugin-flowtype]: https://github.com/gajus/eslint-plugin-flowtype
[eslint-plugin-react]: https://github.com/yannickcr/eslint-plugin-react
[no-confusing-arrow]: http://eslint.org/docs/rules/no-confusing-arrow
[no-confusing-arrow-special]: https://github.com/prettier/eslint-config-prettier/blob/08ac5bcc25c9cdc71864b4a1e4191e7d28dd2bc2/README.md#no-confusing-arrow
[nonblock-statement-body-position]: http://eslint.org/docs/rules/nonblock-statement-body-position
[one-var-declaration-per-line]: http://eslint.org/docs/rules/one-var-declaration-per-line
[prettier]: https://github.com/prettier
[template-tag-spacing]: http://eslint.org/docs/rules/template-tag-spacing
