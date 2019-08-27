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
    m.flows = {
      ...options.effects,
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
        app._models = [] //存所有的model信息
        app.store = new Store(app, options)
      }
    },
    extends: {
      dispatch: function (...arg) {
        let { store: { dispatch = () => { } } = {} } = this.app
        return dispatch(arg)
      },
      model: function (model) {
        model = normalize(model)
        const prefixedModel = prefixNamespace({ ...model });
        app.inject(prefixedModel, "_models")
        app.store.updateReducer()
      },
      unModel: function (namespace) {

      }

    }
  }
}
