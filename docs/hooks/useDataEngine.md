# useDataEngine hook

Get access to the [Data Engine](../advanced/DataEngine.md) instance for non-React contexts.

## Basic Usage:

```jsx
import { useDataEngine } from '@dhis2/app-runtime'

// Within a functional component body
const engine = useDataEngine()

// later...
engine.query(query)
engine.mutate(mutation, {
    variables: {
        id: 'xyz123',
    },
})
```

:::info
See [Using with Redux](../advanced/redux.md) for an advanced example
:::