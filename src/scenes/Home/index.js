import React, { Fragment, useEffect, useState } from 'react'
import moment from 'moment'
import _ from 'lodash'
import io from 'socket.io-client'
import filesize from 'filesize'

// semantic
import {
  Segment,
  Header,
  Image,
  Card,
  Button,
  Label,
  Menu,
  Responsive,
  Icon,
  Dropdown,
  Modal
} from 'semantic-ui-react'

// import styles
// import styles from './Home.module.scss'

const Home = () => {
  // medias loaded?
  const [mediasLoaded, setMediasLoaded] = useState(false)
  // medias info list
  const [medias, setMedias] = useState()
  // log loaded?
  const [logLoaded, setLogLoaded] = useState(false)
  // log as array
  const [log, setLog] = useState([])
  // dates
  const [dates, setDates] = useState([])

  //load log
  const loadLogFile = () => {
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
  }
  // load medias
  const loadMedias = () => {
    fetch('/api/motion/medias', {credentials: 'same-origin'})
      .then(res => res.json())
      .then(meds => {
        // filter only pics
        let filteredMedias = []
        if (Array.isArray(meds) && meds.length > 0) {
          filteredMedias = meds.filter(m => {
            let nameArr = m.name.split('.')
            let extension = nameArr[nameArr.length - 1]
            return extension === 'jpg'
          })
        }
        // obtained medias list
        setMediasLoaded(true)
        if (filteredMedias.length > 0) {
          filteredMedias.map(m => {
            let date = moment(m.created_at).local()
            m.day = date.format('DD-MMM-YYYY')
            m.hour = date.format('HH:mm:ss')
            m.time = date.toDate().getTime()
            return m
          })
          // state medias = { 'date': [ ...mediasOrderedByTime ], ... }
          let inDates = [ ...new Set(filteredMedias.map(d => d.day)) ]
          setDates(inDates)
          let mediasOrderedByDate = {}
          // create keys by unique day
          inDates.forEach(dat => {
            mediasOrderedByDate[dat] = []
          })
          // order loaded by time
          filteredMedias.sort((a, b) => b.time - a.time)
          // create entries by date
          filteredMedias.forEach(ent => {
            ent.selected = false
            mediasOrderedByDate[ent.day].push(ent)
          })
          // fix size and lenght!!!!            !!!!!!!!!!!!!1

          console.log(mediasOrderedByDate)
          setMedias({ ...mediasOrderedByDate })
        } else {
          console.log('No Medias')
        }
      })
  }

  // load log & medias list on load
  useEffect(() => {
    // load logs
    loadLogFile()
    // load medias (create list of medias)
    loadMedias()
    // socket
    // connect to socket.io
    const socket = io('/')
    socket.on('refresh', val =>{
      if (val === 'medias') loadMedias()
      if (val === 'logs') loadLogFile()
    })
  }, [])

  // corner individual media select btn
  const handleClickSelectOne = (day, name) => {
    let changedMedias = _.cloneDeep(medias)
    changedMedias[day].map(med => {
      return med.name === name ? med.selected = !med.selected : false
    })
    setMedias({ ...changedMedias })
  }
  // select all medias by day btn
  const handleSelectAllMediasByDay = day => {
    let changedMedias = _.cloneDeep(medias)
    changedMedias[day].map(med => {
      return med.selected = true
    })
    setMedias({ ...changedMedias })
  }
  // unselect all medias by day btn
  const handleUnselectAllMediasByDay = day => {
    let changedMedias = _.cloneDeep(medias)
    changedMedias[day].map(med => {
      return med.selected = false
    })
    setMedias({ ...changedMedias })
  }
  // move selected medias btn
  const handleMoveSelectedMedias = day => {
    let confirmation = window.confirm('This Will Move Selected Medias.\n\rAre You Sure?')
    if (confirmation) {
      // move selected medias

    }
  }
  // delete selected medias btn
  const handleDeleteSelectedMedias = day => {
    let confirmation = window.confirm('This Will Delete Selected Medias.\n\rAre You Sure?')
    if (confirmation) {
      // delete selected medias
      let reducedMedias
      medias[day].forEach(med => {
        if (med.selected) {
          fetch(`/api/motion/medias/${med.name}`, {credentials: 'same-origin', method: 'delete'})
            .then(res => res.json())
            .then(response => {
              console.log(response)
              if (response && response.deleted) {
                reducedMedias = _.cloneDeep(medias)
                reducedMedias[day] = reducedMedias[day].filter(med => med.name !== response.deleted)
              }
            })
        }
      })
      setMedias(reducedMedias)
      // if empty array -> remove property from object
      if (!reducedMedias || !reducedMedias[day] || reducedMedias[day].length === 0) {
        setDates(dates.filter(date => date !== day))
        if (reducedMedias && reducedMedias[day]) delete reducedMedias[day]
      }
    }
  }
  // play video btn
  const handlePlayVideo = vid => {
    let vidName = vid.split('/')
    vidName = vidName[vidName.length - 1].toString()
    // set seen on this video
    fetch(`/api/motion/seen/${vidName}`, {credentials: 'same-origin'})
      .then(res => res.json())
      .then(response => {
        console.log(response)
      })
    // reload medias
    loadMedias()
    // open modal


  }
  // handle close video modal


  return (
    <Fragment>

      <Modal
        size='fullscreen'
      >

      </Modal>

      <Segment.Group raised className='top-segment'>

        <Header attached='top' textAlign='center' className='headings'>Home</Header>

        {/* Log */}
        <Segment className='headings'>Log</Segment>
        <Segment style={{
          maxHeight: '10rem',
          overflowY: 'auto'
        }}>
          {!logLoaded && log ? ('Loading ...') :
            log.map((lg, i) => (<p key={i}>{lg}</p>))
          }
        </Segment>

        {/* Medias */}
        <Segment className='headings'>
          Video Recordings
        </Segment>
        <Segment attached='bottom'>
          {!mediasLoaded || !dates  ?
            <Fragment>
              Loading ...
            </Fragment>
            :
            <Fragment>
              {dates && dates.length <= 0 ? (<Fragment>No Medias</Fragment>) : dates.map((dateHeadline, i) => (
                <Fragment key={i}>
                  <Responsive as={Menu}>
                    <Menu.Item as='h4' style={{marginBottom: 0}}><strong>{dateHeadline}</strong></Menu.Item>
                    <Menu.Item position='right'>
                      <Dropdown text='actions' pointing='right'>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleSelectAllMediasByDay(dateHeadline)}>
                            Select All
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleUnselectAllMediasByDay(dateHeadline)}>
                            Unselect All
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleMoveSelectedMedias(dateHeadline)}>
                            Move Selected
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleDeleteSelectedMedias(dateHeadline)}>
                            Delete Selected
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Menu.Item>
                  </Responsive>
                  <Card.Group>
                  {medias && medias[dateHeadline].map((med, j) => (
                    <Card key={j}>
                      <Label
                        as='a'
                        color={med.selected ? 'red' : 'teal'}
                        corner='right'
                        onClick={() => handleClickSelectOne(med.day, med.name)}
                      >
                        <Icon
                          name={med.selected ? 'check circle' : 'circle'}
                          style={{cursor: 'pointer'}}
                          onClick={e => {
                            e.stopPropagation()
                            handleClickSelectOne(med.day, med.name)
                          }}
                        />
                      </Label>
                      <Card.Content className='no-bottom-paddings'>
                        <Card.Header>{med.name.split('-')[0]}</Card.Header>
                        <p>{med.day}<br/>{med.hour}</p>
                      </Card.Content>
                      <Card.Content extra>
                        <Image key={i} src={med.url}/>
                      </Card.Content>
                      <Card.Content extra className='no-top-paddings'>
                        <Card.Meta>Size: {filesize(med.size)}</Card.Meta>
                        <Button floated='right' color={med.seen ? 'grey' : 'blue'} onClick={() => handlePlayVideo(med.videoUrl)}>Play</Button>
                      </Card.Content>
                    </Card>
                  ))}
                  </Card.Group>
                </Fragment>
              ))}
            </Fragment>
          }
        </Segment>

      </Segment.Group>
    </Fragment>
  )
}

export default Home
