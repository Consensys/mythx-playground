import { expect } from 'chai'
import * as sinon from 'sinon'
import * as jwt from 'jsonwebtoken'

import { ClientService } from '../apiServices/ClientService'
import { AnalysesService } from '../apiServices/AnalysesService'
import { JwtTokensInterface, Group } from '..'

const getRequest = require('../http/index')

describe('getGroupById', () => {
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
        expect(ANALYSES.getGroupById).to.be.a('function')
    })

    it('should return a group given an ID', async () => {
        const groupId = '1111-2222-3333-4444'

        const response: Group = {
            id: 'string',
            name: 'string',
            createdAt: '2019-11-19T15:40:12Z',
            createdBy: 'string',
            completedAt: '2019-11-19T15:40:12Z',
            progress: 0,
            status: 'opened',
            mainSourceFiles: ['string'],
            numAnalyses: {
                total: 0,
                queued: 0,
                running: 0,
                failed: 0,
                finished: 0,
            },
            numVulnerabilities: {
                high: 0,
                medium: 0,
                low: 0,
                none: 0,
            },
        }

        getRequestStub.resolves({
            data: response,
        })

        const result = await ANALYSES.getGroupById(groupId)
        expect(result).to.deep.equal(response)
        expect(getRequestStub.calledWith(`${ClientService.MYTHX_API_ENVIRONMENT}/analysis-groups/${groupId}`)).to.be
            .true
    })

    it('should fail if there is something wrong with the request', async () => {
        const groupId = '1111-2222-3333-4444'

        getRequestStub.throws('400')

        try {
            await ANALYSES.getGroupById(groupId)
            expect.fail('gretGroupById should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
