import invariant from 'invariant'

/**
 * Plugin
 */
export default class Plugin {
  namespace
  hooks = {}
  extras = {}
  tasks = {}
  _untasks = {}
  mounted = false

  constructor(app, options = {}) {
    this.app = app
    this.options = options
    Object.assign(this, options)
  }

  /**
   * mount plugin
   */
  mount() {
    this.runTask()
    this.runExtend()

    this.mounted = true
  }

  unmount() {
    this.stopTask()
    this.stopExtend()

    this.mounted = false
  }

  runTask() {
    Object.entries(this.tasks).forEach(([key, task]) => {
      const un = task(this.app)
      this._untasks[key] = un || function () { }
    })
  }

  stopTask(name) {
    Object.keys(this.tasks).filter(key => !name || key === name).map(key => {
      const untask = this._untasks[key]
      untask(this.app)
    })
  }

  runExtend() {
    if (!this.extends) {
      return
    }
    Object.entries(this.extends).forEach(([key, value]) => {
      invariant(!this.app[key], `There is already a member of the same name in application: ${key}`)
      this.app[key] = value
    })
  }

  stopExtend() {
    if (!this.extends) {
      return
    }
    Object.keys(this.extends).forEach(key=>{
      delete this.app[key]
    })
  }
}
