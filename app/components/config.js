// module dependencies
const os = require('os')
const path = require('path')
const mkdirp = require('mkdirp')

// set data directories
let DATADIR = path.join(os.homedir(), '.local', 'share', 'orahsoft', 'cam-folder-cleaner')
let motionmediadir = '/var/lib/motion/'
let motionlogdir = '/var/log/motion/'
if (process.platform === 'win32') {
  DATADIR = path.join(os.homedir(), 'AppData', 'Roaming', 'Orahsoft', 'Cam-Folder-Cleaner')
}

if (process.env.NODE_ENV === 'test') DATADIR = path.join(os.tmpdir(), 'test-camcleaner')

// initialize configuration object
const config = {
  // directory configuration
  motionmediadir,
  motionlogdir,
  datadir: DATADIR,
  mediadir: path.join(DATADIR, 'media'),
  uploaddir: path.join(DATADIR, 'upload'),
  // db paths
  dbdir: path.join(DATADIR, 'db'),
  db: path.join(DATADIR, 'db', 'db.json'),
  dbstats: path.join(DATADIR, 'db', 'db.stats.json')
}

// ensure directories
mkdirp.sync(config.datadir)
mkdirp.sync(config.mediadir)
mkdirp.sync(config.uploaddir)
mkdirp.sync(config.dbdir)

console.log('data directory %s', config.datadir)

exports = module.exports = config
