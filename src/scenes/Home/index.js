import React, { Fragment, useEffect, useState } from 'react'
// import _ from 'lodash'
// import io from 'socket.io-client'
import {
  Segment,
  Header,
  Dimmer,
  Loader,
  Image
} from 'semantic-ui-react'

// import styles
import './style.css'

const Home = () => {
  // medias loaded?
  const [mediasLoaded, setMediasLoaded] = useState(false)
  // medias info list
  const [medias, setMedias] = useState([])
  // log loaded?
  const [logLoaded, setLogLoaded] = useState(false)
  // log as array
  const [log, setLog] = useState([])

  // load log & medias list
  useEffect(() => {
    // load logs
    fetch('/api/motion/log', {credentials: 'same-origin'})
      .then(res => res.json())
      .then(logs => {
        // obtained medias list
        setLogLoaded(true)
        if (Array.isArray(logs) && logs.length > 0) {
          setLog([ ...logs ])
        } else {
          setLog(['No log file to load ...'])
          console.log('No logs ...')
        }
      })
    // load medias (create list of medias)
    fetch('/api/motion/medias', {credentials: 'same-origin'})
      .then(res => res.json())
      .then(medias => {
        // obtained medias list
        setMediasLoaded(true)
        if (Array.isArray(medias)) {
          setMedias([ ...medias ])
        } else {
          console.log('No Medias')
        }
      })
  }, [])

  return (
    <Segment.Group raised className='top-segment'>

      <Header attached='top' textAlign='center'>Home</Header>

      {/* Log */}
      <Segment>Log</Segment>
      <Segment style={{
        maxHeight: '10rem',
        overflowY: 'auto'
      }}>
        {!logLoaded && log ? ('Loading ...') :
          log.map((lg, i) => (<p key={i}>{lg}</p>))
        }
      </Segment>

      {/* Medias */}
      <Segment>
        Video Recordings
      </Segment>
      <Segment attached='bottom'>
        {!mediasLoaded ?
          <Fragment>
            Loading ...
          </Fragment>
          :
          medias && medias.map((media, i) => <video key={i} src={media.url} width='100%' controls></video>)
        }
      </Segment>

    </Segment.Group>
  )
}

export default Home
