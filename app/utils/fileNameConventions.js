// module dependecies
const fs = require('fs')
const path = require('path')
const { isMedia } = require('./mediaFilesExtensions')
const mediaDir = require('../components/config')

const formatName = name => {
  return name.replace(/[^0-9a-z]/gi, '').toLowerCase()
}

const fileNameExists = fname => {
  let exists = false
  fs.readdirSync(mediaDir.mediadir).forEach(file => {
    const name = path.parse(file).name
    const ext = path.parse(file).ext
    if (isMedia(ext) && name === fname) exists = true
  })
  return exists
}

const fileNameChecker = filename => {
  if (fileNameExists(filename)){
    return fileNameChecker(filename + '1')
  } else {
    return filename
  }
}

const fileNameChanger = event => {
  const fileName = path.parse(event).name
  const fileExt = path.parse(event).ext
  if (isMedia(fileExt)) {
    // try trim non AN if not already exist
    const nonANName = formatName(fileName)
    let finalName = fileNameChecker(nonANName)
    // rename file
    fs.rename(
      path.join(mediaDir.uploaddir, fileName + fileExt),
      path.join(mediaDir.mediadir, finalName + fileExt),
      error => {
        if (error) console.log('Error: ' + error)
      }
    )
  }
}

exports = module.exports = { formatName, fileNameExists, fileNameChecker, fileNameChanger }
