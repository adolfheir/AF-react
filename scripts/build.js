const execSync = require('child_process').execSync
const exec = require('child_process').exec
const path = require("path")
const fs = require("fs")

const isDev = process.env.NODE_ENV === 'development'
const moduleNmae = process.env.MODULE_NAME || ""
const babelConfigPath = path.join(__dirname, '../babel.config.js')

const doExec = (command, extraEnv) => {
  if (isDev) {
    func = exec(command, {
      stdio: 'inherit',
      env: Object.assign({}, process.env, extraEnv)
    })
  } else {
    func = execSync(command, {
      stdio: 'inherit',
      env: Object.assign({}, process.env, extraEnv)
    })
  }
  return func
}

console.log(`\nBuilding ES modules (${moduleNmae}) ...`)

doExec(`babel src --out-dir es --config-file ${babelConfigPath} ${isDev ? "--watch" : ""}`, {
  BABEL_ENV: 'es',
  NODE_ENV: process.env.NODE_ENV
})

console.log(`Building CommonJS modules (${moduleNmae}) ...`)

doExec(`babel src --out-dir lib --config-file ${babelConfigPath} ${isDev ? "--watch" : ""}`, {
  BABEL_ENV: 'cjs',
  NODE_ENV: process.env.NODE_ENV
})


