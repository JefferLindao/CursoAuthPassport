const express = require('express')
const MoviesService = require('../services/movies')
const { movieIdSchema, createMovieShema, updateMovieSchema } = require('../utils/schemas/movies')
const validationHandler = require('../utils/middleware/validatiionHandler')
const scopeValidationHandler = require('../utils/middleware/scopeValidationHander')

const cacheResponse = require('../utils/cacheResponse')
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require('../utils/time')
const passport = require('passport')

// JWT strategy
require('../utils/auth/strategies/jwt')

function moviesApi(app) {
  const router = express.Router()

  /**
   * Lista de videos platziMovies
   * 
   * @param ../utils/mocks/movies moviesMock
   * @returns [data, message]
   */
  app.use('/api/movies', router)
  const moviesService = new MoviesService
  router.get('/',
    passport.authenticate('jwt', { session: false }),
    scopeValidationHandler(['read:movies']),
    async function (req, res, next) {
      cacheResponse(res, FIVE_MINUTES_IN_SECONDS)
      const { tags } = req.query
      try {
        const movies = await moviesService.getMovies({ tags })

        res.status(200).json({
          data: movies,
          message: 'movies listed'
        })
      } catch (error) {
        next(error)
      }
    }
  )

  /**
   * Muestra un video en especificado
   * 
   * @param int movieId
   * @return [data, message]
   */
  router.get('/:movieId',
    passport.authenticate('jwt', { session: false }),
    scopeValidationHandler(['read:movies']),
    validationHandler({ movieId: movieIdSchema }, 'params'),
    async function (req, res, next) {
      cacheResponse(res, SIXTY_MINUTES_IN_SECONDS)
      const { movieId } = req.params
      try {
        const movies = await moviesService.getMovie({ movieId })
        res.status(200).json({
          data: movies,
          message: 'movies retrieved'
        })
      } catch (error) {
        next(error)
      }
    }
  )

  /**
   * Crear un nuevo video para PlatziMovie
   * 
   * @param int movieId
   * @return [data, message]
   */
  router.post('/',
    passport.authenticate('jwt', { session: false }),
    scopeValidationHandler(['create:movies']),
    validationHandler(createMovieShema),
    async function (req, res, next) {
      const { body: movie } = req
      try {
        const createMovieId = await moviesService.createMovies({ movie })
        res.status(201).json({
          data: createMovieId,
          message: 'movie created'
        })
      } catch (error) {
        next(error)
      }
    }
  )

  /**
   * Actualiza los datos de un video de PlatziMovie
   * 
   * @param int movieId
   * @return [data, message]
   */
  router.put('/:movieId',
    passport.authenticate('jwt', { session: false }),
    scopeValidationHandler(['update:movies']),
    validationHandler({ movieId: movieIdSchema }, 'params'),
    validationHandler(updateMovieSchema),
    async function (req, res, next) {
      const { movieId } = req.params
      const { body: movie } = req
      try {
        const updateMovieId = await moviesService.updateMovies({
          movieId,
          movie
        })
        res.status(200).json({
          data: updateMovieId,
          message: 'movie updated'
        })
      } catch (error) {
        next(error)
      }
    }
  )

  /**
   * Elimina un video en especifico de PlatziMovie
   * 
   * @param int movieId
   * @return [data, message]
   */
  router.delete('/:movieId',
    passport.authenticate('jwt', { session: false }),
    scopeValidationHandler(['delete:movies']),
    validationHandler({ movieId: movieIdSchema }, 'params'),
    async function (req, res, next) {
      const { movieId } = req.params
      try {
        const deleteMovieId = await moviesService.deleteMovies({ movieId })
        res.status(200).json({
          data: deleteMovieId,
          message: 'movie deleted'
        })
      } catch (error) {
        next(error)
      }
    }
  )
}

module.exports = moviesApi
