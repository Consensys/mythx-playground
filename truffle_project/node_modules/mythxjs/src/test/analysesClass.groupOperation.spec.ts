import { expect } from 'chai'
import * as sinon from 'sinon'
import * as jwt from 'jsonwebtoken'

import { ClientService } from '../apiServices/ClientService'
import { AnalysesService } from '../apiServices/AnalysesService'
import { JwtTokensInterface, Group } from '..'

const postRequest = require('../http/index')

describe('groupOperation', () => {
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

    let postRequestStub: any

    let ANALYSES

    beforeEach(() => {
        postRequestStub = sinon.stub(postRequest, 'postRequest')

        ANALYSES = new AnalysesService(tokens, 'MythXJTest')
    })

    afterEach(() => {
        postRequestStub.restore()
    })

    it('is a function', () => {
        expect(ANALYSES.groupOperation).to.be.a('function')
    })

    it('should return an object with a group info if request worked', async () => {
        const groupId = '1111-2222-3333-4444'
        const operationType = 'seal_group'

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

        postRequestStub.resolves({
            data: response,
        })

        const result = await ANALYSES.groupOperation(groupId, operationType)
        expect(result).to.equal(response)
        expect(
            postRequestStub.calledWith(`${ClientService.MYTHX_API_ENVIRONMENT}/analysis-groups/${groupId}`, {
                type: operationType,
            }),
        ).to.be.true
    })

    it('should fail if there is something wrong with the request', async () => {
        const groupId = '1111-2222-3333-4444'
        const operationType = 'seal_group'

        postRequestStub.throws('400')

        try {
            await ANALYSES.groupOperation(groupId, operationType)
            expect.fail('groupOperation should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
