import { expect } from 'chai'
import * as sinon from 'sinon'
import * as jwt from 'jsonwebtoken'

import { ClientService } from '../apiServices/ClientService'
import { AnalysesService } from '../apiServices/AnalysesService'
import { JwtTokensInterface, AnalysisGroups } from '..'

const getRequest = require('../http/index')

describe('listGroups', () => {
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
        expect(ANALYSES.listGroups).to.be.a('function')
    })

    it('should return a request a list of Groups', async () => {
        const query = 'offset=5'

        const response: AnalysisGroups = {
            groups: [],
            total: 3,
        }

        getRequestStub.resolves({
            data: response,
        })

        const result = await ANALYSES.listGroups(query)
        expect(result).to.deep.equal(response)
        expect(getRequestStub.calledWith(`${ClientService.MYTHX_API_ENVIRONMENT}/analysis-groups?offset=5`)).to.be.true
    })

    it('should fail if there is something wrong with the request', async () => {
        const query = 'offset=5'

        getRequestStub.throws('400')

        try {
            await ANALYSES.listGroups(query)
            expect.fail('listGroups should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
