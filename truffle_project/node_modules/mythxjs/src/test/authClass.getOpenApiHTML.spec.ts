import { expect } from 'chai'
import * as sinon from 'sinon'

import { ClientService } from '../apiServices/ClientService'
import { AuthService } from '../apiServices/AuthService'

const getRequest = require('../http/index')

describe('getOpenApiHTML', () => {
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
        expect(AUTH.getOpenApiHTML).to.be.a('function')
    })

    it('returns an  object', async () => {
        const value = {
            html: 'html',
        }

        getRequestStub.resolves({
            data: value,
        })

        const result = await AUTH.getOpenApiHTML()
        expect(result).to.deep.equal(value)
        expect(getRequestStub.calledWith(`${ClientService.MYTHX_API_ENVIRONMENT}/openapi`)).to.be.true
    })

    it('should fail if there is something wrong with the request', async () => {
        getRequestStub.throws('400')

        try {
            await AUTH.getOpenApiHTML()
            expect.fail('openApiHTML should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
