const extensionTypeMap = {
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.webp': 'image',
  '.gif': 'image',
  '.mp4': 'video',
  '.mov': 'video',
  '.webm': 'video',
  '.ogg': 'video',
  '.mp3': 'audio',
  '.wav': 'audio',
  '.avi': 'video'
}

const isMedia = ext => {
  return !!extensionTypeMap[ext]
}

exports = module.exports = { extensionTypeMap, isMedia }
