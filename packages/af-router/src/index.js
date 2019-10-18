import queryString from "queryString"
import { createBrowserHistory, createMemoryHistory, createHashHistory } from 'history';


export default function (app, options = {}) {
  const {
    history = createHashHistory()
  } = options

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
}

export { createBrowserHistory, createMemoryHistory, createHashHistory };
