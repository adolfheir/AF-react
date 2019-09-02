import queryString from 'query-string'
import { createBrowserHistory, createMemoryHistory, createHashHistory } from 'history';

export default function (app, options = {}) {
  const {
    history = createHashHistory()
  } = options

  addLocationQuery(history)

  history.listen((location) => {
    addLocationQuery(history)
  })

  return {
    namespace: 'router',
    extends: {
      history
    }
  }

  // add history hook and attach query params
  function addLocationQuery(history) {
    history.location = Object.assign(
      history.location,
      {
        query: queryString.parse(history.location.search)
      }
    )
    app.emit('routeChange', history)
  }

}

export { createBrowserHistory, createMemoryHistory, createHashHistory };
