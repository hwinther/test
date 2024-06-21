import cspellESLintPluginRecommended from '@cspell/eslint-plugin/recommended'
import eslintConfigLove from 'eslint-config-love'
import eslintConfigPrettier from 'eslint-config-prettier'
import perfectionistNatural from 'eslint-plugin-perfectionist/configs/recommended-natural'
import eslintPluginSonarJs from 'eslint-plugin-sonarjs'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { files: ['**/*.js', '**/*.ts', '**/*.tsx'] },
  { ignores: ['node_modules/*', 'dist/*', '*.lock'] },
  {
    plugins: {
      eslintPluginSonarJs,
    },
  },
  {
    ...eslintConfigLove,
  },
  perfectionistNatural,
  cspellESLintPluginRecommended,
  eslintPluginSonarJs.configs.recommended,
  eslintConfigPrettier,
]
