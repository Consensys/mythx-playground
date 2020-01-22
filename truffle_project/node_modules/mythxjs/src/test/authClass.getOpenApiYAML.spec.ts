import { expect } from 'chai'
import * as sinon from 'sinon'

import { ClientService } from '../apiServices/ClientService'
import { AuthService } from '../apiServices/AuthService'

const getRequest = require('../http/index')

describe('getOpenApiYAML', () => {
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
        expect(AUTH.getOpenApiYAML).to.be.a('function')
    })

    it('returns an  object', async () => {
        const value = {
            yaml: 'yaml',
        }

        getRequestStub.resolves({
            data: value,
        })

        const result = await AUTH.getOpenApiYAML()
        expect(result).to.deep.equal(value)
        expect(getRequestStub.calledWith(`${ClientService.MYTHX_API_ENVIRONMENT}/openapi.yaml`)).to.be.true
    })

    it('should fail if there is something wrong with the request', async () => {
        getRequestStub.throws('400')

        try {
            await AUTH.getOpenApiYAML()
            expect.fail('openApiYAML should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
