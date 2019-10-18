import invariant from 'invariant';
import createSagaMiddleware from 'redux-saga'
import * as effects from 'redux-saga/effects'
import { NAMESPACE_SEP } from "./constants"
import prefixType from './prefixType';

const { takeEvery, takeLatest, throttle, all, fork, take, cancel, put } = effects

const noop = () => { }

export const sagaMiddleware = createSagaMiddleware() //闭包全局saga中间件


export function creatSaga(...args) {
  const [
    effects = {},
    model,
    app,
    opts = {}
  ] = args
  //每个都扔到子线程执行
  const forks = Object.entries(effects).map(([key, effect]) => {
    return fork(function* () {
      const watcher = createWatcher(key, effect, model, app)
      const task = yield fork(watcher)
      yield fork(function* () {
        yield take(`${model.namespace}${NAMESPACE_SEP}@@CANCEL_EFFECTS`)
        yield cancel(task)
      })
    })
  })
  //汇总
  return function* () {
    yield all(forks)
  }
}

function createWatcher(...args) {
  const [
    actionType,
    _effect,
    model,
    app
  ] = args

  let effect = _effect
  let type = 'takeEvery'
  let ms;

  //effect 校验处理 先抄dva  后续再改
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


  //默认行为
  function* effectWithCatch(action = {}) {
    const { __resolve: resolve = noop, __reject: reject = noop } = action
    try {
      const inject = getEffectInject(model, app)
      yield put({ type: `${actionType}${NAMESPACE_SEP}@@start` })
      const ret = yield effect(action, inject)
      yield put({ type: `${actionType}${NAMESPACE_SEP}@@end` })
      resolve(ret, action)
    } catch (e) {
      e.namespace = model.namespace
      e.actionType = actionType
      e.from = 'model'
      app.onError(e)
      reject(e);
    }
  }

  /**
     * 获取saga增强器
     */
  const sagaWithOnEffect = function* (action = {}) {
    //触发钩子
    app.emit("onEffect", model, action)
    // 每次都动态获取 enhancer
    const effectEnhancer = app.getInject('_effectEnhancer')[0]
    const inject = getEffectInject(model, app)
    const effectWithEnhancer = effectEnhancer ? effectEnhancer(effectWithCatch, model) : effectWithCatch
    yield effectWithEnhancer(action, inject)
  }


  //saga辅助函数
  switch (type) {
    case 'watcher':
      return effectWithCatch
    case 'takeLatest':
      return function* () {
        yield takeLatest(actionType, sagaWithOnEffect)
      }
    case 'throttle':
      return function* () {
        yield throttle(ms, actionType, sagaWithOnEffect)
      }
    default:
      return function* () {
        yield takeEvery(actionType, sagaWithOnEffect)
      }
  }

}

function getEffectInject(model, app) {
  let put = (action) => {
    const { type } = action;
    // assertAction(type, 'sagaEffects.put');
    let func = effects.put({ ...action, type: prefixType(type, model) });
    return func
  }

  // see https://github.com/redux-saga/redux-saga/issues/336
  put.resolve = (action) => {
    const { type } = action;
    return effects.putResolve({
      ...action,
      type: prefixType(type, model),
    })
  }

  /**
   *一个saga帮助函数 不经过redux 直接调generator 实现effct同步
   *
   * @param {*} action
   * @returns
   */
  function callAction(action) {
    const { type } = action;
    const { model: currentModel, effect } = app.getEffect(type, model)
    return effect(action, getEffectInject(currentModel, app))
  }

  return { ...effects, put, callAction };
}

