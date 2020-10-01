import React from 'react'
import { Route, BrowserRouter as Router, Switch, NavLink } from 'react-router-dom'
import {
  Menu,
  Responsive,
  Container,
  Button
} from 'semantic-ui-react'

// scenes
import Home from './scenes/Home'
import Config from './scenes/Config'
import Camera from './scenes/Camera'

// styles
import 'semantic-ui-css/semantic.min.css'
import './App.scss'

const App = () => {
  const doReboot = () =>  {
    let ruSure = window.confirm('This will reboot system!')
    if (ruSure) {
      fetch('/api/reboot', {credentials: 'same-origin'})
      .then(res => res.json())
      .then(response => {
        console.log(response)
      })
    }
  }
  return (
    <div className='App'>
      <Router>
        <Responsive as={Menu} fixed='top'>
          <Menu.Item as={NavLink} to='/' exact>
            Home
          </Menu.Item>
          <Menu.Item as='a' href='http://10.144.245.0:8081'>
            Live
          </Menu.Item>
          <Menu.Item as={NavLink} to='/config' exact>
            Configuration
          </Menu.Item>
          <Menu.Item  position='right'>
            <Button onClick={doReboot} color='red'>Reboot</Button>
          </Menu.Item>
        </Responsive>
        <Container>
          <Switch>
            <Route path='/' exact component={Home}></Route>
            {/* <Route path='/camera' component={Camera}></Route> */}
            <Route path='/config' component={Config}></Route>
          </Switch>
        </Container>
      </Router>
    </div>
  )
}

export default App
