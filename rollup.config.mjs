import {nodeResolve} from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs";
import serve from "rollup-plugin-serve";

export default [{
  input: "./main.js",
  output: {
    file: "./bundle.js",
    format: "iife",
    name: "bitfolly",
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    serve(),
  ],
}, {
  input: "./global.js",
  output: {
    file: "./bundle-global.js",
    format: "iife",
    name: "bitfolly",
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    serve(),
  ],
}];
