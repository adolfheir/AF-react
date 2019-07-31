import window from 'global/window'
// import window from 'global/window';
import invariant from 'invariant'
import Application from './application'

invariant(!!window, `you shuould use 'af' in browser`)
console.log("sdssss")
export let globalApp = window.__afApp__
export function createApp() {
  globalApp = new Application()
  window.__afApp__ = globalApp
  return globalApp
}

export function getApp() {
  return globalApp
}

export function resetApp() {
  globalApp = null
  return createApp()
}



