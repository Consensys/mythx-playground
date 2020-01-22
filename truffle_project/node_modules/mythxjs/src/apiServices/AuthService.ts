import { ClientService } from './ClientService'

import { postRequest, getRequest } from '../http'

import { loginUser } from '../auth/loginUser'

import { getHeaders } from '../util/getHeaders'
import { errorHandler } from '../util/errorHandler'

import { JwtTokensInterface, StatsResponse, UsersResponse } from '..'

import { Openapi, Version } from '../types'

export class AuthService {
    public ethAddress: string
    public password: string
    private API_URL = ClientService.MYTHX_API_ENVIRONMENT

    constructor(ethAddress?: string, password?: string) {
        this.ethAddress = ethAddress as string
        this.password = password as string
    }

    public async login(ethAddress?: string, password?: string): Promise<JwtTokensInterface> {
        try {
            if (ethAddress && password) {
                this.ethAddress = ethAddress
                this.password = password
            }
            const result = await loginUser(this.ethAddress, this.password, `${this.API_URL}/auth/login`)
            const tokens: JwtTokensInterface = result.data.jwtTokens
            this.setCredentials(tokens)

            return tokens
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    /**
     *  Login to the API using metamask challenge result message.
     *  In order to get the object containing the message, use `getChallenge` and handle Metamask login in the frontend.
     * @param signature message.value property contained in object returned from `getChallenge`.
     * @param provider pass a provider value for the HTTP headers. If nothing is passed defaults to MetaMask
     * @return {Promise<JwtTokensInterface>}  Returns an object containing two tokens (access+refresh) that can be saved in storage.
     */
    public async loginWithSignature(signature: string, provider: string = 'MetaMask'): Promise<JwtTokensInterface> {
        try {
            const headers = {
                Authorization: `${provider} ${signature}`,
            }
            const result = await postRequest(`${this.API_URL}/auth/login`, null, headers)
            const tokens: JwtTokensInterface = result.data.jwtTokens
            this.setCredentials(tokens)

            return tokens
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    public async logout(): Promise<{}> {
        if (this.isUserLoggedIn()) {
            try {
                const { headers, tokens } = await getHeaders(ClientService.jwtTokens)
                this.setCredentials(tokens)

                const result = await postRequest(`${this.API_URL}/auth/logout`, {}, headers)
                ClientService.jwtTokens.access = ClientService.jwtTokens.refresh = ''

                return result.data
            } catch (err) {
                errorHandler(err)
                throw err
            }
        } else {
            throw new Error('MythxJS no valid token found. Please login')
        }
    }

    public async getVersion(): Promise<Version> {
        try {
            const result = await getRequest(`${this.API_URL}/version`, null)
            const version: Version = result.data

            return version
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    public async getOpenApiHTML(): Promise<Openapi> {
        try {
            const result = await getRequest(`${this.API_URL}/openapi`, null)
            const openApi: Openapi = result.data

            return openApi
        } catch (err) {
            errorHandler(err)
            throw err
        }
    }

    public async getOpenApiYAML(): Promise<any> {
        try {
            const result = await getRequest(`${this.API_URL}/openapi.yaml`, null)

            return result.data
        } catch (err) {
            errorHandler(err)
        }
    }

    public async getStats(queryString?: string): Promise<Array<StatsResponse> | void> {
        if (this.isUserLoggedIn()) {
            try {
                const { headers, tokens } = await getHeaders(ClientService.jwtTokens)
                this.setCredentials(tokens)

                const result = await getRequest(`${this.API_URL}/stats/users-analyses?${queryString}`, headers)
                const stats: Array<StatsResponse> = result.data

                return stats
            } catch (err) {
                errorHandler(err)
            }
        } else {
            throw new Error('MythxJS no valid token found. Please login.')
        }
    }

    /**
     *  Generates authentication challenge (Metamask only for now).
     *  The Metamask flow needs to be handled on the front end since MythXJS does not have Web3 dependencies.
     * @param ethAddress Ethereum address for Mythx account
     * @returns Resolves with API response or throw error
     */
    public async getChallenge(ethAddress?: string): Promise<any> {
        try {
            const address = ethAddress ? ethAddress : this.ethAddress
            const result = await getRequest(`${this.API_URL}/auth/challenge?ethAddress=${address}`, {})

            return result.data
        } catch (err) {
            errorHandler(err)
        }
    }

    /**
     * Retrieve list of registred API users or just caller user object if no required permission.
     * @param queryString Query string for detailed list (query parameters: offset, orderBy, email, ethAddress)
     * @returns Resolves with API response or throw error
     */

    public async getUsers(queryString: string = ''): Promise<UsersResponse> {
        if (this.isUserLoggedIn()) {
            try {
                const { headers, tokens } = await getHeaders(ClientService.jwtTokens)
                this.setCredentials(tokens)

                const result = await getRequest(`${this.API_URL}/users?${queryString}`, headers)
                const users: UsersResponse = result.data

                return users
            } catch (err) {
                errorHandler(err)
                throw err
            }
        } else {
            throw new Error('MythxJS no valid token found. Please login.')
        }
    }

    private isUserLoggedIn() {
        return !!ClientService.jwtTokens.access
    }

    private setCredentials(tokens: JwtTokensInterface) {
        ClientService.jwtTokens.access = tokens.access
        ClientService.jwtTokens.refresh = tokens.refresh
    }
}
