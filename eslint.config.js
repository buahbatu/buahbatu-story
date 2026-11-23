import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const IMPURE_LIBS = [
  { name: 'phaser', message: 'Logika murni tidak boleh memakai Phaser (docs/02 §4). Pindahkan ke view.ts.' },
  { name: 'preact', message: 'Logika murni tidak boleh memakai UI (docs/02 §4).' },
];
const IMPURE_PATTERNS = [
  {
    group: ['@supabase/*', '**/net/**'],
    message: 'Logika murni tidak boleh menyentuh jaringan (docs/02 §4).',
  },
  { group: ['preact/*'], message: 'Logika murni tidak boleh memakai UI (docs/02 §4).' },
];

export default tseslint.config(
  {
    ignores: ['dist/', 'dist-test/', 'coverage/', 'playwright-report/', 'test-results/', '.vercel/', '.vercel-cli/', 'public/'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Identifier[name=/SERVICE_ROLE/], Literal[value=/SERVICE_ROLE/], TemplateElement[value.raw=/SERVICE_ROLE/]',
          message: 'SERVICE_ROLE hanya boleh dipakai di api/ (server), bukan di kode client.',
        },
      ],
    },
  },
  {
    files: ['src/core/**/*.ts', 'src/systems/*/logic.ts', 'src/systems/*/handlers.ts', 'src/systems/*/types.ts'],
    rules: {
      'no-restricted-imports': ['error', { paths: IMPURE_LIBS, patterns: IMPURE_PATTERNS }],
    },
  },
  {
    files: ['src/systems/*/logic.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: IMPURE_LIBS,
          patterns: [
            ...IMPURE_PATTERNS,
            {
              group: ['../*/logic', '../*/logic.ts'],
              message: 'Jangan import logic.ts sistem lain (docs/03 §3). Pakai event/selector.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/core/logger.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['api/**/*.ts', 'scripts/**/*.ts'],
    rules: { 'no-restricted-syntax': 'off', 'no-console': 'off' },
  },
  {
    files: ['**/*.test.ts', 'tests/**/*.ts', 'e2e/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly', fetch: 'readonly' },
    },
    rules: { 'no-console': 'off' },
  },
  prettier,
);
