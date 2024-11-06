import cspellESLintPluginRecommended from '@cspell/eslint-plugin/recommended'
import eslintConfigLove from 'eslint-config-love'
import eslintConfigPrettier from 'eslint-config-prettier'
import perfectionist from 'eslint-plugin-perfectionist'
import eslintPluginSonarJs from 'eslint-plugin-sonarjs'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.js', '**/*.ts', '**/*.tsx'] },
  { ignores: ['node_modules/*', 'dist/*', '*.lock'] },
  {
    plugins: {
      eslintPluginSonarJs,
    },
  },
  perfectionist.configs['recommended-natural'],
  cspellESLintPluginRecommended,
  eslintPluginSonarJs.configs.recommended,
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
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      'import/no-absolute-path': 'off',
    },
  },
  eslintConfigPrettier,
]
