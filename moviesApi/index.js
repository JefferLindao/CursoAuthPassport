const express = require('express')
const helmet = require('helmet')
const app = express()
const { config } = require('./config/index')
const moviesApi = require('./routes/movies.js')
const userMovieApi = require('./routes/userMovies.js')
const authApi = require('./routes/auth.js')

const { errorHandler, logErrors, wrapError } = require('./utils/middleware/errorHandlers')

const notFoundHandler = require('./utils/middleware/notFoundHandler')

// body parser
app.use(express.json())
app.use(helmet())
app.use(express.urlencoded({ extended: true }))

// routes
authApi(app)
moviesApi(app)
userMovieApi(app)

// Catch 404
app.use(notFoundHandler)

// Errors middleware
app.use(logErrors)
app.use(wrapError)
app.use(errorHandler)

app.listen(config.port, function () {
  console.log(`Listening http://localhost:${config.port}`)
})
