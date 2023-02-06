import postRobot from 'post-robot'
import React, { useCallback, useEffect, useState } from 'react'
import { PluginErrorBoundary } from './PluginErrorBoundary'
import { usePluginErrorContext } from './PluginContext'

export const PluginWrapper = ({
    requiredProps,
    children,
}: {
    requiredProps: [string]
    children: any
}): any => {
    const { setOnPluginError } = usePluginErrorContext()
    const [propsFromParent, setPropsFromParent] = useState<any>()

    const receivePropsFromParent = useCallback(
        (event: any): void => {
            const { data: receivedProps } = event
            const { updateMissingProps, ...explictlyPassedProps } =
                receivedProps

            setPropsFromParent(explictlyPassedProps)

            // check for required props
            const missingProps = requiredProps?.filter(
                (prop) => !explictlyPassedProps[prop]
            )

            // if there are missing props, pass those back to parent
            if (missingProps && missingProps.length > 0) {
                updateMissingProps(missingProps.sort())
                console.error(
                    `The following required props were not provided: ${missingProps.join(
                        ','
                    )}`
                )
            } else {
                updateMissingProps(null)
            }

            if (explictlyPassedProps.onError && setOnPluginError) {
                setOnPluginError(() => (error: Error) => {
                    explictlyPassedProps.onError(error)
                })
            }
        },
        [requiredProps, setOnPluginError]
    )

    useEffect(() => {
        if (setOnPluginError) {
            // make first request for props to communicate that iframe is ready
            postRobot
                .send(window.top, 'getPropsFromParent')
                .then(receivePropsFromParent)
                .catch((err: Error) => {
                    console.error(err)
                })
        }
    }, [receivePropsFromParent, setOnPluginError])

    useEffect(() => {
        // set up listener to listen for subsequent sends from parent window
        const listener = postRobot.on(
            'updated',
            { window: window.top },
            (event): any => {
                receivePropsFromParent(event)
            }
        )

        return () => listener.cancel()
    }, [receivePropsFromParent])

    return children({ ...propsFromParent })
    // return (
    //     <PluginErrorBoundary onCustomError={propsFromParent?.onError || null}>
    //         {children({ ...propsFromParent })}
    //     </PluginErrorBoundary>
    // )
}