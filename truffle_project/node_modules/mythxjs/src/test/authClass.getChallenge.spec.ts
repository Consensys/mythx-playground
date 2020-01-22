import { expect } from 'chai'
import * as sinon from 'sinon'

import { AuthService } from '../apiServices/AuthService'

const getRequest = require('../http/index')

describe('getChallenge', () => {
    let getRequestStub: any

    let AUTH
    beforeEach(() => {
        getRequestStub = sinon.stub(getRequest, 'getRequest')

        AUTH = new AuthService('user', 'password')
    })

    afterEach(() => {
        getRequestStub.restore()
    })

    it('is a function', () => {
        expect(AUTH.getChallenge).to.be.a('function')
    })

    it('returns a object', async () => {
        const value = {
            domain: { name: 'MythX API Platform' },
            message: { value: 'message' },
            primaryType: 'Challenge',
            types: {},
        }

        getRequestStub.resolves({ data: value })

        const result = await AUTH.getChallenge()
        console.error(result)
        expect(result).to.deep.equal(value)
    })

    it('should fail if there is something wrong with the request', async () => {
        getRequestStub.throws('400')

        try {
            await AUTH.getChallenge()
            expect.fail('getChallenge should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
