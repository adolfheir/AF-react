<<<<<<< HEAD
export let x =1
=======
import window from 'global/window'
import invariant from 'invariant'
import Application from './application'

invariant(!!window, `You shuould use 【af】 in browser`)

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



>>>>>>> e9c03508... feat:初步完成store创建流程
