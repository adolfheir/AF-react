import invariant from 'invariant'
import { isPlainObject } from "./utils"
import Plugin from "./plugin"
export default class Application {
  isStarted = false //启动状态
  plugins = [] // 插件集合

  _inject = {} //set any data

  /**
   * 向应用程序成员中注入数据
   * @param {object} obj - 注入对象
   * @param {string} [member] - 注入的成员
   */
  inject(obj, member = '_inject') {
    Object.keys(obj).forEach(key => {
      this[member][key] = obj[key]
    })
  }

  /**
   * 添加插件
   * @param {*} plugin
   */
  use(plugin, options) {
    if (typeof plugin === 'function') {
      try {
        plugin = plugin.bind(null, this)
        plugin = plugin(options)
      } catch (error) {
        this.onError(error)
        return
      }
    }
    invariant(isPlainObject(plugin), 'plugin.use: plugin should be plain object');
    let hasSameNamePlugin = this.plugins.find(p => p.namespace != null && p.namespace === options.namespace)
    if (hasSameNamePlugin) { //如果存在同名插件 则不使用该插件
      invariant(false, `it has same name plugin '${plugin.namespace}' in this instance`);
      return
    } else {
      let Ctor = plugin.ctor || Plugin
      plugin = new Ctor(this, plugin)
      this.plugins.push(plugin)
      if (this.started) {
        plugin.mount()
      }
    }
  }

  /**
   * 从当前实例删除插件
   * @param {*} namespace 实例名称
   */
  remove(namespace) {
    const index = this.plugins.findIndex(plugin => {
      return plugin.namespace === namespace
    })
    if (index < 0) { //如果不存在同名插件 则返回
      invariant(false, `plugin.remove:the plugin '${namespace}' is not existed `);
      return
    } else {
      const plugin = this.plugins[idx]
      plugin.unmount()
      this.plugins.splice(index, 1)
    }
  }

  /**
   * 事件触发器
   * @param {*} name 事件名字
   * @param  {...any} payload 传递参数
   */
  emit(name, ...payload) {
    let handlers = [] //get all hooks
    this.plugins.forEach((plugin) => {
      if (plugin.hooks && plugin.hooks[name]) {
        handlers.push(plugin.hooks[name])
      }
    })
    if (handlers.length) {
      for (const handler of handlers) {
        const ret = handler(...payload)
        if (ret === false) { //stop emit
          break
        }
      }
    }
  }

  /**
   * 抛出错误
   * todo：包裹error 类型
   * @param {*} err 错误信息
   */
  onError = (err) => {
    if (err) {
      if (typeof err === 'string') {
        err = new Error(err)
      }
      this.emit('error', err)
    }
  }

  /**
   * 启动 app
   * @param {*} options
   */
  start(options = {}) {
    if (this.isStarted) { return }
    this.emit('beforeStart', { app: this, options })
    this.plugins.forEach(plugin => {
      if (!plugin.mounted) {
        plugin.mount()
      }
    })
    this.emit('start', this)
    this.isStarted = true
  }
}
