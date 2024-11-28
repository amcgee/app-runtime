import { FetchError, FetchErrorDetails, JsonValue } from '../../engine'

export const parseContentType = (contentType: string | null) =>
    contentType ? contentType.split(';')[0].trim().toLowerCase() : ''

export const parseStatus = async (response: Response) => {
    const accessError =
        response.status === 401 ||
        response.status === 403 ||
        response.status === 409

    if (accessError) {
        let message
        let details: FetchErrorDetails = {}

        try {
            details = await response.json()
            message = details.message
        } catch (e) {
            // Do nothing
        }

        // Set a message in case of invalid json, or json without 'message' property
        if (!message) {
            message = response.status === 401 ? 'Unauthorized' : 'Forbidden'
        }

        throw new FetchError({
            type: 'access',
            status: response.status,
            message,
            details,
        })
    }

    if (response.status < 200 || response.status >= 400) {
        const message = `An unknown error occurred - ${response.statusText} (${response.status})`
        let details: FetchErrorDetails = {}

        try {
            details = await response.json()
        } catch (e) {
            // We can leave details as is if parsing fails
        }

        throw new FetchError({
            type: 'unknown',
            status: response.status,
            message,
            details,
        })
    }

    return response
}

export function fetchData(
    url: string,
    options: RequestInit = {}
): Promise<JsonValue> {
    return fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/json',
            ...options.headers,
        },
    })
        .catch((err) => {
            throw new FetchError({
                type: 'network',
                message: 'An unknown network error occurred',
                details: err,
            })
        })
        .then(parseStatus)
        .then(async (response) => {
            const contentType = parseContentType(
                response.headers.get('Content-Type')
            )

            // 'application/json'
            if (contentType === 'application/json') {
                return await response.json() // Will throw if invalid JSON!
            }

            // 'text/*'
            if (/^text\/[a-z0-9.-]+$/.test(contentType)) {
                return await response.text()
            }

            return await response.blob()
        })
}
