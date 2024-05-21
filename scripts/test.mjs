import { readdirSync } from 'node:fs'
import { spawnSync, spawn } from 'node:child_process'
import { resolve } from 'node:path'

const testFolder = resolve('.', 'test')

if (!readdirSync(testFolder).length) {
  spawnSync('git', ['submodule', 'update', '--init'])
  spawnSync('pnpm', ['install'], { cwd: testFolder })
}

spawnSync('pnpm', ['run', 'test'], { cwd: testFolder, stdio: 'inherit' })
process.exit(0)

