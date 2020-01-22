import { expect } from 'chai'
import * as sinon from 'sinon'

import { AuthService } from '../apiServices/AuthService'
import { JwtTokensInterface } from '..'

const loginUser = require('../auth/loginUser')
const errorHandler = require('../util/errorHandler')

describe('loginUser', () => {
    const tokens: JwtTokensInterface = {
        access: 'access',
        refresh: 'refresh',
    }

    let loginUserStub: any
    let errorHandlerStub: any
    let setCredentialsStub: any
    let AUTH
    beforeEach(() => {
        loginUserStub = sinon.stub(loginUser, 'loginUser')
        errorHandlerStub = sinon.stub(errorHandler, 'errorHandler')

        AUTH = new AuthService('user', 'password')
        setCredentialsStub = sinon.stub(AUTH, 'setCredentials')
    })

    afterEach(() => {
        loginUserStub.restore()
        errorHandlerStub.restore()
        setCredentialsStub.restore()
    })

    it('is a function', () => {
        expect(AUTH.login).to.be.a('function')
    })

    it('should return and set access and refresh tokens', async () => {
        loginUserStub.resolves({
            data: { jwtTokens: tokens },
        })

        const result = await AUTH.login()

        expect(loginUserStub.calledWith('user', 'password', sinon.match.string)).to.be.true
        expect(setCredentialsStub.calledWith(tokens)).to.be.true
        expect(result).to.equal(tokens)
    })

    it('should fail with error', async () => {
        const errMsg = 'MythxJS. Error with your request.'

        loginUserStub.throws(errMsg)
        errorHandlerStub.throws()

        try {
            await AUTH.login()
            expect.fail('login should be rejected')
        } catch (err) {
            expect(errorHandlerStub.getCall(0).args[0].name).to.equal(errMsg)
        }
    })
})
