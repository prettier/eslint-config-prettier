console.log(
  [[``], [`-js`, `-ts`, `-jsx`, `-plus`]].map(
    (group) =>
      new Set(
        group.flatMap((plugin) =>
          Object.keys(require(`@stylistic/eslint-plugin${plugin}`).rules)
        )
      ).size
  ),
  Object.fromEntries(
    Object.entries({
      js: ``,
      ts: `@typescript-eslint/`,
      jsx: `react/`,
      plus: ``,
    })
      .flatMap(([stylisticPlugin, externalPlugin]) =>
        Object.entries(
          require(
            `@stylistic/eslint-plugin${
              stylisticPlugin && `-${stylisticPlugin}`
            }`
          ).rules
        ).map(([name, { meta }]) => [
          `@stylistic/${stylisticPlugin && `${stylisticPlugin}/`}${name}`,
          {
            level:
              stylisticPlugin == `plus`
                ? `off`
                : require(`.`).rules[
                    externalPlugin +
                      name.replace(/^(func)tion(-call-spacing$)/, `$1$2`)
                  ],
            fixable: meta.fixable,
          },
        ])
      )
      .sort((a, b) => `${a[1].level}`.localeCompare(b[1].level))
  )
);
