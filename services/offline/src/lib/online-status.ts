import { useState, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'

type milliseconds = number
interface OnlineStatusOptions {
    debounceDelay?: milliseconds
}

interface OnlineStatus {
    online: boolean
    offline: boolean
}

// TODO: Add option to periodically ping server to check online status.
// TODO: Add logic to return a variable indicating unstable connection.

/**
 * Returns the browser's online status. Updates in response to 'online' and
 * 'offline' events. By default, debounces updates to once every second to
 * avoid UI flicker, but that delay can be configured with the
 * `options.debounceDelay` param.
 *
 * @param {Object} [options]
 * @param {Number} [options.debounceDelay] - Timeout delay to debounce updates, in ms
 * @returns {Object} `{ online, offline }` booleans. Each is the opposite of the other.
 */
export function useOnlineStatus(options?: OnlineStatusOptions): OnlineStatus {
    // initialize state to `navigator.onLine` value
    const [online, setOnline] = useState(navigator.onLine)

    const updateState = useDebouncedCallback(
        ({ type }: Event) => setOnline(type === 'online'),
        options?.debounceDelay || 1000
    )

    // on 'online' or 'offline' events, set state
    useEffect(() => {
        window.addEventListener('online', updateState)
        window.addEventListener('offline', updateState)
        return () => {
            window.removeEventListener('online', updateState)
            window.removeEventListener('offline', updateState)
        }
    }, [updateState])

    return { online, offline: !online }
}
