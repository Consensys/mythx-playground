const util = require('../../lib/util')
require('chai').should()

describe('util', () => {
  describe('#joinUrl', () => {
    it('should build correct url when base does not have trailing slash', () => {
      util.joinUrl('http://localhost:3100', 'path/to/join').should.be.equal('http://localhost:3100/path/to/join')
    })
    it('should build correct url when base have trailing slash', () => {
      util.joinUrl('http://localhost:3100/', 'path/to/join').should.be.equal('http://localhost:3100/path/to/join')
    })
    it('should build correct url when base does not have trailing slash and path starts with a slash', () => {
      util.joinUrl('http://localhost:3100', '/path/to/join').should.be.equal('http://localhost:3100/path/to/join')
    })
    it('should build correct url when base and path both have trailing slash', () => {
      util.joinUrl('http://localhost:3100/', '/path/to/join').should.be.equal('http://localhost:3100/path/to/join')
    })
  })
})
