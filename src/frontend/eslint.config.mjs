import cspellESLintPluginRecommended from '@cspell/eslint-plugin/recommended'
import eslintConfigLove from 'eslint-config-love'
import eslintConfigPrettier from 'eslint-config-prettier'
import perfectionistNatural from 'eslint-plugin-perfectionist/configs/recommended-natural'
import eslintPluginSonarJs from 'eslint-plugin-sonarjs'
import jsDoc from 'eslint-plugin-jsdoc'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ...eslintConfigLove,
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
  },
  perfectionistNatural,
  cspellESLintPluginRecommended,
  eslintPluginSonarJs.configs.recommended,
  jsDoc.configs['flat/recommended'],
  {
    plugins: {
      eslintPluginSonarJs,
      jsDoc,
    },
  },
  eslintConfigPrettier,
]
