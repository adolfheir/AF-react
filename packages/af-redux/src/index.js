import Store from './store'

export default function (app, options = {}) {
  return {
    namespace: "redux",
    hooks: {
      beforeStart: function ({ app, options }) {
        app._models = [] //存所有的model信息
        app.store = new Store(app, options.store)
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
