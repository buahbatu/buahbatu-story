// ESLint flat config. Desain: docs/03-standar-kode.md, docs/02-arsitektur.md §1 & §4, docs/51 §7
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/** Library yang tidak boleh disentuh logika murni (harus bisa dites tanpa browser/jaringan). */
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
    ignores: [
      'dist/',
      'coverage/',
      'playwright-report/',
      'test-results/',
      '.vercel/',
      '.vercel-cli/',
      'public/',
    ],
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
      // Rahasia server tidak boleh ada di kode client (docs/51 §7).
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'Identifier[name=/SERVICE_ROLE/], Literal[value=/SERVICE_ROLE/], TemplateElement[value.raw=/SERVICE_ROLE/]',
          message: 'SERVICE_ROLE hanya boleh dipakai di api/ (server), bukan di kode client.',
        },
      ],
    },
  },
  {
    // Logika murni: core + logic/handlers/types sistem.
    files: [
      'src/core/**/*.ts',
      'src/systems/*/logic.ts',
      'src/systems/*/handlers.ts',
      'src/systems/*/types.ts',
    ],
    rules: {
      'no-restricted-imports': ['error', { paths: IMPURE_LIBS, patterns: IMPURE_PATTERNS }],
    },
  },
  {
    // Tidak ada import silang antar logic.ts sistem berbeda (docs/03 §3); komunikasi lewat event/selector.
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
    // Server (Vercel functions) & script admin memang boleh memakai service role.
    files: ['api/**/*.ts', 'scripts/**/*.ts'],
    rules: { 'no-restricted-syntax': 'off', 'no-console': 'off' },
  },
  {
    files: ['**/*.test.ts', 'tests/**/*.ts', 'e2e/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    // Script Node (.js/.mjs): tanpa type-check, global Node.
    files: ['**/*.js', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly' },
    },
    rules: { 'no-console': 'off' },
  },
  prettier,
);
