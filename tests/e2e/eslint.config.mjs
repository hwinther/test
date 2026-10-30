import cspellESLintPluginRecommended from '@cspell/eslint-plugin/recommended'
import { base, ignores, node, playwright } from '@wshno/eslint-config'
import perfectionist from 'eslint-plugin-perfectionist'

// @wshno/eslint-config (JS/TS and SonarJS recommended, Node globals, Playwright rules for tests/), plus this
// suite's sorting and spell checking.
/** @type {import('eslint').Linter.Config[]} */
export default [
  ...ignores,
  { ignores: ['playwright-report/**', 'test-results/**', 'tests-examples/**', '*.lock'] },
  ...base,
  ...node,
  ...playwright(['tests/**/*.ts']),
  perfectionist.configs['recommended-natural'],
  cspellESLintPluginRecommended,
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
]
