import globals from 'globals';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';
import eslintConfigPrettier from 'eslint-config-prettier';

import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';

// mimic CommonJS variables -- not needed if using CommonJS
const compatFilename = fileURLToPath(import.meta.url);
const compatDirname = path.dirname(compatFilename);
const compat = new FlatCompat({
  baseDirectory: compatDirname,
  recommendedConfig: pluginJs.configs.recommended,
});

export default [
  {
    languageOptions: {
      globals: globals.browser,
    },
    files: ['*.ts'],
    ignores: [
      'node_modules/',
      'playwright-report/',
      'test-results/',
      '!tests/*',
      '!test-examples/*',
    ],
  },
  ...compat.extends('standard-with-typescript'),
  pluginReactConfig,
  eslintConfigPrettier,
];
