import invariant from 'invariant'
import { isPlainObject, uuid } from "./utils"
import Plugin from "./plugin"

export default class Application {
  isStarted = false //启动状态

  _plugins = [] //插件集合
  _inject = {} //default _inject data

  /**
   * 向应用程序成员中注入数据
   * @param {any} data - 注入数据
   * @param {string} [member] - 注入的成员
   */
  inject(data, member = '_inject') {
    // 注入数据key必须下划线开头 区分extends数据
    invariant(
      typeof (member) === "string" && member.startsWith("_"),
      `[app.inject] member should be string and must startsWith _ `,
    );
    if (!this[member]) { this[member] = [] }
    console.log(this[menubar])
    this[member].push(data)
  }

  getInject(member) {
    invariant(
      typeof (member) === "string" && member.startsWith("_"),
      `[app.getInject] member should be string and must startsWith _ `,
    );
    return this[menubar] || []
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
    //如果没有namespace 给个默认的namespace
    if (!plugin.namespace) { plugin.namespace = uuid() }
    //如果存在同名插件 则报错
    let hasSameNamePlugin = this._plugins.find(p => p.namespace != null && p.namespace === options.namespace)
    if (hasSameNamePlugin) { //如果存在同名插件 则不使用该插件
      invariant(false, `it has same name plugin '${plugin.namespace}' in this instance`);
      return
    } else {
      //如果没有提供构造函数 则使用默认构造函数
      let Ctor = plugin.ctor || Plugin
      plugin = new Ctor(this, plugin)
      this._plugins.push(plugin)
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
    const index = this._plugins.findIndex(plugin => {
      return plugin.namespace === namespace
    })
    if (index < 0) { //如果不存在同名插件 则返回
      invariant(false, `plugin.remove:the plugin '${namespace}' is not existed `);
      return
    } else {
      const plugin = this._plugins[idx]
      plugin.unmount()
      this._plugins.splice(index, 1)
    }
  }

  /**
   * 获取所有的event hooks
   * @param {*} name event name
   */
  getHook(name) {
    let handlers = [] //get all hooks
    this._plugins.forEach((plugin) => {
      if (plugin.hooks && plugin.hooks[name]) {
        handlers.push(plugin.hooks[name])
      }
    })
    return handlers
  }

  /**
   * 事件触发器
   * @param {*} name 事件名字
   * @param  {...any} payload 传递参数
   */
  emit(name, ...payload) {
    let handlers = this.getHook(name)
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
      this.emit('onError', err)
    }
  }

  /**
   * 启动 app
   * @param {*} options
   */
  start(options = {}) {
    if (this.isStarted) { return }
    this.emit('beforeStart', { app: this, options })
    this._plugins.forEach(plugin => {
      if (!plugin.mounted) {
        plugin.mount()
      }
    })
    this.emit('afterStarted', this)
    this.isStarted = true
  }
}
