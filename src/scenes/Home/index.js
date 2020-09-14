import React, { Fragment, useEffect, useState } from 'react'
// import _ from 'lodash'
// import io from 'socket.io-client'
import {
  Segment,
  Header
} from 'semantic-ui-react'

const Home = () => {
  // has medias?
  const [hasMedias, setHasMedias] = useState()
  // medias info list
  const [medias, setMedias] = useState()
  // load medias list
  useEffect(() => {
    fetch('/api/medias', {credentials: 'same-origin'})
      .then(res => res.json())
      .then(medias => {
        if (Array.isArray(medias)) {
          // setMedias({ medias })
          console.log(medias)
        } else {
          console.log('No Medias')
        }
      })
  }, [])

  return (
    // <Fragment>
    //   <Header attached='top'>Home page</Header>
    //   <Segment attached='bottom'>
    //     {}
    //   </Segment>
    // </Fragment>
    <Segment.Group raised>
      <Segment><h2>Cam Recordings</h2></Segment>
      <Segment><p>fdsfd</p></Segment>
    </Segment.Group>
  )
}

export default Home
