import { AlertsManagerContext } from '@dhis2/app-service-alerts'
import { useDataQuery } from '@dhis2/app-service-data'
import postRobot from 'post-robot'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import PluginError from './PluginError'

const appsInfoQuery = {
    apps: {
        resource: 'apps',
    },
}

// sample logic subject to change depending on actual endpoint details
const getPluginEntryPoint = ({
    apps,
    appShortName,
}: {
    apps: any
    appShortName?: string
}): string => {
    return apps.find(
        ({ short_name }: { short_name: string }) =>
            short_name && short_name === appShortName
    )?.pluginLaunchUrl
}

export const Plugin = ({
    pluginSource,
    pluginShortName,
    ...propsToPass
}: {
    pluginSource?: string
    pluginShortName?: string
    propsToPass: any
}): JSX.Element => {
    const iframeRef = useRef<HTMLIFrameElement>(null)

    const { add: alertsAdd } = useContext(AlertsManagerContext)

    const { data } = useDataQuery(appsInfoQuery)
    const pluginEntryPoint =
        pluginSource ??
        getPluginEntryPoint({
            apps: data?.apps || [],
            appShortName: pluginShortName,
        })

    const [communicationReceived, setCommunicationReceived] =
        useState<boolean>(false)
    const [prevCommunicationReceived, setPrevCommunicationReceived] =
        useState<boolean>(false)

    const [inErrorState, setInErrorState] = useState<boolean>(false)

    // since we do not know what props are passed, the dependency array has to be keys of whatever is standard prop
    const memoizedPropsToPass = useMemo(
        () => propsToPass,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            ...Object.keys(propsToPass)
                .sort()
                .map((k) => propsToPass[k]),
        ]
    )

    useEffect(() => {
        setCommunicationReceived(false)
    }, [pluginEntryPoint])

    useEffect(() => {
        // if communicationReceived switches from false to true, the props have been sent
        const prevCommunication = prevCommunicationReceived
        setPrevCommunicationReceived(communicationReceived)
        if (prevCommunication === false && communicationReceived === true) {
            return
        }

        if (iframeRef?.current) {
            const iframeProps = {
                ...memoizedPropsToPass,
                alertsAdd,
                setInErrorState,
                setCommunicationReceived,
            }

            // if iframe has not sent initial request, set up a listener
            if (!communicationReceived && !inErrorState) {
                const listener = postRobot.on(
                    'getPropsFromParent',
                    // listen for messages coming only from the iframe rendered by this component
                    { window: iframeRef.current.contentWindow },
                    (): any => {
                        setCommunicationReceived(true)
                        return iframeProps
                    }
                )
                return () => listener.cancel()
            }

            // if iframe has sent initial request, send new props
            if (
                communicationReceived &&
                iframeRef.current.contentWindow &&
                !inErrorState
            ) {
                postRobot
                    .send(
                        iframeRef.current.contentWindow,
                        'updated',
                        iframeProps
                    )
                    .catch((err) => {
                        // log postRobot errors, but do not bubble them up
                        console.error(err)
                    })
            }
        }
        // prevCommunicationReceived update should not retrigger this hook
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memoizedPropsToPass, communicationReceived, inErrorState, alertsAdd])

    if (data && !pluginEntryPoint) {
        return (
            <PluginError
                missingEntryPoint={true}
                appShortName={pluginShortName}
            />
        )
    }

    if (pluginEntryPoint) {
        return (
            <iframe
                ref={iframeRef}
                src={pluginSource}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                }}
            ></iframe>
        )
    }

    return <></>
}
