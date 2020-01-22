import axios from 'axios'

async function postRequest(url: string, body, headers: any) {
    return axios.post(url, body, { headers: headers, timeout: 10000 })
}

export default postRequest
