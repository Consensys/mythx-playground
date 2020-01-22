import * as jwt from 'jsonwebtoken'

import { refreshToken } from './refreshToken'
import { JwtTokensInterface } from '..'

interface jwtInterface {
    jti: string
    iss: string
    exp: number
    userId: string
    iat: number
}

export async function validateToken(tokens: JwtTokensInterface): Promise<JwtTokensInterface> {
    if (isTokenValid(tokens.access)) {
        return tokens
    } else {
        // else return refreshed token
        const returnT = (await refreshToken(tokens)) as JwtTokensInterface
        return returnT
    }
}

// Returns a boolean on whatever the token has expired or not
export function isTokenValid(token: string): boolean {
    try {
        // decode token
        const tokenDecoded: jwtInterface = jwt.decode(token)
        const { exp } = tokenDecoded

        // returns true if token is still valid
        const now = new Date()
        return now.getTime() < exp * 1000
    } catch (err) {
        throw new Error(`Error with checking if token is still valid. ${err}`)
    }
}
