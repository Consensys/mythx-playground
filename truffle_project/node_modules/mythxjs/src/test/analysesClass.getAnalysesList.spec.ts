import { expect } from 'chai'
import * as sinon from 'sinon'
import * as jwt from 'jsonwebtoken'

import { ClientService } from '../apiServices/ClientService'
import { AnalysesService } from '../apiServices/AnalysesService'
import { JwtTokensInterface } from '..'

const getRequest = require('../http/index')

describe('getAnalysesList', () => {
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

        ANALYSES = new AnalysesService(tokens, 'MythxJTest')
    })

    afterEach(() => {
        getRequestStub.restore()
    })

    it('is a function', () => {
        expect(ANALYSES.getAnalysesList).to.be.a('function')
    })

    it('should return a list of analysis', async () => {
        const response = {
            total: 3,
            analyses: [],
        }

        getRequestStub.resolves({
            data: response,
        })

        const result = await ANALYSES.getAnalysesList()
        expect(result).to.deep.equal(response)
        expect(getRequestStub.calledWith(`${ClientService.MYTHX_API_ENVIRONMENT}/analyses`)).to.be.true
    })

    it('should fail if there is something wrong with the request', async () => {
        getRequestStub.throws('400')

        try {
            await ANALYSES.getAnalysesList()
            expect.fail('getAnalysesList should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
