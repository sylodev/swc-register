import { addHook } from "pirates";
import sourceMapSupport from "source-map-support";
import { transform } from "./transform";

const SOURCE_MAPS = new Map<string, string>();

// todo: testing check is here because of the jest 28 issue below and can be removed once its resolved.
if (process.env.NODE_ENV !== "testing" && !process.execArgv.includes("--enable-source-maps")) {
  sourceMapSupport.install({
    handleUncaughtExceptions: false,
    environment: "node",
    retrieveSourceMap(fileName: string) {
      const sourceMap = SOURCE_MAPS.get(fileName);
      if (!sourceMap) return null;
      return {
        url: fileName,
        map: sourceMap,
      };
    },
  });
}

addHook(
  (code, fileName) => {
    const result = transform(code, fileName);
    if (result.sourceMap) SOURCE_MAPS.set(fileName, result.sourceMap);
    return result.code;
  },
  {
    ignoreNodeModules: false,
    exts: [".ts"],
  }
);

// todo: https://github.com/facebook/jest/issues/9771#issuecomment-946052045
export { default } from "./jest";
