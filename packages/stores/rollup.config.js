// @ts-check
// @ts-ignore
import pkg from "./package.json";
import {onwarn} from "../../scripts/onwarn";

import typescript from "rollup-plugin-typescript2";

/** @type {import("rollup").RollupOptions} */
const config = {
    input: "src/focus4.stores.ts",
    plugins: [typescript({abortOnError: false})],
    treeshake: {
        moduleSideEffects: false
    },
    output: {
        format: "esm",
        file: "lib/focus4.stores.js"
    },
    external: [...Object.keys(pkg.dependencies || {})],
    onwarn
};

export default config;
