import { spawnSync } from 'node:child_process'
import minimist from 'minimist'
import semver from 'semver'
import _ from 'lodash'


const startTime = Date.now()
const { token = '', env = 'prod', image } = minimist(process.argv.slice(2))
const envName = env !== 'beta' ? 'prod' : env

const envVars = {
  GH_TOKEN: token,
  HUB_PROJECT: 'openapi-prod',
  HUB_HOST: 'asia-northeast1-docker.pkg.dev',
  HUB_FOLDER: 'openapi-prod/gameapi',
  IMAGE_NAME: 'gameapi.bitlobby',
  OWNER: 'TechU8',
  REPO: 'GameAPI.BitLobby',
  BRANCH: 'deploy/online',
  NODE_VERSION: semver.valid(process.env['npm_package_engines_node']) || '20.11.1',
  BUILD_CMD: `
  corepack enable pnpm
  pnpm install --frozen-lockfile
  pnpm build:${envName}
  `,
  VERSION_SUFFIX: '',
  DEPLOY_REPO: 'GameAPI.Helm',
  DEPLOY_OWNER: 'TechU8',
  DEPLOY_BRANCH: 'deploy/online',
  DEPLOY_FILE: './online/gameapi_service/helmfile.yaml',
  DEPLOY_KEY: 'gameapi-bitlobby',
}


if (envName === 'beta') {
  _.assign(envVars, {
    DEPLOY_REPO: "GameAPI.Helm",
    HUB_PROJECT: "techu-beta",
    HUB_FOLDER: "techu-beta/gameapi",
    BRANCH: "deploy/beta",
    DEPLOY_BRANCH: "deploy/beta",
    DEPLOY_FILE: "./beta/gameapi_service/helmfile.yaml",
    VERSION_SUFFIX: "-beta"
  })
}
if (image) {
  envVars.DEPLOY_REPO = ''
}

gcloudLoginChecker()
runScriptsWithGoogleShell()

function runScriptsWithGoogleShell() {
  fetch('https://raw.githubusercontent.com/howard-bitgaming/cloud-build/main/cloud.sh').then(resp => resp.text()).then((scripts) => {
    const setEnvVarsCmd = _.chain(envVars).map((i, k) => `${k}='${i}'`).join('\n').value() + '\n'
    const child = spawnSync('gcloud', ['cloud-shell', 'ssh', '--authorize-session', `--command=${setEnvVarsCmd}${scripts}`], { stdio: 'inherit' });
    const usedSeconds = (Date.now() - startTime) / 1000
    console.info(`---------- total used ${ntos(usedSeconds / 60)}:${ntos(usedSeconds % 60)}`)
  })
}
function ntos(val) {
  return Number(val).toLocaleString('en', { minimumIntegerDigits: 2, maximumFractionDigits: 0 })
}
function gcloudLoginChecker() {
  const gcAccounts = spawnSync('gcloud', ['auth', 'list'], { stdio: ['inherit', 'pipe', 'pipe'] })
  if (!gcAccounts.stdout.toString()) {
    const gcLogin = spawnSync('gcloud', ['auth', 'login'], { stdio: 'inherit' })
    if (gcLogin.status) process.exit(1)
  }
  console.info(gcAccounts.stdout.toString())
}