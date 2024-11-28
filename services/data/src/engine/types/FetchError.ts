export type FetchErrorTypeName = 'network' | 'unknown' | 'access' | 'aborted'
export type FetchErrorDetails = {
    httpStatus?: string
    httpStatusCode?: number
    status?: string
    message?: string
    errorCode?: string
    [x: string]: any
}

export interface FetchErrorPayload {
    type: FetchErrorTypeName
    status?: number
    details?: FetchErrorDetails
    message: string
}

export class FetchError extends Error implements FetchErrorPayload {
    public type: FetchErrorTypeName
    public details: FetchErrorDetails
    public status?: number

    public constructor({ message, type, status, details = {} }: FetchErrorPayload) {
        super(message)
        this.type = type
        this.details = details
        this.status = status
    }
}
