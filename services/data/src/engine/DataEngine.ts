import { getMutationFetchType } from './helpers/getMutationFetchType'
import { resolveDynamicQuery } from './helpers/resolveDynamicQuery'
import {
    validateResourceQuery,
    validateResourceQueries,
} from './helpers/validate'
import { DataEngineLink } from './types/DataEngineLink'
import { QueryExecuteOptions } from './types/ExecuteOptions'
import { JsonMap, JsonValue } from './types/JsonValue'
import { Mutation } from './types/Mutation'
import { Query } from './types/Query'

const reduceResponses = (responses: JsonValue[], names: string[]) =>
    responses.reduce<JsonMap>((out, response, idx) => {
        out[names[idx]] = response
        return out
    }, {})

type DataEngineEventMap = {
    sessionStateChanged: boolean
}
export class DataEngine extends EventEmitter<DataEngineEventMap>{
    private link: DataEngineLink
    private sessionIsActive: boolean = true /* Assume we start in an authenticated state, until we receive a response that says otherwise */

    public constructor(link: DataEngineLink) {
        super()
        this.link = link
        this.link.engine = this
    }

    public query(
        query: Query,
        {
            variables = {},
            signal,
            onComplete,
            onError,
        }: QueryExecuteOptions = {}
    ): Promise<JsonMap> {
        const names = Object.keys(query)
        const queries = names
            .map((name) => query[name])
            .map((q) => resolveDynamicQuery(q, variables))

        validateResourceQueries(queries, names)

        return Promise.all(
            queries.map((q) => {
                return this.link.executeResourceQuery('read', q, {
                    signal,
                })
            })
        )
            .then((results) => {
                const data = reduceResponses(results, names)
                onComplete && onComplete(data)
                return data
            })
            .catch((error) => {
                onError && onError(error)
                throw error
            })
    }

    public mutate(
        mutation: Mutation,
        {
            variables = {},
            signal,
            onComplete,
            onError,
        }: QueryExecuteOptions = {}
    ): Promise<JsonValue> {
        const query = resolveDynamicQuery(mutation, variables)

        const type = getMutationFetchType(mutation)
        validateResourceQuery(type, query)

        const result = this.link.executeResourceQuery(type, query, {
            signal,
        })
        return result
            .then((data) => {
                onComplete && onComplete(data)
                return data
            })
            .catch((error) => {
                onError && onError(error)
                throw error
            })
    }

    public setSessionIsActive(sessionIsActive: boolean) {
        const oldSessionIsActive = this.sessionIsActive
        this.sessionIsActive = sessionIsActive
        if (sessionIsActive !== oldSessionIsActive) {
            this.emit('sessionStateChanged', sessionIsActive)
        }
    }
    public getSessionIsActive() {
        return this.sessionIsActive
    }
}

export default DataEngine
