import {
  createStore,
  combineReducers,
  applyMiddleware,
  compose
} from 'redux'
import flatten from 'flatten'
import { returnSelf, createReducer } from "./utils"
import reduceReducers from 'reduce-reducers'
import { connectRouter, routerMiddleware } from 'connected-react-router';


export default class Store {
  static defaultOptions = {
    /**
     * 初始预设的状态值
     */
    initialState: {},
    /**
     * 开始传进来的初始reduces
     */
    initialReducers: {},
  }

  constructor(app, options = {}) {
    this.app = app
    this.options = Object.assign({}, Store.defaultOptions, options)
    this.init()
  }

  /**
   * 初始话app state
   */
  init() {
    const {
      initialState = {},
    } = this.options

    //todo：找一个地方存中间件和enhancer
    let extraMiddlewares = this.app.getInject('_middlewares') || []
    let extraEnhancers = this.app.getInject('_enhancers') || []

    if (this.app.history) {
      extraMiddlewares = [routerMiddleware(history), ...extraMiddlewares]
    }

    const enhancers = [
      applyMiddleware(...flatten(extraMiddlewares)),
      ...extraEnhancers,
    ]

    //redux调试工具
    const composeEnhancers =
      process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true, maxAge: 30 })
        : compose;

    const store = createStore(
      this.getReducer(),
      initialState,
      composeEnhancers(...enhancers)
    )
    Object.assign(this, store)
  }

  getReducer() {
    let { initialReducers } = this.options
    let extraReducers = {} //to do find all reducers in _model
    if (this.app.history) {
      extraReducers = { router: connectRouter(history), extraReducers }
    }

    //get models
    let modes = this.app._models || []
    extraReducers = modes.reduce((memo, model) => {
      // Object.entries(model["reducers"] || {}).forEach(([key, value]) => {
      //   memo[key] = value
      // })
      console.log("model", model)
      memo[model["namespace"]] = createReducer(model["state"] || {}, model["reducers"] || {})
      return memo
    }, extraReducers)

    let reducerEnhancer = this.app.getInject('_reducerEnhancer')[0] || returnSelf
    return reducerEnhancer(
      reduceReducers(
        combineReducers({
          ...initialReducers,
          ...extraReducers,
        })
      )
    );
  }

  /**
  * 更新 reducer
  */
  updateReducer(args = {}) {
    const reducer = this.getReducer(args)
    this.replaceReducer(reducer) //因为store和被创建的store被assigin了 所以直接调
  }
}
