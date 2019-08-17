import Saga, { sagaMiddleware } from "./saga"
import promiseMiddleware from "./createPromiseMiddleware"

export default function (app, options = {}) {
  return {
    namespace: "saga",
    hooks: {
      beforeStart: function (app, options) {
        //注入中间件 顺序
        app.inject(sagaMiddleware, "_middlewares")
        app.inject(promiseMiddleware, "_middlewares")

      }
    },
    extends: {
      sagaMiddleware,
      promiseMiddleware
    }
  }
}
