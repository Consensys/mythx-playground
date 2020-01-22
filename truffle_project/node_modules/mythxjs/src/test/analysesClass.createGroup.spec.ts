import { expect } from 'chai'
import * as sinon from 'sinon'
import * as jwt from 'jsonwebtoken'

import { ClientService } from '../apiServices/ClientService'
import { AnalysesService } from '../apiServices/AnalysesService'
import { JwtTokensInterface } from '..'

const postRequest = require('../http/index')

describe('createGroup', () => {
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
        expect(ANALYSES.createGroup).to.be.a('function')
    })

    it('should return an object with a groupName property', async () => {
        const groupName = 'foo'

        const response = {
            groupName: 'foo',
        }

        postRequestStub.resolves({
            data: response,
        })

        const result = await ANALYSES.createGroup(groupName)
        expect(result).to.equal(response)
        expect(
            postRequestStub.calledWith(`${ClientService.MYTHX_API_ENVIRONMENT}/analysis-groups`, {
                groupName: groupName,
            }),
        ).to.be.true
    })

    it('should fail if there is something wrong with the request', async () => {
        const groupName = 'foo'

        postRequestStub.throws('400')

        try {
            await ANALYSES.createGroup(groupName)
            expect.fail('createGroup should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
