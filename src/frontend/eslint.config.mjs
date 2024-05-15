import globals from 'globals';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';

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
    files: ['*.ts', '*.tsx'],
    ignores: ['node_modules/'],
  },
  //...compat.extends('standard-with-typescript'),
  //pluginReactConfig,
  //eslintConfigPrettier,
  //eslintPluginReactHooks,
  //eslintPluginReactRefresh, // TODO
];