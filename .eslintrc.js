module.exports = {
  "root": true,
  "env": {
    "node": true
  },
  "rules": {
    "no-debugger": "off",
    "indent": ["error", 2],
    "no-multi-assign": "error",
    "arrow-spacing": [2, {
      "before": true,
      "after": true
    }]
  },
  "parserOptions": {
    "parser": "babel-eslint",
    "ecmaVersion": 2015
  }
}