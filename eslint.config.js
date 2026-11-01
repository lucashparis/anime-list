import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import { noComments } from './tools/eslint/no-comments.js';

const ARBITRARY_UTILITY = String.raw`/-\[|-\(--|(^|\s)\[[^\]]*(:|\]:)/`;

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

const SLASH = String.raw`\x2f`;

const layerPath = (layers) =>
  String.raw`/^(@${SLASH}|(\.\.?${SLASH})+([^${SLASH}]+${SLASH})*)(${layers})(${SLASH}|$)/`;

const dynamicImportOf = (layers, message) => ({
  selector: `ImportExpression[source.value=${layerPath(layers)}]`,
  message,
});

const sharedRestrictedSyntax = [
  ...restrictedSyntax,
  dynamicImportOf('app|features', 'shared must not depend on features or app'),
];

const featuresRestrictedSyntax = [
  ...restrictedSyntax,
  dynamicImportOf('app', 'features must not depend on app'),
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
      '@typescript-eslint/no-unsafe-type-assertion': 'error',
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
      'no-restricted-syntax': ['error', ...sharedRestrictedSyntax],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/features',
                '@/app',
                '../**/features',
                '../**/app',
                '**/features/**',
                '**/app/**',
              ],
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
      'no-restricted-syntax': ['error', ...featuresRestrictedSyntax],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app', '../**/app', '**/app/**'],
              message: 'features must not depend on app',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'e2e/**/*.ts'],
    rules: { 'max-lines-per-function': 'off' },
  },
);
