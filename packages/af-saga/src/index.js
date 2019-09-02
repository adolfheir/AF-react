import { creatSaga, sagaMiddleware } from "./saga"
import createPromiseMiddleware from "./createPromiseMiddleware"

export default function (app, options = {}) {
  return {
    namespace: "saga",
    hooks: {
      beforeReduxStart: function () {
        //注入中间件 顺序
        let promiseMiddleware = createPromiseMiddleware(app)
        app.inject(promiseMiddleware, "_middlewares")
        app.inject(sagaMiddleware, "_middlewares")
      },
      afterReduxStart: function () {
        //注入中间件 顺序
        // app.inject(sagaMiddleware, "_middlewares")
        // app.inject(promiseMiddleware, "_middlewares")
      }
    },
    extends: {
      creatSaga,
      runSaga: sagaMiddleware.run,
      getEffect: (actionType, currentModel) => {
        let effect,
          model;
        //如果当前model有 则直接拿 不然从全局遍历 节约开销
        if (currentModel["effects"] && currentModel["effects"][actionType]) {
          effect = currentModel["effects"][actionType]
          model = currentModel
        }

        if (!effect) {
          let models = app.getInject("_models")
          for (let i = 0; i < models.length; i++) {
            let _model = models[i]
            if (_model.namespace === currentModel.namespace) {
              continue
            }
            if (_model["effects"] && _model["effects"][actionType]) {
              effect = _model["effects"][actionType]
              model = _model
              break
            }
          }
        }
        return {
          effect,
          model
        }
      }
    }
  }
}
