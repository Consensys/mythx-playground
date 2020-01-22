import { expect } from 'chai'
import * as sinon from 'sinon'

import { AuthService } from '../apiServices/AuthService'

const getRequest = require('../http/index')

describe('getVersion', () => {
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
        expect(AUTH.getVersion).to.be.a('function')
    })

    it('returns an  object', async () => {
        const value = {
            api: 'v1.2.5',
            hash: 'c0d8ccbf9ba2623cc147da2860f20093',
            harvey: 'v0.1.0',
            maestro: '1.1.4',
            maru: '0.1.0',
            mythril: 'v1.2.3',
        }

        getRequestStub.resolves({
            data: value,
        })

        const result = await AUTH.getVersion()
        expect(result).to.deep.equal(value)
    })

    it('should fail if there is something wrong with the request', async () => {
        getRequestStub.throws('400')

        try {
            await AUTH.getVersion()
            expect.fail('getVersion should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
