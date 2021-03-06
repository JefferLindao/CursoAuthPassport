const express = require('express')
const passport = require('passport')
const boom = require('@hapi/boom')
const jwt = require('jsonwebtoken')
const ApiKeysService = require('../services/apiKeys')
const UsersService = require('../services/users')
const validationHandler = require('../utils/middleware/validatiionHandler')

const { createUserSchema, createProviderUserSchema } = require('../utils/schemas/users')

const { config } = require('../config')

// Basic strategy
require('../utils/auth/strategies/basic')
function authApi(app) {
  const router = express.Router()
  app.use('/api/auth', router)

  const apiKeysService = new ApiKeysService()
  const usersService = new UsersService()

  router.post('/sign-in', async function (req, res, next) {
    const { apikeyToken } = req.body
    if (!apikeyToken) {
      next(boom.unauthorized('apikeytoken is required'))
    }

    passport.authenticate('basic', function (error, user) {
      try {
        if (error || !user) {
          next(boom.unauthorized())
        }

        req.login(user, { session: false }, async function (error) {
          if (error) {
            next(error)
          }
          const apiKey = await apiKeysService.getApiKey({ token: apikeyToken })
          if (!apiKey) {
            next(boom.unauthorized())
          }
          const { _id: id, name, email } = user
          const payload = {
            sub: id,
            name,
            email,
            scopes: apiKey.scopes
          }
          const token = jwt.sign(payload, config.authJwtSecret, {
            expiresIn: '15m'
          })

          return res.status(200).json({ token, user: { id, name, email } })
        })
      } catch (error) {
        next(error)
      }
    })(req, res, next)
  })

  router.post('/sign-up', validationHandler(createUserSchema), async function (req, res, next) {
    const { body: user } = req
    try {
      const createdUserId = await usersService.createUser({ user })
      res.status(201).json({
        data: createdUserId,
        message: 'user created'
      })
    } catch (error) {
      next(error)
    }
  })

  router.post('/sign-provider', validationHandler(createProviderUserSchema),
    async function (req, res, next) {
      const { body } = req
      const { apikeyToken, ...user } = body

      if (!apikeyToken) {
        next(boom.unauthorized('apikeyToken is required'))
      }

      try {
        const queriedUser = await usersService.getOrCreateUser({ user })
        const apiKey = await apiKeysService.getApiKey({ token: apikeyToken })

        if (!apiKey) {
          next(boom.unauthorized())
        }
        const { _id: id, name, email } = queriedUser

        const payload = {
          sub: id,
          name,
          email,
          scopes: apiKey.scopes
        }
        const token = jwt.sign(payload, config.authJwtSecret, {
          expiresIn: '15m'
        })

        return res.status(200).json({ token, user: { id, name, email } })
      } catch (error) {
        next(error)
      }
    })
}

module.exports = authApi
