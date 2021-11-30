import typescript from "typescript";
import { Options } from "@swc/core";

const TSX_REGEX = /\.(t|j)sx?$/;

// largely from https://github.dev/Brooooooklyn/swc-node/blob/3afb7cc48081062181a80686cf4e59659480d1b3/packages/core/index.ts#L3-L4
export function getSWCOptions(filename: string, tsconfig: typescript.ParsedCommandLine): Options {
  return {
    filename: filename,
    minify: false,
    isModule: true,
    sourceMaps: true,
    inlineSourcesContent: true,
    swcrc: false,
    module: {
      type: "commonjs",
      noInterop: !tsconfig.options.esModuleInterop,
    },
    jsc: {
      target: tsconfig.raw.compilerOptions.target ?? "es2018",
      parser: {
        syntax: "typescript",
        tsx: TSX_REGEX.test(filename),
        decorators: tsconfig.options.experimentalDecorators,
      },
      transform: {
        legacyDecorator: tsconfig.options.experimentalDecorators,
        decoratorMetadata: tsconfig.options.emitDecoratorMetadata,
      },
      keepClassNames: true,
      paths: tsconfig.raw.compilerOptions.paths,
    },
  };
}
