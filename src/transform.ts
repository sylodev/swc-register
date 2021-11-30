import * as swc from "@swc/core";
import { performance } from "perf_hooks";
import typescript from "typescript";
import { Cache } from "./cache";
import { debug } from "./debug";
import { getSWCOptions } from "./helpers/get-swc-options";
import { getTsconfig } from "./helpers/get-tsconfig";

const DECORATOR_PATTERN = /\n *@[A-z]+/;
const CACHE_SWC_RESULTS = process.env.SWC_REGISTER_CACHE_SWC === "true";
const CODE_CACHE = new Cache();

export interface Result {
  code: string;
  sourceMap?: string;
}

export function transformWithTSC(code: string, fileName: string, config: typescript.ParsedCommandLine): Result {
  debug(`${fileName} has decorators, using typescript to transform`);
  const start = performance.now();
  const compilerOptions = config.options;
  compilerOptions.sourceMap = true;
  const transformed = typescript.transpileModule(code, { compilerOptions, fileName });
  const duration = performance.now() - start;
  debug(`Transformed ${fileName} with tsc in ${duration}ms`);
  return {
    code: transformed.outputText,
    sourceMap: transformed.sourceMapText,
  };
}

export function transformWithSWC(code: string, filename: string, config: typescript.ParsedCommandLine): Result {
  const start = performance.now();
  const result = swc.transformSync(code, getSWCOptions(filename, config));
  const duration = performance.now() - start;
  debug(`Transformed ${filename} with swc in ${duration}ms`);
  return {
    code: result.code,
    sourceMap: result.map,
  };
}

export function transform(code: string, filename: string): Result {
  if (DECORATOR_PATTERN.test(code)) {
    return CODE_CACHE.withCached(code, () => {
      const config = getTsconfig();
      return transformWithTSC(code, filename, config);
    });
  }

  if (CACHE_SWC_RESULTS) {
    return CODE_CACHE.withCached(code, () => {
      const config = getTsconfig();
      return transformWithSWC(code, filename, config);
    });
  }

  const config = getTsconfig();
  return transformWithSWC(code, filename, config);
}
