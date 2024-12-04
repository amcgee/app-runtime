import React, { ReactElement, useState } from 'react'
import { AlertsContext } from './AlertsContext'
import { AlertsManagerContext } from './AlertsManagerContext'
import { makeAlertsManager } from './makeAlertsManager'
import type { Alert, AlertsManager } from './types'

export const AlertsProvider = ({
    children,
    plugin = false,
    parentAlertsAdd = undefined,
    showAlertsInPlugin = false,
}: {
    children: React.ReactNode
    plugin?: boolean
    parentAlertsAdd?: any
    showAlertsInPlugin?: boolean
}): ReactElement => {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [alertsManager] = useState<AlertsManager>(() =>
        makeAlertsManager(setAlerts, plugin)
    )

    return (
        <AlertsManagerContext.Provider
            value={{ ...alertsManager, parentAlertsAdd, showAlertsInPlugin }}
        >
            <AlertsContext.Provider value={alerts}>
                {children}
            </AlertsContext.Provider>
        </AlertsManagerContext.Provider>
    )
}
