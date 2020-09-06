const express = require('express')

const UserMoviesService = require('../services/userMovies')
const validationHandler = require('../utils/middleware/validatiionHandler')
const scopeValidationHandler = require('../utils/middleware/scopeValidationHander')

const { movieIdSchema } = require('../utils/schemas/movies')
const { userIdSchema } = require('../utils/schemas/users')
const { createUserMovieSchema } = require('../utils/schemas/userMovies')
const passport = require('passport')

// JWT strategy
require('../utils/auth/strategies/jwt')

function userMoviesApi(app) {
  const route = express.Router()
  app.use('/api/user-movies', route)

  const userMoviesService = new UserMoviesService()

  route.get('/',
    passport.authenticate('jwt', { session: false }),
    scopeValidationHandler(['read:user-movies']),
    validationHandler({ userId: userIdSchema }, 'query'),
    async function (req, res, next) {
      const { userId } = req.query
      try {
        const userMovies = await userMoviesService.getUserMovies({ userId })

        res.status(200).json({
          data: userMovies,
          message: 'user movie listed'
        })
      } catch (error) {
        next(error)
      }
    }
  )

  route.post('/',
    passport.authenticate('jwt', { session: false }),
    scopeValidationHandler(['create:user-movies']),
    validationHandler(createUserMovieSchema),
    async function (req, res, next) {
      const { body: userMovie } = req
      try {
        const createUserMovieId = await userMoviesService.createUserMovie({
          userMovie
        })

        res.status(201).json({
          data: createUserMovieId,
          message: 'user movie created'
        })
      } catch (error) {
        next(error)
      }
    }
  )

  route.delete('/:userMovieId',
    passport.authenticate('jwt', { session: false }),
    scopeValidationHandler(['delete:user-movies']),
    validationHandler({ userMovieId: movieIdSchema }, 'params'),
    async function (req, res, next) {
      const { userMovieId } = req.params
      try {
        const deleteUserMovieId = await userMoviesService.deleteUserMovie({
          userMovieId
        })

        res.status(200).json({
          data: deleteUserMovieId,
          message: 'user movie deleted'
        })
      } catch (error) {
        next(error)
      }
    }
  )
}

module.exports = userMoviesApi
