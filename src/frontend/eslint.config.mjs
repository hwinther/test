import cspellESLintPluginRecommended from '@cspell/eslint-plugin/recommended'
import eslintConfigLove from 'eslint-config-love'
import eslintConfigPrettier from 'eslint-config-prettier'
import jsDoc from 'eslint-plugin-jsdoc'
import perfectionistNatural from 'eslint-plugin-perfectionist/configs/recommended-natural'
import eslintPluginSonarJs from 'eslint-plugin-sonarjs'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { files: ['**/*.js', '**/*.ts', '**/*.tsx'] },
  { ignores: ['node_modules/*', 'dist/*', '*.lock', 'src/api/endpoints/**', 'src/api/models/**'] },
  {
    plugins: {
      eslintPluginSonarJs,
      jsDoc,
    },
  },
  perfectionistNatural,
  cspellESLintPluginRecommended,
  eslintPluginSonarJs.configs.recommended,
  jsDoc.configs['flat/recommended'],
  {
    ...eslintConfigLove,
    rules: {
      ...eslintConfigLove.rules,
      '@cspell/spellchecker': [
        'warn',
        {
          autoFix: false,
          checkComments: true,
          configFile: new URL('./cspell.json', import.meta.url).toString(),
        },
      ],
      '@typescript-eslint/triple-slash-reference': 'off',
      'import/no-absolute-path': 'off',
    },
  },
  eslintConfigPrettier,
]
