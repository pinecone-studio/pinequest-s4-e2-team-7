import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Monorepo-wide flat ESLint config. Framework-specific configs (Next, Expo) are
// layered on inside their own apps when those apps are built.
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.open-next/**',
      '**/.wrangler/**',
      '**/.mf/**',
      '**/.vercel/**',
      '**/.expo/**',
      '**/.turbo/**',
      '**/*.config.{js,mjs,cjs}',
      '**/next-env.d.ts',
      '**/expo-env.d.ts',
      'apps/model/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // Allow intentionally-unused identifiers prefixed with `_`
      // (e.g. required-but-unused props/args).
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
)
