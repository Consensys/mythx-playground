import axios from 'axios'

export async function loginUser(ethAddress: string, password: string, url: string) {
    return axios.post(url, { ethAddress, password })
}  