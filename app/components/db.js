// module dependencies
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const config = require('./config')

const defaultAdapter = new FileSync(config.db)
const defaultDB = low(defaultAdapter)

const statsAdapter = new FileSync(config.dbstats)
const statsDB = low(statsAdapter)

// Set some defaults (required if your JSON file is empty)
defaultDB.defaults({
  user: {'user1@example.com': '1892eb34'},
  // zones: [
  //   // autocreate 3 zones
  //   {
  //     id: "B9IciLri",
  //     name: "front",
  //     color: "#ff0000",
  //     coords: [],
  //     medias: {
  //       active: {
  //         media: null,
  //         duration: 5000
  //       },
  //       inactive: {
  //         media: null,
  //         duration: 5000
  //       }
  //     },
  //     order: 0
  //   },
  //   {
  //     id: "uRVIufsq",
  //     name: "medium",
  //     color: "#00ff00",
  //     coords: [],
  //     medias: {
  //       active: {
  //         media: null,
  //         duration: 5000
  //       },
  //       inactive: {
  //         media: null,
  //         duration: 5000
  //       }
  //     },
  //     order: 1
  //   },
  //   {
  //     id: "tNvWBva0",
  //     name: "rear",
  //     color: "#0000ff",
  //     coords: [],
  //     medias: {
  //       active: {
  //         media: null,
  //         duration: 5000
  //       },
  //       inactive: {
  //         media: null,
  //         duration: 5000
  //       }
  //     },
  //     order: 2
  //   }
  // ],
  // config: {
  //   screen: {
  //     total: 3,
  //     gap: 0 // in cm
  //   },
  //   medias: {
  //     inactive: null,
  //     active: null
  //   },
  //   camera: {
  //     fov: 65,
  //     ratio: 1.7778,
  //     height: 5000,
  //     minDetectionSize: 5, // in %
  //     maxDetectionSize: 10, // in %
  //     consecutiveDetections: 30 // in frames
  //   },
  //   game: {
  //     motionTimeout: 60 * 1000, // in miliseconds
  //     actionTimeout: 20* 1000 // in miliseconds
  //   }
  // }
}).write()

statsDB.defaults({
  stats: []
}).write()

defaultDB.stats = statsDB

exports = module.exports = defaultDB
