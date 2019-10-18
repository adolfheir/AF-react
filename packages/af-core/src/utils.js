export { default as isPlainObject } from 'is-plain-object';
export const returnSelf = m => m;
export function isHTMLElement(node) {
  return typeof (node) === 'object' && node !== null && node.nodeType && node.nodeName;
}
export { default as uuid } from 'uuid/v1'
