module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended', '@vue/eslint-config-prettier'],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    window: true,
    Picker: true,
    Log: true,
    BrowserPolicy: true,
    it: true,
    describe: true,
    before: true,
    beforeEach: true,
    after: true,
    afterEach: true,
    require: true,
    WebApp: true,
    Assets: true,
    Cypress: true,
    cy: true,
    expect: true,
    LabelStudio: 'readonly',
    oneschemaImporter: 'readonly',
  },
  rules: {
    // Only allow debugger in development
    'no-debugger': process.env.PRE_COMMIT ? 'error' : 'off',
    // Only allow `console.log` in development
    'no-console': process.env.PRE_COMMIT
      ? [
          'error',
          {
            allow: ['warn', 'error'],
          },
        ]
      : 'off',
    'no-param-reassign': 'off',
    '@typescript-eslint/naming-convention': ['error', { selector: 'enum', format: ['UPPER_CASE'] }],
    'no-unused-expressions': 0,
    'no-plusplus': 0,
    'prettier/prettier': 'error',

    // TODO: To be reviewed if/where needed
    'import/no-absolute-path': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'import/order': ['error', { 'newlines-between': 'always-and-inside-groups' }],
    'func-names': 0,
    'no-await-in-loop': 0,
    'no-underscore-dangle': 0,
    'consistent-return': 0,
    'prefer-destructuring': 0,
    'import/no-extraneous-dependencies': 0,
    camelcase: 0,
  },
  overrides: [
    {
      files: ['client/**/*', 'imports/**/*', 'packages/**/*', 'stories/**/*'],
      extends: [
        'plugin:vue/essential',
        'plugin:vue/recommended',
        'plugin:vue/strongly-recommended',
        'plugin:storybook/recommended',
        './lint/client.lint.js',
        '@vue/eslint-config-prettier',
      ],
      parser: 'vue-eslint-parser',
      rules: {
        'prettier/prettier': 'error',
        'vue/no-multiple-template-root': 'off',
      },
    },
    {
      files: ['server/**/*', 'tests-ts/**/*'],
      extends: ['airbnb-typescript/base', './lint/server.lint.js', '@vue/eslint-config-prettier'],
      rules: {
        'prettier/prettier': 'error',
      },
      parserOptions: {
        project: './tsconfig.server.json',
      },
    },
    {
      files: ['*.spec.js'],
      rules: {
        'no-unused-vars': 0,
      },
    },
    {
      files: ['*.test.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 0,
      },
    },
  ],
}
