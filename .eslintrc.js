module.exports = {
  "env": {
      "es2021": true,
      "node": true
  },
  "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended"
  ],
  "ignorePatterns": [
      "**/*.d.ts"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
      "ecmaVersion": 12,
      "sourceType": "module"
  },
  "plugins": [
      "@typescript-eslint",
      "license-header",
      "unused-imports"
  ],
  "rules": {
      "license-header/header": [ "error", "LICENSE_HEADER" ],
      "max-len": ["warn", 150],
      "no-console": "off",
      // "no-console": "error",
      "no-multiple-empty-lines": "warn",
      "no-trailing-spaces": "warn",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/comma-dangle": ["warn", "only-multiline"],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/indent": ["warn", 4],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      // "@typescript-eslint/no-magic-numbers": ["warn", {
      //     "ignore": [-1, 0, 1, 2],
      //     "ignoreDefaultValues": true,
      //     "ignoreReadonlyClassProperties": true
      // }],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/semi": "warn",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": ["warn", {
          "args": "none"
      }]
  }
};