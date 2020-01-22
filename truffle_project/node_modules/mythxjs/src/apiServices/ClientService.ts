import { AuthService } from './AuthService'
import { AnalysesService } from './AnalysesService'
import { JwtTokensInterface, AnalyzeOptions, StatsResponse, UsersResponse, AnalysisGroups, Group } from '..'

import { AnalysisList, AnalysisSubmission, DetectedIssues, Version } from '../types'

/**
 * Main service exposed to outside.
 * Needs to be instantiated with username, password, toolName (optional) and environment (optional) fields. If no environment specified it will default to prod.
 * Please note that this is exported as `Client`.
 * @example
 * `import { Client } from 'mythxjs'`.
 *
 * `const mythx = new Client('0x0000000000000000000000000000000000000000', 'trial', 'testTool', 'https://staging.api.mythx.io/v1/');`
 */
export class ClientService {
    /**
     * @ignore
     */
    private ethAddress
    /**
     * @ignore
     */
    private password
    /**
     * @ignore
     */
    private authService
    /**
     * @ignore
     */
    private analysesService
    /**
     * @ignore
     */
    // private jwtTokens
    /**
     * @ignore
     */
    private toolName

    static MYTHX_API_ENVIRONMENT

    static jwtTokens: JwtTokensInterface = {
        access: '',
        refresh: '',
    }

    constructor(
        ethAddress?: string,
        password?: string,
        toolName: string = 'MythXJS',
        environment: string = 'https://api.mythx.io/v1',
        accessToken: string = '',
    ) {
        this.ethAddress = ethAddress
        this.password = password
        ClientService.MYTHX_API_ENVIRONMENT = environment
        this.authService = new AuthService(ethAddress, password)
        ;(this.toolName = toolName), (ClientService.jwtTokens.access = accessToken)
        if (accessToken) {
            ClientService.jwtTokens.access = accessToken
            this.analysesService = new AnalysesService(ClientService.jwtTokens, this.toolName)
        }
    }

    /**
     *  Login to the API using ethAddress and password specified in the library constructor.
     * @param ethAddress Ethereum address for Mythx account
     * @param password  Password for Ethereum address
     * @return {Promise<JwtTokensInterface>}  Returns an object containing two tokens (access+refresh) that can be saved in storage.
     */
    async login(ethAddress?: string, password?: string): Promise<JwtTokensInterface> {
        if (ethAddress && password) {
            this.ethAddress = ethAddress
            this.password = password
        }
        ClientService.jwtTokens = await this.authService.login(this.ethAddress, this.password)
        this.analysesService = new AnalysesService(ClientService.jwtTokens, this.toolName)

        return ClientService.jwtTokens
    }

    /**
     *  Login to the API using metamask challenge result message.
     *  In order to get the object containing the message use `getChallenge` and handle Metamask login in the frontend.
     * @param signature Signature passed by provider. In case of metamask this will be returned after signing challenge.
     * @param provider pass a provider value for the HTTP headers. If nothing is passed defaults to MetaMask
     * @return {Promise<JwtTokensInterface>}  Returns an object containing two tokens (access+refresh) that can be saved in storage.
     */
    async loginWithSignature(signature: string, provider: string): Promise<JwtTokensInterface> {
        return await this.authService.loginWithSignature(signature, provider)
    }

    /**
     *  Generates authentication challenge (Metamask only for now).
     *  The Metamask flow needs to be handled on the front end since MythXJS does not have Web3 dependencies.
     * @param ethAddress Ethereum address for Mythx account
     * @returns Resolves with API response or throw error
     */

    async getChallenge(ethAddress?: string): Promise<any> {
        return await this.authService.getChallenge(ethAddress)
    }

    /**
     *  Logout from the API.
     * @returns Resolves with API response or throw error
     */
    async logout(): Promise<{}> {
        return await this.authService.logout()
    }

    /**
     *   Returns API current version.
     *   Does not require login.
     *   @returns Resolves with API response or throw error
     */
    async getVersion(): Promise<Version> {
        return await this.authService.getVersion()
    }

    /**
     *   Returns API stats.
     *   Internal only, needs admin credentials to be accessed.
     *   @returns {Promise<StatsResponse>} Resolves with API response or throw error
     */
    async getStats(queryString?: string): Promise<Array<StatsResponse>> {
        return await this.authService.getStats(queryString)
    }

    /**
     * Retrieve list of registred API users or just caller user object if no required permission.
     * @param queryString Query string for detailed list (query parameters: offset, orderBy, email, ethAddress)
     * @returns {Promise<UsersResponse>} Resolves with API response or throw error
     */
    async getUsers(queryString: string): Promise<UsersResponse> {
        return await this.authService.getUsers(queryString)
    }

    async getAnalysesList(): Promise<AnalysisList> {
        return await this.analysesService.getAnalysesList()
    }

    /**
     * Get status for analysis on given UUID.
     * @param uuid - unique identifier of analysis job
     * @return {Promise<AnalysisStatusResponse>} Resolves with API response, or throws error
     */
    async getAnalysisStatus(uuid: string): Promise<AnalysisSubmission> {
        return await this.analysesService.getAnalysisStatus(uuid)
    }

    /**
     * Gets the array of issues from the API.
     *
     * @param {String} uuid - unique identifier of analysis job
     * @returns {Promise} Resolves with API response, or throws error
     */
    async getDetectedIssues(uuid: string): Promise<DetectedIssues> {
        return await this.analysesService.getDetectedIssues(uuid)
    }

    /**
     * Submit a smart contract using bytecode only.
     * This will likely be deprecated in future.
     *
     * @param {String} bytecode - Compiled bytecode of a smart contract for example "0xfe".
     * @return {Promise} Resolves with API response, or throws error
     */
    async submitBytecode(bytecode: string): Promise<AnalysisSubmission> {
        return await this.analysesService.submitBytecode(bytecode)
    }

    /**
     * Submit a smart contract using sourcecode only.
     * This will likely be deprecated in future.
     *
     * @param {String} sourceCode - String containing smart contract sourcecode.
     * @param {String} contractName - Name of the contract to submit for analysis.
     * @return {Promise} Resolves with API response, or throws errors
     */
    async submitSourceCode(sourceCode: string, contractName: string): Promise<AnalysisSubmission> {
        return await this.analysesService.submitSourceCode(sourceCode, contractName)
    }

    /**
     * Submit a smart contract using custom parameters.
     *
     * @param {Object} options - Object containing options to submit to API
     * @return {Promise} Resolves with API response, or throws error
     */
    async analyze(options: AnalyzeOptions): Promise<AnalysisSubmission> {
        return await this.analysesService.analyze(options)
    }

    /**
     * Get API generated PDF.
     *
     * @param {String} uuid - Unique identifier of analysis job
     * @return {Promise} Resolves with API response, or throws error
     */
    async getPdf(uuid: string): Promise<any> {
        return await this.analysesService.getPdf(uuid)
    }

    /**
     * Get list of analyses groups.
     *
     * @param {String} queryString - Query string for detailed list of groups (query parameters: offset, createdBy, groupName, dateFrom, dateTo)
     * @return {Promise} Resolves with API response, or throws error
     */
    async listGroups(queryString?: string): Promise<AnalysisGroups> {
        return await this.analysesService.listGroups(queryString)
    }

    /**
     * Create an analysis submission group.
     *
     * @param {String} groupName (optional) - String that defines a group name
     * @return {Promise} Resolves with API response, or throws error
     */
    async createGroup(groupName?: string): Promise<Group> {
        return await this.analysesService.createGroup(groupName)
    }

    /**
     * Perform operations on specific group.
     *
     * @param {String} groupId - String that defines a unique group ID
     * @param {String} operationType (optional) - Type of operation to be performed in the group (e.g. "seal_group")
     * @return {Promise} Resolves with API response, or throws error
     */
    async groupOperation(groupId, operationType?): Promise<Group> {
        return await this.analysesService.groupOperation(groupId, operationType)
    }

    /**
     * Get a single analyses group by ID.
     *
     * @param {String} groupId (required) - String that defines a unique group ID
     * @return {Promise} Resolves with API response, or throws error
     */
    public async getGroupById(groupId: string): Promise<Group> {
        return await this.analysesService.getGroupById(groupId)
    }
}
