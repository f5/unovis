/* eslint-disable */
// Copyright (c) Volterra, Inc. All rights reserved.
// const RuleTester = require('eslint').RuleTester
const CLIEngine = require("eslint").CLIEngine;

const cli = new CLIEngine({
  baseConfig: {
    "parser": "@typescript-eslint/parser"
  },
  extensions: [
    '.ts'
  ],
  fix: true,
  // useEslintrc: false,
  rulePaths: [
      './rules'
  ],
  rules: {
    'ts-getter-setter': 2
  }
});


export function tsFix () {
  const report = cli.executeOnFiles(['lib/']);
  CLIEngine.outputFixes(report);
}
