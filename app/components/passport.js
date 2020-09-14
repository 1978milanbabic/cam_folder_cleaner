// module dependencies
const passport = require('passport')
const { BasicStrategy } = require('passport-http')
const db = require('./db')

// basic strategy
passport.use(new BasicStrategy((username, password, done) => {
  let dbUser = db.get('user').value()
  let user = dbUser[username]
  if (user && user === password) {
    return done(null, { email: username })
  } else {
    return done(null, false)
  }
}))

exports = module.exports = passport
