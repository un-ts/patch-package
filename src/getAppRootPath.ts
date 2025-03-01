import { existsSync } from "fs-extra"
import process from "process"
import { join, resolve } from "./path"

export const getAppRootPath = (): string => {
  let cwd = process.cwd()
  while (!existsSync(join(cwd, "package.json"))) {
    const up = resolve(cwd, "../")
    if (up === cwd) {
      throw new Error("no package.json found for this project")
    }
    cwd = up
  }
  return cwd
}
