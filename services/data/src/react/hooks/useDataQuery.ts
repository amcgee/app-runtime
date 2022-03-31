import { useState, useRef, useCallback } from 'react'
import { useQuery, setLogger } from 'react-query'
import { Query, QueryOptions, QueryVariables } from '../../engine'
import { FetchError } from '../../engine/types/FetchError'
import { QueryRenderInput, QueryRefetchFunction } from '../../types'
import { stableVariablesHash } from './stableVariablesHash'
import { useDataEngine } from './useDataEngine'
import { useStaticInput } from './useStaticInput'

const noop = () => {
    /**
     * Used to silence the default react-query logger. Eventually we
     * could expose the setLogger functionality and remove the call
     * to setLogger here.
     */
}

setLogger({
    log: noop,
    warn: noop,
    error: noop,
})

type QueryState = {
    enabled: boolean
    variables?: QueryVariables
    variablesHash?: string
    refetchCallback?: (data: any) => void
}

const mergeAndCompareVariables = (
    previousVariables?: QueryVariables,
    newVariables?: QueryVariables,
    previousHash?: string
) => {
    if (!newVariables) {
        return {
            identical: true,
            mergedVariablesHash: previousHash,
            mergedVariables: previousVariables,
        }
    }

    // Use cached hash if it exists
    const currentHash = previousHash || stableVariablesHash(previousVariables)

    const mergedVariables = {
        ...previousVariables,
        ...newVariables,
    }
    const mergedVariablesHash = stableVariablesHash(mergedVariables)
    const identical = currentHash === mergedVariablesHash

    return {
        identical,
        mergedVariablesHash,
        mergedVariables,
    }
}

export const useDataQuery = (
    query: Query,
    {
        onComplete: userOnSuccess,
        onError: userOnError,
        variables: initialVariables = {},
        lazy: initialLazy = false,
    }: QueryOptions = {}
): QueryRenderInput => {
    const queryState = useRef<QueryState>({
        variables: initialVariables,
        variablesHash: undefined,
        enabled: !initialLazy,
        refetchCallback: undefined,
    })
    const [, /* refetchCount (not used)*/ setRefetchCount] = useState(0)
    const [staticQuery] = useStaticInput<Query>(query, {
        warn: true,
        name: 'query',
    })

    /**
     * User callbacks and refetch handling
     */

    const onSuccess = (data: any) => {
        if (queryState.current.refetchCallback) {
            queryState.current.refetchCallback(data)
            queryState.current.refetchCallback = undefined
        }

        if (userOnSuccess) {
            userOnSuccess(data)
        }
    }

    const onError = (error: FetchError) => {
        // If we'd want to reject on errors we'd call the cb with the error here
        if (queryState.current.refetchCallback) {
            queryState.current.refetchCallback = undefined
        }

        if (userOnError) {
            userOnError(error)
        }
    }

    /**
     * Setting up react-query
     */

    const engine = useDataEngine()
    const queryKey = [staticQuery, queryState.current.variables]
    const queryFn = () =>
        engine.query(staticQuery, { variables: queryState.current.variables })

    const {
        isIdle,
        isFetching,
        isLoading,
        error,
        data,
        refetch: queryRefetch,
    } = useQuery(queryKey, queryFn, {
        enabled: queryState.current.enabled,
        onSuccess,
        onError,
    })

    /**
     * Refetch allows a user to update the variables or just
     * trigger a refetch of the query with the current variables.
     *
     * We're using useCallback to make the identity of the function
     * as stable as possible, so that it won't trigger excessive
     * rerenders when used for side-effects.
     */

    const refetch: QueryRefetchFunction = useCallback(
        newVariables => {
            const {
                identical,
                mergedVariables,
                mergedVariablesHash,
            } = mergeAndCompareVariables(
                queryState.current.variables,
                newVariables,
                queryState.current.variablesHash
            )

            /**
             * If there are no updates that will trigger an automatic refetch
             * we'll need to call react-query's refetch directly
             */
            if (queryState.current.enabled && identical) {
                return queryRefetch({
                    cancelRefetch: true,
                    throwOnError: false,
                }).then(({ data }) => data)
            }

            queryState.current.variables = mergedVariables
            queryState.current.variablesHash = mergedVariablesHash
            queryState.current.enabled = true

            // This promise does not currently reject on errors
            const refetchPromise = new Promise(resolve => {
                queryState.current.refetchCallback = data => {
                    resolve(data)
                }
            })

            // Trigger a react-query refetch by incrementing refetchCount state
            setRefetchCount(prevCount => prevCount + 1)

            return refetchPromise
        },
        [queryRefetch]
    )

    /**
     * react-query returns null or an error, but we return undefined
     * or an error, so this ensures consistency with the other types.
     */
    const ourError = error || undefined

    return {
        engine,
        // A query is idle if it is lazy and no initial data is available.
        called: !isIdle,
        loading: isLoading,
        fetching: isFetching,
        error: ourError,
        data,
        refetch,
    }
}
