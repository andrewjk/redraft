import path from "node:path";
import { fileURLToPath } from "node:url";

// Tests can be invoked from different directories (packages/site, or the
// repo root via `vp test`), so resolve paths against known locations
// instead of process.cwd()
export const testDir = path.dirname(fileURLToPath(import.meta.url));
export const packageDir = path.resolve(testDir, "..");

export function testPath(...segments: string[]): string {
	return path.resolve(testDir, ...segments);
}

export function packagePath(...segments: string[]): string {
	return path.resolve(packageDir, ...segments);
}
