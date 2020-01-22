import { expect } from 'chai'
import * as sinon from 'sinon'
import * as jwt from 'jsonwebtoken'

import { AuthService } from '../apiServices/AuthService'

const getRequest = require('../http/index')

describe('getUsers', () => {
    const accessToken = {
        jti: '',
        iss: '',
        exp: Math.floor(new Date().getTime() / 1000) + 60 * 20,
        userId: '',
        iat: 0,
    }
    let getRequestStub: any

    let AUTH
    let isUserLoggedInStub: any
    beforeEach(() => {
        getRequestStub = sinon.stub(getRequest, 'getRequest')

        AUTH = new AuthService('user', 'password')
        AUTH.jwtTokens = {
            access: jwt.sign(accessToken, 'secret'),
            refresh: 'refresh',
        }

        isUserLoggedInStub = sinon.stub(AUTH, 'isUserLoggedIn')
    })

    afterEach(() => {
        getRequestStub.restore()
        isUserLoggedInStub.restore()

        delete AUTH.jwtTokens
    })

    it('is a function', () => {
        expect(AUTH.getUsers).to.be.a('function')
    })

    it('returns an object containg user object', async () => {
        const response = {
            total: 1,
            users: [
                {
                    id: '5c18ee88eba3190015f7bc02',
                    createdAt: '2018-12-18T12:56:40.000Z',
                    email: {},
                    ethAddress: '0x79b483371e87d664cd39491b5f06250165e4b184',
                    roles: ['trusted_user', 'Free'],
                    preferences: {
                        newsletter: false,
                    },
                    termsId: 'no_terms',
                },
            ],
        }

        isUserLoggedInStub.returns(true)

        getRequestStub.resolves({
            data: response,
        })

        const result = await AUTH.getUsers()
        expect(result).to.deep.equal(response)
    })

    it('should fail if there is something wrong with the request', async () => {
        isUserLoggedInStub.returns(true)

        getRequestStub.throws('400')

        try {
            await AUTH.getUsers()
            expect.fail('getUsers should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
