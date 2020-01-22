import { ClientService } from './ClientService'

import { postRequest, getRequest } from '../http'

import { errorHandler } from '../util/errorHandler'
import { getHeaders } from '../util/getHeaders'
import {
    generateBytecodeRequest,
    generateSourceCodeRequest,
    generateAnalysisRequest,
} from '../util/generateContractsRequests'

import { isTokenValid } from '../util/validateToken'

import { JwtTokensInterface, AnalyzeOptions, AnalysisGroups, Group } from '..'

import { AnalysisList, AnalysisSubmission, DetectedIssues } from '../types'

export class AnalysesService {
    private API_URL: string = ClientService.MYTHX_API_ENVIRONMENT
    private toolName: string

    constructor(jwtTokens: JwtTokensInterface, toolName: string = 'MythXJS') {
        if (isTokenValid(jwtTokens.access)) {
            ClientService.jwtTokens = jwtTokens as JwtTokensInterface
        } else {
            throw new Error('Access token has expired or is invalid! Please login again.')
        }
        this.toolName = toolName
    }

    public async getAnalysesList(): Promise<AnalysisList> {
        try {
            const { headers, tokens } = await getHeaders(ClientService.jwtTokens)
            this.setCredentials(tokens)

            const result = await getRequest(`${this.API_URL}/analyses`, headers)
            const analysisList: AnalysisList = result.data

            return analysisList
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    public async getAnalysisStatus(uuid: string): Promise<AnalysisSubmission> {
        try {
            const { headers, tokens } = await getHeaders(ClientService.jwtTokens)
            this.setCredentials(tokens)

            const result = await getRequest(`${this.API_URL}/analyses/${uuid}`, headers)
            const analysisRes: AnalysisSubmission = result.data

            return analysisRes
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    public async getDetectedIssues(uuid: string): Promise<DetectedIssues> {
        try {
            const { headers, tokens } = await getHeaders(ClientService.jwtTokens)
            this.setCredentials(tokens)

            const getStatus = await this.getAnalysisStatus(uuid)
            if (getStatus.status === 'Queued' || getStatus.status === 'In progress') {
                await new Promise(resolve => {
                    const timer = setInterval(async () => {
                        const analysisReq = await this.getAnalysisStatus(uuid)
                        if (analysisReq.status === 'Finished' || analysisReq.status === 'Error') {
                            clearInterval(timer)
                            resolve('done')
                        }
                    }, 5000)
                })
            }

            const result = await getRequest(`${this.API_URL}/analyses/${uuid}/issues`, headers)
            const detectedIssues: DetectedIssues = result.data

            return detectedIssues
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    public async submitBytecode(bytecode: string): Promise<AnalysisSubmission> {
        try {
            const { headers, tokens } = await getHeaders(ClientService.jwtTokens)
            this.setCredentials(tokens)

            const request = generateBytecodeRequest(bytecode, this.toolName)

            const result = await postRequest(`${this.API_URL}/analyses`, request, headers)
            const analysisRes: AnalysisSubmission = result.data

            return analysisRes
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    public async submitSourceCode(sourceCode: string, contractName: string): Promise<AnalysisSubmission> {
        try {
            const { headers, tokens } = await getHeaders(ClientService.jwtTokens)
            this.setCredentials(tokens)

            const request = generateSourceCodeRequest(sourceCode, contractName, this.toolName)

            const result = await postRequest(`${this.API_URL}/analyses`, request, headers)
            const analysisRes: AnalysisSubmission = result.data

            return analysisRes
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    public async analyze(options: AnalyzeOptions): Promise<AnalysisSubmission> {
        try {
            const { headers, tokens } = await getHeaders(ClientService.jwtTokens)
            this.setCredentials(tokens)

            const request = generateAnalysisRequest(options, this.toolName)

            const result = await postRequest(`${this.API_URL}/analyses`, request, headers)
            const analysisRes: AnalysisSubmission = result.data

            return analysisRes
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    public async getPdf(uuid: string): Promise<any> {
        try {
            const { headers, tokens } = await getHeaders(ClientService.jwtTokens)
            this.setCredentials(tokens)

            const result = await getRequest(`${this.API_URL}/analyses/${uuid}/pdf-report`, headers)
            const pdfRes: any = result.data

            return pdfRes
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    public async listGroups(queryString?): Promise<AnalysisGroups> {
        try {
            const { headers, tokens } = await getHeaders(ClientService.jwtTokens)
            this.setCredentials(tokens)

            const result = await getRequest(`${this.API_URL}/analysis-groups?${queryString}`, headers)
            const groupsRes: AnalysisGroups = result.data

            return groupsRes
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    public async getGroupById(groupId: string) {
        try {
            if (!groupId) {
                throw new Error('MythXJS: Group ID is required to perform this operation')
            }
            const { headers, tokens } = await getHeaders(ClientService.jwtTokens)
            this.setCredentials(tokens)

            const result = await getRequest(`${this.API_URL}/analysis-groups/${groupId}`, headers)
            const groupRes: Group = result.data

            return groupRes
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    public async createGroup(groupName?: string): Promise<Group> {
        try {
            const { headers, tokens } = await getHeaders(ClientService.jwtTokens)
            this.setCredentials(tokens)

            const body = groupName ? { groupName: groupName } : null

            const result = await postRequest(`${this.API_URL}/analysis-groups`, body, headers)
            const groupRes: Group = result.data

            return groupRes
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    public async groupOperation(groupId: string, operationType?: string): Promise<Group> {
        try {
            if (!groupId) {
                throw new Error('MythXJS: Group ID is required to perform this operation')
            }
            const { headers, tokens } = await getHeaders(ClientService.jwtTokens)
            this.setCredentials(tokens)

            const body = operationType ? { type: operationType } : 'seal_group'

            const result = await postRequest(`${this.API_URL}/analysis-groups/${groupId}`, body, headers)
            const groupRes: Group = result.data

            return groupRes
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    private setCredentials(tokens: JwtTokensInterface) {
        ClientService.jwtTokens.access = tokens.access
        ClientService.jwtTokens.refresh = tokens.refresh
    }
}
