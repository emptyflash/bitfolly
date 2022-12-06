import {nodeResolve} from "@rollup/plugin-node-resolve"
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

export default {
  input: "./main.js",
  output: {
    file: "./bundle.js",
    format: "iife"
  },
  plugins: [
    nodeResolve(),
    serve({ contentBase: ".",  port: 8080 }),
    livereload({ watch: "." })
  ],
}
