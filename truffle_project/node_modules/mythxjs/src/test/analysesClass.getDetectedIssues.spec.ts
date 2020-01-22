import { expect } from 'chai'
import * as sinon from 'sinon'
import * as jwt from 'jsonwebtoken'

import { ClientService } from '../apiServices/ClientService'
import { AnalysesService } from '../apiServices/AnalysesService'
import { JwtTokensInterface } from '..'

const getRequest = require('../http/index')

describe('getDetectedIssues', () => {
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
    let getAnalysesStatusStub: any

    let ANALYSES

    beforeEach(() => {
        getRequestStub = sinon.stub(getRequest, 'getRequest')

        ANALYSES = new AnalysesService(tokens, 'MythXJS test')

        getAnalysesStatusStub = sinon.stub(ANALYSES, 'getAnalysisStatus')
    })

    afterEach(() => {
        getRequestStub.restore()
        getAnalysesStatusStub.restore()
    })

    it('is a function', () => {
        expect(ANALYSES.getDetectedIssues).to.be.a('function')
    })

    it('returns an object containing the detected issues', async () => {
        const uuid = '123-456-789'

        const response = {
            issues: [],
        }

        getAnalysesStatusStub.resolves({
            status: 'Finished',
        })

        getRequestStub.resolves({
            data: response,
        })

        const result = await ANALYSES.getDetectedIssues(uuid)
        expect(result).to.deep.equal(response)
        expect(getRequestStub.calledWith(`${ClientService.MYTHX_API_ENVIRONMENT}/analyses/123-456-789/issues`)).to.be
            .true
    })

    it('should fail if there is something wrong with the request', async () => {
        const uuid = '123-456-789'

        getAnalysesStatusStub.resolves({
            status: 'Finished',
        })

        getRequestStub.throws('400')

        try {
            await ANALYSES.getDetectedIssues(uuid)
            expect.fail('getDetectedIssues should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
