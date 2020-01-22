import axios from 'axios'

async function getRequest(url: string, headers: any) {
    return axios.get(url, { headers: headers })
}

export default getRequest