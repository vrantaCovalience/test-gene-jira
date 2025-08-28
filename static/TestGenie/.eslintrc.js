module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "react-hooks", "jsx-a11y", "import"],
  rules: {
    // Add any additional rules or overrides here
    "react/react-in-jsx-scope": "off",
    "react/jsx-filename-extension": [
      1,
      { extensions: [".js", ".jsx", ".ts", ".tsx"] },
    ],
    "react/prop-types": 0,
    "react-hooks/rules-of-hooks": "error", // Enforce rules of hooks
    "react-hooks/exhaustive-deps": "warn", // Check effect dependencies
    "no-debugger": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
