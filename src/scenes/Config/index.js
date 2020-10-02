import React, { Component } from 'react'
// import { Route, BrowserRouter as Router, Switch, NavLink } from 'react-router-dom'
import {
  Segment,
  Header
} from 'semantic-ui-react'

// styles
// import styles from './Config.module.scss'

class Config extends Component {

  render () {
    return (
      <Segment.Group raised className='top-segment'>
        <Header attached='top' textAlign='center' className='headings'>Configuration</Header>
        <Segment attached='bottom'>
          abcd
        </Segment>
      </Segment.Group>
    )
  }
}

export default Config
