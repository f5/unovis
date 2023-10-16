// Copyright (c) Volterra, Inc. All rights reserved.
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import transformPaths from "@zerollup/ts-transform-paths";
import commonjs from "rollup-plugin-commonjs";

const extensions = [".ts", ".vue"];
const plugins = [
  resolve({
    extensions,
  }),
  commonjs(),
  typescript({
    tsconfig: "./autogen/tsconfig.json",
    typescript: require("typescript"),
    transformers: [(service) => transformPaths(service.getProgram())],
  }),
];

export default [
  {
    input: "./autogen/index.ts",
    output: [
      {
        file: ".autogen.cjs",
        format: "cjs",
        globals: {
          vue: "Vue",
        },
      },
    ],
    plugins,
    external: ["vue"],
  },
];
