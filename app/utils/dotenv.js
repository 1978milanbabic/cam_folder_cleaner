// module dependencies
const path = require('path')
const dotenv = require('dotenv')

exports.load = function () {
  // get node env
  const env = process.env.NODE_ENV || 'development'

  // project root
  let projectRoot = path.join(__dirname, '..', '..')
  dotenv.config({ path: path.join(projectRoot, `.env`) })
  dotenv.config({ path: path.join(projectRoot, `.env.${env}`) })
  dotenv.config({ path: path.join(projectRoot, `.env.${env}.local`) })

  // pm2 deployments
  let shared = path.join(__dirname, '..', '..', '..', 'shared')
  dotenv.config({ path: path.join(shared, `.env`) })
  dotenv.config({ path: path.join(shared, `.env.${env}`) })
  dotenv.config({ path: path.join(shared, `.env.${env}.local`) })
}
