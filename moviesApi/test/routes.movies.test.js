const assert = require('assert')
const proxiquire = require('proxyquire')
const { moviesMock, MoviesServiceMock } = require('../utils/mocks/movies.js')
const testServer = require('../utils/testServer')

describe('routes - movies', function () {
  const route = proxiquire('../routes/movies', {
    '../services/movies': MoviesServiceMock
  })

  const request = testServer(route)

  describe('GET /movies', () => {
    it('should respond with status 200', function (done) {
      request.get('/api/movies').expect(200, done)
    })
    it('should respond with the list of movies', function (done) {
      request.get('/api/movies').end((err, res) => {
        assert.deepEqual(res.body, {
          data: moviesMock,
          message: 'movies listed'
        })
        done()
      })
    })
  })
})
