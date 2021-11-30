import { performance } from "perf_hooks";
import typescript from "typescript";
import { debug } from "../debug";

let cachedConfigFile: typescript.ParsedCommandLine | undefined;

export function getTsconfig(): typescript.ParsedCommandLine {
  if (cachedConfigFile) return cachedConfigFile;
  const start = performance.now();
  const projectIndex = process.argv.indexOf("--project");
  const project = projectIndex !== -1 ? process.argv[projectIndex + 1] : "tsconfig.json";
  const configFilePath = typescript.findConfigFile("./", typescript.sys.fileExists, project);
  if (!configFilePath) {
    const error = "Could not find tsconfig path.";
    const showExtra = project !== "tsconfig.json";
    const extra = showExtra ? 'If it is not named "tsconfig.json", specify a name with "--project".' : "";
    throw new Error(error + extra);
  }

  const configFile = typescript.readConfigFile(configFilePath, typescript.sys.readFile);
  const duration = performance.now() - start;
  debug(`Loading ${project} took ${duration}ms`);
  cachedConfigFile = typescript.parseJsonConfigFileContent(configFile.config, typescript.sys, "./");
  return cachedConfigFile;
}
