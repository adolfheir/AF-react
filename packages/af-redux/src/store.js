import {
  createStore,
  combineReducers,
  applyMiddleware,
  compose
} from 'redux'
import flatten from 'flatten'
import { returnSelf } from "./utils"
import reduceReducers from 'reduce-reducers'

export default class Store {
  static defaultOptions = {
    /**
     * 初始预设的状态值
     */
    initialState: {},
    /**
     * 开始传进来的出事reduces
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
      initialState,
    } = this.options
    const enhancers = this.app.get

    //todo：找一个地方存中间件和enhancer
    let extraMiddlewares = this.app.getExtra('middlewares') || []
    const extraEnhancers = this.app.getExtra('enhancers') || []

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
    let { initialReducers } = this.this.props
    let extraReducers = [] //to do find all reducers in _model

    let reducerEnhancer = app.getExtra('reducerEnhancer') || returnSelf
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
