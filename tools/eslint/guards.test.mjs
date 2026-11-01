import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const longFunction = [
  'export function longFunction() {',
  ...Array.from({ length: 39 }, (_, index) => `  const value${index} = ${index};`),
  '}',
].join('\n');

const longFile = Array.from(
  { length: 201 },
  (_, index) => `export const value${index} = ${index};`,
).join('\n');

const complexFunction = [
  'export function complexFunction(value: number) {',
  ...Array.from({ length: 10 }, (_, index) => `  if (value === ${index}) return ${index};`),
  '  return -1;',
  '}',
].join('\n');

const validCode = [
  'export const query = `query ($sort: [MediaSort]) { Page { media(sort: $sort) { id } } }`;',
  'export function pick(value: number | undefined) {',
  '  if (value === undefined) return 0;',
  '  return value > 1 ? value : 1;',
  '}',
  "export const kinds = ['TV', 'MOVIE'] as const;",
].join('\n');

const cases = [
  {
    name: 'any',
    path: 'src/guard-sample.ts',
    code: 'export const a = 1 as any;',
    expected: ['@typescript-eslint/no-explicit-any'],
  },
  {
    name: 'unsafe type assertion',
    path: 'src/guard-sample.ts',
    code: "export const a = (JSON.parse('1') as unknown) as string;",
    expected: ['@typescript-eslint/no-unsafe-type-assertion'],
  },
  {
    name: 'comment',
    path: 'src/guard-sample.ts',
    code: '// note',
    expected: ['local/no-comments'],
  },
  {
    name: 'comment in JSX',
    path: 'src/guard-sample.tsx',
    code: 'export const a = <div>{/* note */}</div>;',
    expected: ['local/no-comments'],
  },
  {
    name: 'eslint-disable',
    path: 'src/guard-sample.ts',
    code: '/* eslint-disable */ export const a = 1 as any;',
    expected: ['local/no-comments', '@typescript-eslint/no-explicit-any'],
  },
  {
    name: 'else',
    path: 'src/guard-sample.ts',
    code: 'export function f(a: boolean) {\n  if (a) {\n    return 1;\n  } else {\n    return 2;\n  }\n}',
    expected: ['no-restricted-syntax'],
  },
  {
    name: 'else if',
    path: 'src/guard-sample.ts',
    code: 'export function f(a: boolean, b: boolean) {\n  if (a) {\n    return 1;\n  } else if (b) {\n    return 2;\n  }\n  return 3;\n}',
    expected: ['no-restricted-syntax'],
  },
  {
    name: 'nested ternary',
    path: 'src/guard-sample.ts',
    code: 'export const f = (a: boolean, b: boolean) => (a ? 1 : b ? 2 : 3);',
    expected: ['no-nested-ternary'],
  },
  {
    name: 'shared importing features',
    path: 'src/shared/guard-sample.ts',
    code: "import '@/features/x';",
    expected: ['no-restricted-imports'],
  },
  {
    name: 'shared importing app',
    path: 'src/shared/guard-sample.ts',
    code: "import '../app/App';",
    expected: ['no-restricted-imports'],
  },
  {
    name: 'features importing app',
    path: 'src/features/guard-sample.ts',
    code: "import '@/app/App';",
    expected: ['no-restricted-imports'],
  },
  {
    name: 'shared importing bare app',
    path: 'src/shared/guard-sample.ts',
    code: "import '@/app';",
    expected: ['no-restricted-imports'],
  },
  {
    name: 'shared importing bare features',
    path: 'src/shared/guard-sample.ts',
    code: "import '@/features';",
    expected: ['no-restricted-imports'],
  },
  {
    name: 'shared importing features by relative path',
    path: 'src/shared/guard-sample.ts',
    code: "import '../../features';",
    expected: ['no-restricted-imports'],
  },
  {
    name: 'shared importing app dynamically',
    path: 'src/shared/guard-sample.ts',
    code: "export const load = () => import('@/app/App');",
    expected: ['no-restricted-syntax'],
  },
  {
    name: 'shared importing features dynamically by relative path',
    path: 'src/shared/guard-sample.ts',
    code: "export const load = () => import('../../features');",
    expected: ['no-restricted-syntax'],
  },
  {
    name: 'features importing bare app',
    path: 'src/features/guard-sample.ts',
    code: "import '@/app';",
    expected: ['no-restricted-imports'],
  },
  {
    name: 'features importing app dynamically',
    path: 'src/features/guard-sample.ts',
    code: "export const load = () => import('@/app/App');",
    expected: ['no-restricted-syntax'],
  },
  {
    name: 'else in shared',
    path: 'src/shared/guard-sample.ts',
    code: 'export function f(a: boolean) {\n  if (a) {\n    return 1;\n  } else {\n    return 2;\n  }\n}',
    expected: ['no-restricted-syntax'],
  },
  {
    name: 'arbitrary class in features',
    path: 'src/features/guard-sample.ts',
    code: "export const a = 'w-[10px]';",
    expected: ['no-restricted-syntax'],
  },
  {
    name: 'arbitrary class in string',
    path: 'src/guard-sample.ts',
    code: "export const a = 'w-[10px]';",
    expected: ['no-restricted-syntax'],
  },
  {
    name: 'arbitrary class in template',
    path: 'src/guard-sample.ts',
    code: 'export const a = `bg-[#fff]`;',
    expected: ['no-restricted-syntax'],
  },
  {
    name: 'arbitrary variant',
    path: 'src/guard-sample.ts',
    code: "export const a = '[&>div]:p-sm';",
    expected: ['no-restricted-syntax'],
  },
  {
    name: 'arbitrary custom property width',
    path: 'src/guard-sample.ts',
    code: "export const a = 'w-(--my-width)';",
    expected: ['no-restricted-syntax'],
  },
  {
    name: 'arbitrary custom property color',
    path: 'src/guard-sample.ts',
    code: 'export const a = `bg-(--brand)`;',
    expected: ['no-restricted-syntax'],
  },
  {
    name: 'arbitrary variant in JSX className',
    path: 'src/guard-sample.tsx',
    code: 'export const a = <div className="flex [&>div]:p-sm" />;',
    expected: ['no-restricted-syntax'],
  },
  {
    name: 'long function',
    path: 'src/guard-sample.ts',
    code: longFunction,
    expected: ['max-lines-per-function'],
  },
  { name: 'long file', path: 'src/guard-sample.ts', code: longFile, expected: ['max-lines'] },
  {
    name: 'four parameters',
    path: 'src/guard-sample.ts',
    code: 'export function f(a: number, b: number, c: number, d: number) {\n  return a + b + c + d;\n}',
    expected: ['max-params'],
  },
  {
    name: 'complexity 11',
    path: 'src/guard-sample.ts',
    code: complexFunction,
    expected: ['complexity'],
  },
  {
    name: 'image without alt',
    path: 'src/guard-sample.tsx',
    code: 'export const a = <img src="a.png" />;',
    expected: ['jsx-a11y-x/alt-text'],
  },
  {
    name: 'shared importing an npm package named like a layer',
    path: 'src/shared/guard-sample.ts',
    code: "import 'firebase/app';",
    expected: [],
  },
  { name: 'valid code', path: 'src/guard-sample.ts', code: validCode, expected: [] },
];

const runner = `
import { ESLint } from 'eslint'
const [filePath] = process.argv.slice(1)
const [result] = await new ESLint().lintFiles([filePath])
process.stdout.write(JSON.stringify(result.messages))
`;

async function lintSample(sample) {
  const filePath = resolve(root, sample.path);
  const createdDirectory = await mkdir(dirname(filePath), { recursive: true });
  try {
    await writeFile(filePath, sample.code);
    const { stdout } = await run(
      process.execPath,
      ['--input-type=module', '-e', runner, filePath],
      {
        cwd: root,
        maxBuffer: 10 * 1024 * 1024,
      },
    );
    return JSON.parse(stdout);
  } finally {
    await rm(filePath, { force: true });
    if (createdDirectory) await rm(createdDirectory, { recursive: true, force: true });
  }
}

describe('lint guards', { concurrency: false }, () => {
  for (const sample of cases) {
    it(`handles ${sample.name}`, async () => {
      const messages = await lintSample(sample);
      const errors = messages.filter((message) => message.severity === 2);
      const ruleIds = errors.map((message) => message.ruleId);
      if (sample.expected.length === 0) {
        assert.deepEqual(errors, []);
        return;
      }
      for (const ruleId of sample.expected) {
        assert.ok(ruleIds.includes(ruleId), `expected ${ruleId}, got ${JSON.stringify(ruleIds)}`);
      }
    });
  }
});
