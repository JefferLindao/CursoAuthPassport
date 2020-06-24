const passport = require('passport')
const { BasicStrategy } = require('passport-http')
const boom = require('@hapi/boom')
const bcrypt = require('bcrypt')

const UsersService = require('../../../services/users')

passport.use(
  new BasicStrategy(async function (email, password, cb) {
    const userService = new UsersService()

    try {
      const user = await userService.getUser({ email })

      if (!user) {
        return cb(boom.unauthorized(), false)
      }
      const hash = await bcrypt.hash(user.password, 10)
      const match = await bcrypt.compare(password, hash)

      if (!match) {
        return cb(boom.unauthorized(), false)
      }
      delete user.password
      return cb(null, user)
    } catch (error) {
      return cb(error)
    }
  })
)
