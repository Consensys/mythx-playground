import { validateToken } from './validateToken'
import { JwtTokensInterface } from '..'

export async function getHeaders(jwtTokens: JwtTokensInterface) {
    const tokens = await validateToken(jwtTokens)
    const headers = {
        Authorization: `Bearer ${tokens.access}`,
        'Content-Type': 'application/json',
    }

    return { tokens, headers }
}
