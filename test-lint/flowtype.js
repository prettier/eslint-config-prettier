// @flow
/* eslint-disable quotes */
"use strict";

// Prettier wants commas as delimiters, but "flowtype/object-type-delimiter"
// wants semicolons.
type Foo = { a: Foo, b: Bar };
