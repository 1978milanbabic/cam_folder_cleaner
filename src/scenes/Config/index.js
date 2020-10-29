import React, { useEffect, useState } from 'react'
// import { Route, BrowserRouter as Router, Switch, NavLink } from 'react-router-dom'
import {
  Segment,
  Header,
  Button,
  Input
} from 'semantic-ui-react'

// styles
// import styles from './Config.module.scss'

const Config = () => {
  // email
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetch('/api/motion/mail', {credentials: 'same-origin'})
    .then(res => res.json())
    .then(response => {
      setEmail(response.mail)
    })
  }, [])

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

  const handleEmailChange = () => {
    fetch('/api/motion/mail', {
      method: 'POST',
      body: JSON.stringify({mail: email}),
      headers: { 'Content-type': 'application/json; charset=UTF-8' }
    })
    .then(res => res.json())
    .then(response => {
      setEmail(response.mail)
    })
  }

  return (
    <Segment.Group raised className='top-segment'>
      <Header attached='top' textAlign='center' className='headings'>Configuration</Header>
      <Segment.Group attached='bottom' style={{margin: 0}}>
        <Segment>
          Set email: <Input type='email' value={email} onChange={(e, target) => setEmail(target.value)} /> <Button onClick={handleEmailChange}>Confirm</Button>
        </Segment>
        <Segment>
          Reboot system: <Button onClick={doReboot} color='red'>Reboot</Button>
        </Segment>
      </Segment.Group>
    </Segment.Group>
  )
}

export default Config
