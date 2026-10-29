import cspellESLintPluginRecommended from '@cspell/eslint-plugin/recommended'
import wshno, { testingLibrary, vitest } from '@wshno/eslint-config'
import jsDoc from 'eslint-plugin-jsdoc'

// @wshno/eslint-config (JS/TS and SonarJS recommended, @eslint-react, React Refresh, React Router,
// Vitest and Testing Library), plus this repo's spell checking and JSDoc rules.
/** @type {import('eslint').Linter.Config[]} */
export default [
  ...wshno,
  ...vitest(),
  ...testingLibrary(),
  {
    ignores: ['*.lock', 'app/api/endpoints/**', 'app/api/models/**', 'vite.config.ts'],
  },
  cspellESLintPluginRecommended,
  jsDoc.configs['flat/recommended'],
  {
    rules: {
      '@cspell/spellchecker': [
        'warn',
        {
          autoFix: false,
          checkComments: true,
          configFile: new URL('./cspell.json', import.meta.url).toString(),
        },
      ],
    },
  },
  {
    // Test helpers aren't hot-reloaded.
    files: ['test/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // The compiler resolves the types in JSDoc tags; jsdoc's own check doesn't know DOM or lib types.
    files: ['**/*.{ts,tsx}'],
    rules: {
      'jsdoc/no-undefined-types': 'off',
    },
  },
]
