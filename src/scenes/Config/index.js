import React, { useState } from 'react'
// import { Route, BrowserRouter as Router, Switch, NavLink } from 'react-router-dom'
import {
  Segment,
  Header
} from 'semantic-ui-react'

// styles
// import styles from './Config.module.scss'

const Config = () => {

  return (
    <Segment.Group raised className='top-segment'>
      <Header attached='top' textAlign='center' className='headings'>Configuration</Header>
      <Segment attached='bottom'>
        abcd
      </Segment>
    </Segment.Group>
  )
}

export default Config
