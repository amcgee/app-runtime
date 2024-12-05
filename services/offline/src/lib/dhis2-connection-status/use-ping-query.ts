import { useConfig } from '@dhis2/app-service-config'
import { useCallback } from 'react'

// This function has a separate file for easier mocking

export function usePingQuery(): () => Promise<any> {
    const { baseUrl } = useConfig()

    // This endpoint doesn't need any extra headers or handling since it's
    // public. It doesn't extend the user session. See DHIS2-14531
    const ping = useCallback(
        () => fetch(new URL('./api/ping', baseUrl).href),
        [baseUrl]
    )

    return ping
}
