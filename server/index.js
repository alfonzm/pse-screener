import express from 'express'
import mongoose from 'mongoose'
import { Nuxt, Builder } from 'nuxt'

// Setup env

import api from './api'
import loader from './loader'

const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

// Set port
app.set('port', port)

// Import API Routes
app.use('/loader', loader)
app.use('/api', api)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

// Init Nuxt.js
const nuxt = new Nuxt(config)

// Build only in dev mode
if (config.dev) {
  const builder = new Builder(nuxt)
  builder.build()
}

// Give nuxt middleware to express
app.use(nuxt.render)

// Mongoose
mongoose.connect('mongodb://localhost/stocks', (err) => {
	if(err) throw err

	console.log('Successfully connected to mongo db')
})

// Listen the server
app.listen(port, host)
console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console