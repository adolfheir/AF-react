import React from 'react'
let app = {}

//model 回收策略
export const RESOURCE_RECYCLE_STRATEGY = {
  NONE: 1,
  RESET: 2,
  DESTROY: 3
}

export class Module extends React.PureComponent {
  static defaultProps = {
    resources: [],
    resourceRecycleStrategy: RESOURCE_RECYCLE_STRATEGY["NONE"]
  }
  constructor(props) {
    super(props)
    this.state ={
      mount:false
    }
    const { resources } = this.props
    if (!this.mount) {
      resources.map(resource => {
        app.model(resource)
      })
    }
  }

  componentDidMount() {
    this.setState({
      mount:true
    })
  }

  componentWillUnmount() {
    const { resources, resourceRecycleStrategy } = this.props
    switch (resourceRecycleStrategy) {
      case RESOURCE_RECYCLE_STRATEGY["RESET"]:
        resources.forEach(({ namespace }) => {
          app.store.dispatch({
            type: `${namespace}/reset`
          })
        })
        break;
      case RESOURCE_RECYCLE_STRATEGY["DESTROY"]:
        resources.forEach(({ namespace }) => {
          app.unModel(namespace)
        })
        this.setState({ mount: false })
        break;
      default:
        break;
    }
  }

  render() {
    const { children } = this.props
    const { mount } = this.state;
    if (!mount) {
      return null
    } else {
      return children
    }
  }
}
