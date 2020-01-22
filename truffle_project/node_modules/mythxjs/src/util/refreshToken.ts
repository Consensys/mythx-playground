import { ClientService } from '../apiServices/ClientService'

import { postRequest } from '../http'
import { JwtTokensInterface } from '..'
import { errorHandler } from './errorHandler'

export async function refreshToken(jwtTokens: JwtTokensInterface): Promise<JwtTokensInterface | void> {
    try {
        const reqBody = {
            jwtTokens: jwtTokens,
        }

        const result = await postRequest(`${ClientService.MYTHX_API_ENVIRONMENT}/auth/refresh`, reqBody, {})
        const tokens: JwtTokensInterface = result.data.jwtTokens

        return tokens
    } catch (err) {
        errorHandler(err)
    }
}
