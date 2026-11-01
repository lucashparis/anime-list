import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import { noComments } from './tools/eslint/no-comments.js';

const ARBITRARY_UTILITY = String.raw`/-\[|(^|\s)\[[^\]]*:/`;

const restrictedSyntax = [
  { selector: 'IfStatement[alternate]', message: 'Use an early return instead of else' },
  {
    selector: `Literal[value=${ARBITRARY_UTILITY}]`,
    message: 'Use a design token instead of an arbitrary value',
  },
  {
    selector: `TemplateElement[value.raw=${ARBITRARY_UTILITY}]`,
    message: 'Use a design token instead of an arbitrary value',
  },
];

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results'] },
  { linterOptions: { noInlineConfig: true } },
  {
    files: ['src/**/*.{ts,tsx}', 'e2e/**/*.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      jsxA11y.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { local: { rules: { 'no-comments': noComments } } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true }],
      'max-lines': ['error', { max: 200, skipBlankLines: true }],
      complexity: ['error', 10],
      'max-params': ['error', 3],
      'no-nested-ternary': 'error',
      'no-restricted-syntax': ['error', ...restrictedSyntax],
      'local/no-comments': 'error',
    },
  },
  {
    files: ['src/shared/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/**', '**/app/**'],
              message: 'shared must not depend on features or app',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [{ group: ['**/app/**'], message: 'features must not depend on app' }],
        },
      ],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'e2e/**/*.ts'],
    rules: { 'max-lines-per-function': 'off' },
  },
);
