import { fixupPluginRules } from '@eslint/compat'
import js from '@eslint/js'
import cypress from 'eslint-plugin-cypress'
import eslintConfigPrettier from 'eslint-config-prettier'
import { importX } from 'eslint-plugin-import-x'
import noOnlyTests from 'eslint-plugin-no-only-tests'
import prettier from 'eslint-plugin-prettier'
import sortExports from 'eslint-plugin-sort-exports'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      'node_modules/**',
      'public/**',
      'assets/**',
      '.allowed-scripts.mjs',
      'eslint.config.mjs',
      'cypress.json',
      'reporter-config.json',
      'dist/**',
      'script/build/**',
      'server/@types/govukFrontend/index.d.ts',
      'test_results/**',
      '**/imported/',
      'cypress.config.ts',
      'cypress-refer-disabled.config.ts',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  eslintConfigPrettier,
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
      },
    },
    plugins: {
      'no-only-tests': noOnlyTests,
      prettier,
      'sort-exports': fixupPluginRules(sortExports),
    },
    settings: {
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import-x/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      'class-methods-use-this': 'off',
      'comma-dangle': ['error', 'always-multiline'],
      'import-x/exports-last': 'error',
      'import-x/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          mjs: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'import-x/first': 'error',
      'import-x/group-exports': 'error',
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.js',
            '**/*.test.ts',
            '**/testutils/**',
            '.allowed-scripts.mjs',
            'eslint.config.mjs',
            'cypress.config.ts',
          ],
        },
      ],
      'import-x/no-unresolved': 'error',
      'import-x/order': [
        'error',
        {
          alphabetize: { order: 'asc', orderImportKind: 'asc' },
          groups: [['builtin', 'external']],
          'newlines-between': 'always',
        },
      ],
      'no-empty-function': [
        'warn',
        {
          allow: ['constructors'],
        },
      ],
      'no-only-tests/no-only-tests': 'error',
      'import-x/no-named-as-default-member': 'off',
      'no-shadow': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: 'res|next|^err|_',
          ignoreRestSiblings: true,
        },
      ],
      'no-use-before-define': 'off',
      'no-useless-assignment': 'off',
      'no-useless-constructor': 'off',
      'prettier/prettier': [
        'error',
        {
          trailingComma: 'all',
          singleQuote: true,
          printWidth: 120,
          semi: false,
        },
      ],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: 'off',
      'sort-exports/sort-exports': ['error', { sortExportKindFirst: 'value' }],
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
        },
      ],
      'sort-keys': ['error', 'asc', { caseSensitive: true, natural: false }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json', 'integration_tests/tsconfig.json', 'script/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      '@typescript-eslint/consistent-indexed-object-style': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: {
            memberTypes: [
              'public-static-method',
              'protected-static-method',
              'private-static-method',
              'static-field',
              'instance-field',
              'constructor',
              ['public-get', 'public-set'],
              'public-instance-method',
              ['protected-get', 'protected-set'],
              'protected-instance-method',
              ['private-get', 'private-set'],
              'private-instance-method',
            ],
            order: 'natural-case-insensitive',
          },
          interfaces: {
            memberTypes: ['field', 'signature', 'constructor', 'method'],
            optionalityOrder: 'required-first',
            order: 'natural-case-insensitive',
          },
          typeLiterals: {
            memberTypes: ['field', 'signature', 'constructor', 'method'],
            optionalityOrder: 'required-first',
            order: 'natural-case-insensitive',
          },
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: 'res|next|^err|_',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/prefer-destructuring': [
        'error',
        {
          array: false,
          object: true,
        },
        {
          enforceForRenamedProperties: false,
        },
      ],
      '@typescript-eslint/sort-type-constituents': 'error',
    },
  },
  {
    ...cypress.configs.recommended,
    files: ['integration_tests/**/*.{js,ts}'],
    rules: {
      ...cypress.configs.recommended.rules,
      'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
]
