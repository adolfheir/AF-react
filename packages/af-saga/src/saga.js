import invariant from 'invariant';
import createSagaMiddleware from 'redux-saga'
import * as effects from 'redux-saga/effects'
import { NAMESPACE_SEP } from "./constants"
import prefixType from './prefixType';

const { takeEvery, takeLatest, throttle, all, fork, take, cancel, put } = effects

export const sagaMiddleware = createSagaMiddleware() //闭包全局saga中间件
let noop = () => { }

export default class Saga {
  constructor(app, model) {
    this.app = app
    this.model = model
    this.namespace = model.namespace //唯一命令空间
    this.effects = model.effects
    this.onError = app.onError
    this.saga = null
  }

  runSaga() {
    const forks = Object.entries(this.effects).map(([key, effect]) => {
      return fork(function* () {
        const watcher = this.createWatcher(key, effect)
        const task = yield fork(watcher)
        yield fork(function* () {
          yield take(`${this.namespace}${NAMESPACE_SEP}@@CANCEL_EFFECTS`)
          yield cancel(task)
        })
      })
    })
    this.saga = function* () {
      yield all(forks)
    }
    sagaMiddleware.run(this.saga)
  }

  stopSaga() {
    this.app.store.dispatch({
      type: `${this.namespace}${NAMESPACE_SEP}@@CANCEL_EFFECTS`
    })
  }

  createWatcher({ key, _effect }) {
    let effect = _effect
    let type = 'takeEvery'
    let ms;
    let onEffectHooks = this.app.getHook("onEffect")
    let model = this.model

    //传effect 配置项
    if (Array.isArray(_effect)) {
      [effect] = _effect;
      const opts = _effect[1];
      if (opts && opts.type) {
        ({ type } = opts);
        if (type === 'throttle') {
          invariant(opts.ms, 'app.start: opts.ms should be defined if type is throttle');
          ({ ms } = opts);
        }
      }
      invariant(
        ['watcher', 'takeEvery', 'takeLatest', 'throttle'].indexOf(type) > -1,
        'app.start: effect type should be takeEvery, takeLatest, throttle or watcher',
      );
    }

    /**
     * 应用 oneffect hook
     */
    let sagaWithOnEffect = sagaWithCatch
    for (const fn of onEffectHooks) {
      sagaWithOnEffect = fn(sagaWithOnEffect, effects, model, key);
    }

    switch (type) {
      case 'watcher':
        return sagaWithCatch
      case 'takeLatest':
        return function* () {
          yield takeLatest(key, sagaWithOnEffect)
        }
      case 'throttle':
        return function* () {
          yield throttle(ms, key, sagaWithOnEffect)
        }
      default:
        return function* () {
          yield takeEvery(key, sagaWithOnEffect)
        }
    }

    function* sagaWithCatch(...args) {
      const { __resolve: resolve = noop, __reject: reject = noop } =
        args.length > 0 ? args[0] : {};
      try {
        yield put({ type: `${key}${NAMESPACE_SEP}@@start` });
        const ret = yield effect(...args.concat(createEffects(model, opts)));
        yield put({ type: `${key}${NAMESPACE_SEP}@@end` });
        resolve(ret);
      } catch (e) {
        this.app.onError(e, {
          key,
          effectArgs: args,
        });
        if (!e._dontReject) {
          reject(e);
        }
      }
    }

  }

  createEffects() {
    let put = (action) => {
      const { type } = action;
      assertAction(type, 'sagaEffects.put');
      return put({ ...action, type: prefixType(type, this.model) });
    }

    // see https://github.com/redux-saga/redux-saga/issues/336
    put.resolve = (action) => {
      const { type } = action;
      return effects.put.resolve({
        ...action,
        type: prefixType(type, this.model),
      })
    }

    return { ...effects, put };
  }
}
