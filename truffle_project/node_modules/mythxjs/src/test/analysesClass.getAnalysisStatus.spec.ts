import { expect } from 'chai'
import * as sinon from 'sinon'
import * as jwt from 'jsonwebtoken'

import { ClientService } from '../apiServices/ClientService'
import { AnalysesService } from '../apiServices/AnalysesService'
import { JwtTokensInterface } from '..'

const getRequest = require('../http/index')

describe('getAnalysisStatus', () => {
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

        ANALYSES = new AnalysesService(tokens, 'MythXJSTest')
    })

    afterEach(() => {
        getRequestStub.restore()
    })

    it('is a function', () => {
        expect(ANALYSES.getAnalysisStatus).to.be.a('function')
    })

    it('returns an object containing the analyis status', async () => {
        const uuid = '123-456-789'

        const value = {
            apiVersion: 'v1.4.14-30-g66a01cd',
            harveyVersion: '0.0.21',
            maestroVersion: '1.2.10-12-gea51d0b',
            maruVersion: '0.4.6',
            mythrilVersion: '0.20.4',
            queueTime: 88,
            runTime: 5358,
            status: 'Finished',
            submittedAt: '2019-05-10T15:25:44.637Z',
            submittedBy: '123456789012345678901234',
            uuid: '4ac074eb-fe26-4dc9-bb0c-061da1f00862',
        }

        getRequestStub.resolves({
            data: value,
        })

        const result = await ANALYSES.getAnalysisStatus(uuid)
        expect(result).to.deep.equal(value)
        expect(getRequestStub.calledWith(`${ClientService.MYTHX_API_ENVIRONMENT}/analyses/123-456-789`)).to.be.true
    })

    it('should fail if there is something wrong with the request', async () => {
        const uuid = '123-456-789'

        getRequestStub.throws('400')

        try {
            await ANALYSES.getAnalysisStatus(uuid)
            expect.fail('getAnalysisStatus should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
