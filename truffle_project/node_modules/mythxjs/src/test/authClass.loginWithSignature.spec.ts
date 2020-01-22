import { expect } from 'chai'
import * as sinon from 'sinon'

import { AuthService } from '../apiServices/AuthService'
import { JwtTokensInterface } from '..'

const postRequest = require('../http/index')

describe('loginWithSignature', () => {
    const tokens: JwtTokensInterface = {
        access: 'access',
        refresh: 'refresh',
    }

    let postRequestStub: any

    let AUTH
    beforeEach(() => {
        postRequestStub = sinon.stub(postRequest, 'postRequest')

        AUTH = new AuthService('user', 'password')
    })

    afterEach(() => {
        postRequestStub.restore()

        delete AUTH.jwtTokens
    })

    it('is a function', () => {
        expect(AUTH.loginWithSignature).to.be.a('function')
    })

    it('should return and set access and refresh tokens', async () => {
        postRequestStub.resolves({
            data: { jwtTokens: tokens },
        })

        const result = await AUTH.loginWithSignature()

        expect(result).to.equal(tokens)
    })

    it('should fail if there is something wrong with the request', async () => {
        postRequestStub.throws('400')

        try {
            await AUTH.loginWithSignature()
            expect.fail('loginWithSignature should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
