import crypto from "crypto";
import fs from "fs";
import { tmpdir } from "os";
import path from "path";
import readPkg from "read-pkg";
import { debug } from "./debug";
import { Result } from "./transform";

const DEFAULT_CACHE_PATH = path.join(tmpdir(), ".sylo-swc-register-cache");
const CACHE_PATH = process.env.SWC_REGISTER_CACHE_PATH ?? DEFAULT_CACHE_PATH;
const PACKAGE_JSON = readPkg.sync({ cwd: path.resolve(__dirname, "../") });
const USE_CACHE = process.env.SWC_REGISTER_USE_CACHE !== "false";

fs.mkdirSync(CACHE_PATH, { recursive: true });

if (USE_CACHE) debug("Using cache at", CACHE_PATH);
else debug(`Caching disabled. Set SWC_REGISTER_USE_CACHE=true to enable.`);

export class Cache {
  private keys = new Set<string>();
  constructor() {
    for (const key of fs.readdirSync(CACHE_PATH)) {
      this.keys.add(key);
    }
  }

  withCached(code: string, transform: () => Result): Result {
    if (!USE_CACHE) return transform();
    const key = this.getCacheKey(code);
    const cached = this.read(key);
    if (cached) {
      debug(`Cache hit for key ${key}`);
      return cached;
    }

    const result = transform();
    this.write(key, result);
    return result;
  }

  private read(key: string): Result | null {
    try {
      if (!USE_CACHE) return null;
      if (!this.keys.has(key)) return null;
      const keyPath = this.getKeyPath(key);
      const content = fs.readFileSync(keyPath, "utf8");
      return JSON.parse(content);
    } catch {
      debug(`Error loading cache key ${key}`);
      return null;
    }
  }

  private write(key: string, result: Result): void {
    if (!USE_CACHE) return;
    const keyPath = this.getKeyPath(key);
    debug(`Writing cache key ${key} to ${keyPath}`);
    fs.writeFileSync(keyPath, JSON.stringify(result));
    this.keys.add(key);
  }

  private getCacheKey(code: string): string {
    return crypto
      .createHash("md5")
      .update(code + PACKAGE_JSON.version)
      .digest("hex");
  }

  private getKeyPath(key: string): string {
    return path.join(CACHE_PATH, key);
  }
}
