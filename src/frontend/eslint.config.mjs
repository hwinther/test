import cspellESLintPluginRecommended from '@cspell/eslint-plugin/recommended'
import eslintConfigLove from 'eslint-config-love'
import eslintConfigPrettier from 'eslint-config-prettier'
import jsDoc from 'eslint-plugin-jsdoc'
import perfectionistNatural from 'eslint-plugin-perfectionist/configs/recommended-natural'
import eslintPluginSonarJs from 'eslint-plugin-sonarjs'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ...eslintConfigLove,
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    ignores: ['node_modules/*', 'dist/*', '*.lock'],
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
