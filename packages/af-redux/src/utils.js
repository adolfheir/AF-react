import { NAMESPACE_SEP } from "./constants"

export const returnSelf = m => m

export const isArray = Array.isArray.bind(Array);


export function prefix(obj, namespace, type) {
  return Object.keys(obj).reduce((memo, key) => {
    if (key.indexOf(`${namespace}${NAMESPACE_SEP}`) !== 0) {
      console.warn(`[prefixNamespace]: ${type} ${key} should not be prefixed with namespace ${namespace}`)
    }
    const newKey = `${namespace}${NAMESPACE_SEP}${key}`;
    memo[newKey] = obj[key];
    return memo;
  }, {});
}

export function prefixNamespace(model) {
  const { namespace, reducers, effects } = model;

  if (reducers) {
    model.reducers = prefix(reducers, namespace, 'reducer');
    // if (isArray(reducers)) {
    //   model.reducers[0] = prefix(reducers[0], namespace, 'reducer');
    // } else {
    //   model.reducers = prefix(reducers, namespace, 'reducer');
    // }
  }
  if (effects) {
    model.effects = prefix(effects, namespace, 'effect');
  }
  console.log("new model", model)
  return model;
}


export function createReducer(initialState, handlers) {
  return function reducer(state = { ...initialState }, action) {
    console.log("action", action, handlers)
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}
