import { expect } from 'chai'
import * as sinon from 'sinon'
import * as jwt from 'jsonwebtoken'

import { ClientService } from '../apiServices/ClientService'
import { AnalysesService } from '../apiServices/AnalysesService'
import { JwtTokensInterface, AnalyzeOptions } from '..'

const postRequest = require('../http/index')

describe('analyze', () => {
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
        expect(ANALYSES.analyze).to.be.a('function')
    })

    it('should return an object with info about submitted analysis', async () => {
        const options: AnalyzeOptions = {
            groupId: '1111-2222-3333-4444',
            contractName: 'contractName',
            bytecode: 'bytecode',
            sourceMap: 'sourceMap',
            deployedBytecode: 'deployedBytecode',
            deployedSourceMap: 'deployedSourceMap',
            mainSource: 'mainSource',
            sources: 'sources',
        }

        const expected = {
            clientToolName: 'MythXJTest',
            noCacheLookup: false,
            data: {
                contractName: 'contractName',
                bytecode: 'bytecode',
                sourceMap: 'sourceMap',
                deployedBytecode: 'deployedBytecode',
                deployedSourceMap: 'deployedSourceMap',
                mainSource: 'mainSource',
                sources: 'sources',
            },
        }

        const response = {
            apiVersion: 'v1.4.14',
            harveyVersion: '0.0.22',
            maestroVersion: '1.2.11',
            maruVersion: '0.4.6',
            mythrilVersion: '0.20.4',
            queueTime: 10,
            runTime: 0,
            status: 'Queued',
            submittedAt: '2019-05-29T17:41:46.902Z',
            submittedBy: '123456789012345678901234',
            uuid: '1111-2222-3333-4444',
        }

        postRequestStub.resolves({
            data: response,
        })

        const result = await ANALYSES.analyze(options)

        expect(result).to.equal(response)
        expect(postRequestStub.calledWith(`${ClientService.MYTHX_API_ENVIRONMENT}/analyses`, expected)).to.be.true
    })

    it('should fail if there is something wrong with the request', async () => {
        const options: AnalyzeOptions = {
            groupId: '1111-2222-3333-4444',
            toolName: 'test',
            noCacheLookup: false,
            contractName: 'contractName',
            bytecode: 'bytecode',
            sourceMap: 'sourceMap',
            deployedBytecode: 'deployedBytecode',
            deployedSourceMap: 'deployedSourceMap',
            mainSource: 'mainSource',
            sources: 'sources',
        }

        postRequestStub.throws('400')

        try {
            await ANALYSES.analyze(options)
            expect.fail('analyze should be rejected')
        } catch (err) {
            expect(err.message).to.equal('MythxJS. Error with your request. 400')
        }
    })
})
