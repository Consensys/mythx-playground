const babel = require("rollup-plugin-babel");
const replace = require("rollup-plugin-replace");

module.exports = {
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "cjs",
    sourcemap: "inline"
  },
  plugins: [
    replace({
      "process.env.ENV": JSON.stringify(process.env.ENV)
    }),
    babel({
      exclude: "node_modules/**"
    })
  ]
};
