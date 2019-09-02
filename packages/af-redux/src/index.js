import Store from './store'
import { prefixNamespace } from "./utils"
export default function (app, options = {}) {
  let injectReducer = {
    // 普通更新
    change(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    },
    // 整个替换
    replace(state, { payload }) {
      return payload || {}
    },
    // 重置
    reset(state, { payload }) {
      const origin = state._initialState
      return {
        ...state,
        ...origin
      }
    }
  }

  let normalize = (m) => {
    m.reducers = {
      ...injectReducer,
      ...m.reducers
    }
    m.effects = {
      ...m.effects,
    }
    m.state = {
      _initialState: m.state,
      ...m.state
    }
    return m
  }

  return {
    namespace: "redux",
    hooks: {
      afterStarted: function () {
        app.emit("beforeReduxStart")
        app._models = [] //存所有的model信息
        app.store = new Store(app, options)
        app.emit("afterReduxStart")

      }
    },
    extends: {
      dispatch: function (...arg) {
        let { store: { dispatch = () => { } } = {} } = app
        return dispatch(...arg)
      },
      model: function (model) {
        //初始化未完成 不给注入
        if (!app.isStarted) {
          return
        }
        //redux
        model = normalize(model)
        const prefixedModel = prefixNamespace({ ...model });
        app.inject(prefixedModel, "_models")
        app.store.updateReducer()
        //effect
        if (prefixedModel.effects && app.runSaga && app.creatSaga) {
          app.runSaga(app.creatSaga(prefixedModel["effects"], prefixedModel, app));
        }

      },
      unModel: function (namespace) {

      }

    }
  }
}
