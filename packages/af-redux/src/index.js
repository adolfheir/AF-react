import Store from './store'

export function reduxPlugin(app, options = {}) {
  return {
    namespace: "redux",
    hooks: {
      beforeStart: function ({ app, options }) {
        app.store = new Store(app, options.store)
        app._models = [] //存所有的model信息
      }
    },
    extends: {
      model: function (model) {

      },
      unModel: function (namespace) {

      }

    }
  }
}
