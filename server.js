// module dependencies
const path = require('path')
const http = require('http')
const helmet = require('helmet')
const morgan = require('morgan')
const express = require('express')
const proxy = require('http-proxy-middleware')

// initialize express
const app = express()

// initialize http server
const server = http.createServer(app)

// request logger
app.use(morgan('tiny'))

// secure express
app.use(helmet())

// development mode
let isDev = true
if (process.env.NODE_ENV === 'production') isDev = false

// env specific
let reactProxy
if (isDev) {
  // react dev server proxy
  reactProxy = proxy({
    target: `http://localhost:${process.env.REACT_PORT || 1234}`,
    changeOrigin: true,
    ws: true
  })
} else {
  // serve static files from react build folder
  app.use(express.static(path.join(__dirname, 'build')))
}

// mount routes - admin (password-protected)
app.use('/', require('./app/routes'))

// mount api (password-protected) routes
app.use('/api', require('./app/routes/api'))

// mount react app route
let reactIndex = path.join(__dirname, 'build', 'index.html')
app.use((req, res, next) => {
  if (req.method.toLowerCase() === 'get' && isDev) {
    return reactProxy(req, res, next)
  } else if (req.method.toLowerCase() === 'get' && isDev === false) {
    return res.sendFile(reactIndex)
  } else {
    // ignore non-get requests
    return next()
  }
})

// export http server
exports = module.exports = server
