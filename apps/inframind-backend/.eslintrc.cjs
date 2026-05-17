// eslint configuration for Inframind backend
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  env: {
    node: true,
    es2021: true,
  },
  rules: {
    // Example custom rules – feel free to adjust
    "@typescript-eslint/no-explicit-any": "off",
    "prettier/prettier": ["error", { "singleQuote": true, "trailingComma": "all" }]
  },
  ignorePatterns: ["dist/", "node_modules/"],
};
