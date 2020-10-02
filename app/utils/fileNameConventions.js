// module dependecies
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { isMedia, mediaType } = require('./mediaFilesExtensions')
const mediaDir = require('../components/config')

const formatName = (name, ext) => {
  let newName = name.split('-')[0] + '-' + moment().format('DD_MM_YYYY')
  if (mediaType(ext) === 'image') newName = newName + '-01'
  return newName
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
    return fileNameChecker('1' + filename)
  } else {
    return filename
  }
}

const fileNameChanger = event => {
  const fileName = path.parse(event).name
  const fileExt = path.parse(event).ext
  if (isMedia(fileExt)) {
    // try trim non AN if not already exist
    const nonANName = formatName(fileName, fileExt)
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
