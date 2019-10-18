import React from 'react'
import ReactDOM from 'react-dom'
import invariant from 'invariant';
import document from 'global/document';
import { Provider } from 'react-redux';

export default function (app) {
  return {
    namespace: 'render',
    extends: {
      /**
       * 使用react render
       *
       * @param {*} [option={}]
       */
      render: function (option = {}) {
        let {
          container, //dom 容器
          Content = null //react 组件
        } = option

        // 允许 container 是字符串，然后用 querySelector 找元素
        if (typeof container === 'string') {
          container = document.querySelector(container);
          invariant(container, `[app.render] container ${container} not found`);
        }


        // 并且是 HTMLElement
        invariant(
          !container || isHTMLElement(container),
          `[app.render] container should be HTMLElement`,
        );

        //必须先start app 注册store后才可以
        invariant(
          !!app.store,
          `[app.render] you must start app before render`,
        );

        const store = app.store
        const provider = (
          <Provider store={store}>
            <Content />
          </Provider>
        );

        // If has container, render; else, return react component
        if (container) {
          ReactDOM.render(provider, container)
        } else {
          return provider
        }
      }
    }
  }

}
