import { expect } from 'chai'
import * as sinon from 'sinon'
import * as jwt from 'jsonwebtoken'

import { ClientService } from '../apiServices/ClientService'
import { AnalysesService } from '../apiServices/AnalysesService'
import { JwtTokensInterface } from '..'

const getRequest = require('../http/index')

describe('getPdf', () => {
    const accessToken = {
        jti: '',
        iss: '',
        exp: Math.floor(new Date().getTime() / 1000) + 60 * 20,
        userId: '',
        iat: 0,
    }
    const tokens: JwtTokensInterface = {
        access: jwt.sign(accessToken, 'secret'),
        refresh: 'refresh',
    }

    let getRequestStub: any

    let ANALYSES

    beforeEach(() => {
        getRequestStub = sinon.stub(getRequest, 'getRequest')

        ANALYSES = new AnalysesService(tokens, 'MythXJS test')
    })

    afterEach(() => {
        getRequestStub.restore()
    })

    it('is a function', () => {
        expect(ANALYSES.getPdf).to.be.a('function')
    })

    it('should return a request with a blob of pdf', async () => {
        const uuid = '1111-2222-3333-4444'

        const response = [
            {
                foo: 'foo',
            },
        ]

        getRequestStub.resolves({
            data: response,
        })

        const result = await ANALYSES.getPdf(uuid)
        expect(result).to.deep.equal(response)
        expect(
            getRequestStub.calledWith(`${ClientService.MYTHX_API_ENVIRONMENT}/analyses/1111-2222-3333-4444/pdf-report`),
        ).to.be.true
    })

    it('should fail if there is something wrong with the request', async () => {
        const uuid = '123-456-789'

        getRequestStub.throws('400')

        try {
            await ANALYSES.getPdf(uuid)
            expect.fail('getPdf should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
