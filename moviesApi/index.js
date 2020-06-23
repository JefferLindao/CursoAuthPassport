const express = require('express')
const app = express()
const { config } = require('./config/index')
const moviesApi = require('./routes/movies.js')

const { errorHandler, logErrors, wrapError } = require('./utils/middleware/errorHandlers')

const notFoundHandler = require('./utils/middleware/notFoundHandler')

// body parser
app.use(express.json())

// routes
moviesApi(app)

// Catch 404
app.use(notFoundHandler)

// Errors middleware
app.use(logErrors)
app.use(wrapError)
app.use(errorHandler)

app.listen(config.port, function () {
  console.log(`Listening http://localhost:${config.port}`)
})
