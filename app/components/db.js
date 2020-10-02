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
  user: {'user1@example.com': '1892eb34'}
}).write()

statsDB.defaults({
  stats: []
}).write()

defaultDB.stats = statsDB

exports = module.exports = defaultDB
