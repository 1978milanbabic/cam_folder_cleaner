#!/usr/bin/env node

// dependencies
const nodemailer = require('nodemailer')
const moment = require('moment')
const db = require('../app/components/db')
// dotenv support
require('../app/utils/dotenv').load()

// mail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASS
  }
})
const sendMessage = params => {
  const message = {
    from: process.env.SENDER_EMAIL, // Sender address
    to: db.get('alert_email').value(),         // List of recipients
    subject: 'This is test message', // Subject line
    text: `${params} - Alert message on new detection! ` // Plain text body
  }
  transporter.sendMail(message, (err, info) => {
    if (err) {
      db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Mail transporter error: ${err}`).write()
    } else {
      db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Mail status: ${info && info.response}`).write()
    }
  })
}

// log
db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Event started!`).write()
// starting new event
let doSendMail = db.get('mail_on_event').value()
// send email on new video
if (doSendMail) {
  db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Initiating sending mail...`).write()
  try {
    sendMessage(moment().format('MMMM Do YYYY, h:mm:ss a') + ' --> ')
    db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => New mail sent.`).write()
  } catch (err) {
    db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Error sending mail: ${err}`).write()
  }
} else {
  db.stats.get('stats').push(`${moment().format('MMMM Do YYYY, h:mm:ss a')} => Sending mail dissabled by user!`).write()
}
