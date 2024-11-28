import { renderHook } from '@testing-library/react-hooks'
import * as React from 'react'
import { CustomDataProvider } from '../components/CustomDataProvider'
import { useDataEngine } from './useDataEngine'

describe('useDataEngine', () => {
    it('should preserve the referential identity of the engine', () => {
        const wrapper = ({ children }) => (
            <CustomDataProvider data={{}}>{children}</CustomDataProvider>
        )

        const { result, rerender } = renderHook(useDataEngine, { wrapper })
        const { current: firstEngineResult } = result

        rerender()
        const { current: secondEngineResult } = result

        expect(firstEngineResult).toBe(secondEngineResult)
    })
})
