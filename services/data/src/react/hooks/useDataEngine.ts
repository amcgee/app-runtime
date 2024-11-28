import { useContext, useState } from 'react'
import { DataEngine } from '../../engine'
import { DataContext } from '../context/DataContext'

function useConst<T>(initializer: () => T): T {
    const [value] = useState(initializer)
    return value
}

export const useDataEngine = (): DataEngine => {
    const context = useContext(DataContext)
    const engine = useConst<DataEngine>(() => context.engine)
    return engine
}
