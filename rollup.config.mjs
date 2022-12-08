import {nodeResolve} from "@rollup/plugin-node-resolve"
import serve from "rollup-plugin-serve";

export default {
  input: "./main.js",
  output: {
    file: "./bundle.js",
    format: "iife"
  },
  plugins: [
    nodeResolve(),
  ],
}
