#!/usr/bin/env node

// dependencies
const nodemailer = require('nodemailer')

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
      console.log(err)
    } else {
      console.log('message sent')
    }
  })
}

try {
  sendMessage(moment().format('MMMM Do YYYY, h:mm:ss a') + ' --> ')
} catch (err) {
  console.log(err)
}
