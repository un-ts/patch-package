import colors from "chalk"
import findWorkspaceRoot from "find-yarn-workspace-root"
import fs from "fs-extra"
import process from "process"
import { join } from "./path"

export type PackageManager = "yarn" | "npm" | "npm-shrinkwrap"

function printNoYarnLockfileError() {
  console.log(`
${colors.red(colors.bold("**ERROR**"))} ${colors.red(
    `The --use-yarn option was specified but there is no yarn.lock file`,
  )}
`)
}

function printNoLockfilesError() {
  console.log(`
${colors.red(colors.bold("**ERROR**"))} ${colors.red(
    `No package-lock.json, npm-shrinkwrap.json, or yarn.lock file.

You must use either npm@>=5, yarn, or npm-shrinkwrap to manage this project's
dependencies.`,
  )}
`)
}

function printSelectingDefaultMessage() {
  console.info(
    `${colors.bold(
      "patch-package",
    )}: you have both yarn.lock and package-lock.json
Defaulting to using ${colors.bold("npm")}
You can override this setting by passing --use-yarn or deleting
package-lock.json if you don't need it
`,
  )
}

export const detectPackageManager = (
  appRootPath: string,
  overridePackageManager: PackageManager | null,
): PackageManager => {
  const packageLockExists = fs.existsSync(
    join(appRootPath, "package-lock.json"),
  )
  const shrinkWrapExists = fs.existsSync(
    join(appRootPath, "npm-shrinkwrap.json"),
  )
  const yarnLockExists = fs.existsSync(join(appRootPath, "yarn.lock"))
  if ((packageLockExists || shrinkWrapExists) && yarnLockExists) {
    if (overridePackageManager) {
      return overridePackageManager
    } else {
      printSelectingDefaultMessage()
      return shrinkWrapExists ? "npm-shrinkwrap" : "npm"
    }
  } else if (packageLockExists || shrinkWrapExists) {
    if (overridePackageManager === "yarn") {
      printNoYarnLockfileError()
      process.exit(1)
    } else {
      return shrinkWrapExists ? "npm-shrinkwrap" : "npm"
    }
  } else if (yarnLockExists || findWorkspaceRoot()) {
    return "yarn"
  } else {
    printNoLockfilesError()
    process.exit(1)
  }
  throw Error()
}
