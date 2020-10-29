import React, { useEffect, useState } from 'react'
import { Route, BrowserRouter as Router, Switch, NavLink } from 'react-router-dom'
import {
  Menu,
  Responsive,
  Container,
  Checkbox
} from 'semantic-ui-react'

// scenes
import Home from './scenes/Home'
import Config from './scenes/Config'

// styles
import 'semantic-ui-css/semantic.min.css'
import './App.scss'

const App = () => {
  // stream link
  const [streamUrl, setStreamUrl] = useState()
  // mailing alert
  const [mailAlert, setMailAlert] = useState(false)

  useEffect(() => {
    fetch('/api/medias/streaming_url', {credentials: 'same-origin'})
    .then(res => res.json())
    .then(response => {
      setStreamUrl(response.streaming)
    })
    fetch('/api/motion/mail_alert', {credentials: 'same-origin'})
    .then(res => res.json())
    .then(response => {
      setMailAlert(response.alert)
    })
  }, [])

  const setMailAlertOnOff = () => {
    fetch('/api/motion/set_mail_alert', {credentials: 'same-origin'})
    .then(res => res.json())
    .then(response => {
      setMailAlert(response.alert)
    })
  }
  return (
    <div className='App'>
      <Router>
        <Responsive as={Menu} fixed='top'>
          <Menu.Item as={NavLink} to='/' exact>
            Home
          </Menu.Item>
          <Menu.Item as='a' href={streamUrl}>
            Live
          </Menu.Item>
          <Menu.Item as={NavLink} to='/config' exact>
            Configuration
          </Menu.Item>
          <Menu.Item  position='right'>
            Mail Alert:&emsp; <Checkbox toggle checked={mailAlert} onChange={setMailAlertOnOff} />
          </Menu.Item>
        </Responsive>
        <Container>
          <Switch>
            <Route path='/' exact component={Home}></Route>
            <Route path='/config' component={Config}></Route>
          </Switch>
        </Container>
      </Router>
    </div>
  )
}

export default App
