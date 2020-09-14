import React, { Component } from 'react'
import { Route, BrowserRouter as Router, Switch, NavLink } from 'react-router-dom'
import {
  Menu,
  Responsive,
  Container,
  Button, Segment, Header
} from 'semantic-ui-react'


class Config extends Component {

  render () {
    return (
      <Segment.Group raised className='top-segment'>
        <Header attached='top'>
          Configurations
        </Header>
        <Segment attached='bottom'>
          abcd
        </Segment>
      </Segment.Group>
    )
  }
}

export default Config
