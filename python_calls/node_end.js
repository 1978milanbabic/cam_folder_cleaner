#!/usr/bin/env node

// dependencies
const axios = require('axios')
const base64 = require('base-64')
const { response } = require('express')
const db = require('../app/components/db')

// get un:pass
const user = db.get('user').value()
const un = Object.keys(user)[0]
const unPass = un + ':' + user[un]

// request
const hash = base64.encode(unPass)
const Basic = 'Basic ' + hash
axios.get('http://localhost:1337/api/motion/end', {
  headers: {'Authorization': Basic}
}).then(response => {
  console.log(response.data)
  console.log(response.headers['Authorization'])
}).catch(err => console.log(err))
