export function errorHandler(err) {
    let status
    let error
    if (err.response && err.response.data) {
        status = err.response.data.status
        error = err.response.data.error
    }

    if (status && error) {
        throw new Error(`${status} ${error}`)
    } else {
        throw new Error(`MythxJS. Error with your request. ${err}`)
    }
}
