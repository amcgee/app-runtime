import { useState, useRef, useCallback, useDebugValue } from 'react'
import { useQuery, setLogger } from 'react-query'
import type { Query, QueryOptions, QueryVariables } from '../../engine'
import type { FetchError } from '../../engine/types/FetchError'
import type { QueryRenderInput, QueryRefetchFunction } from '../../types'
import { mergeAndCompareVariables } from './mergeAndCompareVariables'
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

export const useDataQuery = (
    query: Query,
    {
        onComplete: userOnSuccess,
        onError: userOnError,
        variables: initialVariables = {},
        lazy: initialLazy = false,
        keepPreviousData = false,
    }: QueryOptions = {}
): QueryRenderInput => {
    const [staticQuery] = useStaticInput<Query>(query, {
        warn: true,
        name: 'query',
    })
    const [variablesUpdateCount, setVariablesUpdateCount] = useState(0)

    const queryState = useRef<QueryState>({
        variables: initialVariables,
        variablesHash: undefined,
        enabled: !initialLazy,
        refetchCallback: undefined,
    })

    /**
     * Display current query state and refetch count in React DevTools
     */

    useDebugValue(
        {
            variablesUpdateCount,
            enabled: queryState.current.enabled,
            variables: queryState.current.variables,
        },
        debugValue => JSON.stringify(debugValue)
    )

    /**
     * User callbacks and refetch handling
     */

    const onSuccess = (data: any) => {
        queryState.current.refetchCallback?.(data)
        queryState.current.refetchCallback = undefined

        if (userOnSuccess) {
            userOnSuccess(data)
        }
    }

    const onError = (error: FetchError) => {
        // If we'd want to reject on errors we'd call the cb with the error here
        queryState.current.refetchCallback = undefined

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
        keepPreviousData,
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

            // Trigger a react-query refetch by incrementing variablesUpdateCount state
            setVariablesUpdateCount(prevCount => prevCount + 1)

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
