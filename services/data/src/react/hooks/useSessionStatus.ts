import { useEffect, useState } from "react"
import { useDataEngine } from "./useDataEngine"

export const useSessionStatus = () => {
    const engine = useDataEngine()
    const [authenticated, setAuthenticated] = useState(engine.getSessionIsActive())

    useEffect(() => {
        const onSessionStateChanged = (status: boolean) => {
            setAuthenticated(status)
        }
        
        engine.on('sessionStateChanged', onSessionStateChanged)
        return () => {
            engine.off('sessionStateChanged', onSessionStateChanged)
        }
    }, [engine])

    return { authenticated }
}