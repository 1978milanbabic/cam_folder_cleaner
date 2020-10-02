const extensionTypeMap = {
  video: ['.avi', '.ogg', '.webm', '.mov', '.mp4'],
  image: ['.jpeg', '.jpg', '.ppm', '.webp', '.gif', '.png'],
  audio: ['.wav', '.mp3']
}

let mediaTypeName = Object.keys(extensionTypeMap)

const isMedia = ext => {
  let media = false
  mediaTypeName.forEach(medType => {
    let findMedia = extensionTypeMap[medType].filter(ex => ex === ext)
    if (findMedia.length > 0) media = true
  })
  return media
}

const mediaType = ext => {
  let foundType = ''
  mediaTypeName.forEach(medType => {
    if (extensionTypeMap[medType].filter(ex => ex === ext).length > 0) foundType = medType
  })
  return foundType
}

exports = module.exports = { extensionTypeMap, isMedia, mediaType }
