import React, { Fragment, useEffect, useState } from 'react'
import moment from 'moment'
import _ from 'lodash'

// semantic
import {
  Segment,
  Header,
  Dimmer,
  Loader,
  Image,
  Card,
  Button,
  Label,
  Menu,
  Responsive,
  Icon,
  Dropdown
} from 'semantic-ui-react'

// import styles
import styles from './Camera.module.scss'

const Camera = () => {

  return (
    <Segment.Group raised className='top-segment'>

      <Header attached='top' textAlign='center' className='headings'>Live Camera</Header>

      <Segment>
        {/* <video src='http://10.144.245.0:8081' controls={false}></video> */}
        <iframe src='http://10.144.245.0:8081' height='500' width='300' title='live cam'></iframe>
      </Segment>
    </Segment.Group>
  )
}

export default Camera
