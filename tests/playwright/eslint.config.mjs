import eslintConfigLove from 'eslint-config-love'
import perfectionistNatural from 'eslint-plugin-perfectionist/configs/recommended-natural'
import eslintConfigPrettier from 'eslint-config-prettier'
import cspellESLintPluginRecommended from '@cspell/eslint-plugin/recommended'
import eslintPluginSonarJs from 'eslint-plugin-sonarjs'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ...eslintConfigLove,
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
  },
  perfectionistNatural,
  cspellESLintPluginRecommended,
  eslintPluginSonarJs.configs.recommended,
  {
    plugins: {
      eslintPluginSonarJs,
    },
  },
  eslintConfigPrettier,
]
