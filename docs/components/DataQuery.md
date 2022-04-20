# DataQuery Component

A thin wrapper around the [useDataQuery](hooks/useDataQuery.md) hook

## Basic Usage

```jsx
import { DataQuery } from '@dhis2/app-runtime'

// within a React component's JSX render tree
return (
    <DataQuery query={query}>
        {({ loading, error, data, refetch }) => {
            /* child render funtion */
        }}
    </DataQuery>
)
```

## Input Props

|         Name         |           Type            |   Required   | Description                                                                                                                |
| :------------------: | :-----------------------: | :----------: | -------------------------------------------------------------------------------------------------------------------------- |
|      **query**       | [_Query_](types/Query.md) | **required** | The Query definition describing the requested data                                                                         |
|    **variables**     |         _Object_          |              | Variables to be passed to the dynamic portions of the query                                                                |
|    **onComplete**    |        _Function_         |              | Callback function to be called on successfull completion of the query. Called with the response data as the only argument. |
|     **onError**      |        _Function_         |              | Callback function to be called on failure of the query. Called with the error instance as the only argument.               |
|       **lazy**       |         _boolean_         |              | If true, wait until `refetch` is called before fetching data.<br/>_**Default**: `false`_                                   |
| **keepPreviousData** |         _boolean_         |              | If true, return data from last successful query during refetch.<br/>_**Default**: `false`_                                 |

## Render Function Props

|    Name     |                 Type                 | Description                                                                                                                                                                            |
| :---------: | :----------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **called**  |              _boolean_               | **true** if the data request has been initiated with either `lazy: false` or `refetch()` at least once                                                                                 |
| **loading** |              _boolean_               | **true** if the data is not yet available and no error has yet been encountered                                                                                                        |
|  **error**  |    _Error_<br/>or<br/>_undefined_    | **undefined** if no error has occurred, otherwise the Error which was thrown                                                                                                           |
|  **data**   | _QueryResult_<br/>or<br/>_undefined_ | **undefined** if the data is loading or an error has occurred, otherwise a map from the name of each **QueryDefinition** defined in the **Query** to the resulting data for that query |
| **refetch** |              _Function_              | This function can be called to refetch the data. Any in-flight HTTP requests will automatically be aborted.                                                                            |
| **engine**  | [_Data Engine_](advanced/DataEngine) | A reference to the DataEngine instance                                                                                                                                                 |

## Example

```jsx
import React from 'react'
import { DataQuery } from '@dhis2/app-runtime'

const query = {
    indicators: {
        resource: 'indicators',
        params: ({ count }) => ({
            order: 'shortName:desc',
            pageSize: count,
        })
    },
}
export const IndicatorList = ({ count }) => (
    <DataQuery query={query} variables={{ count }}>
        {({ loading, error, data }) => (
            <h3>Indicators (first {count})</h3>
            {loading && <span>...</span>}
            {error && <span>{`ERROR: ${error.message}`}</span>}
            {data && (
                <pre>
                    {data.indicators.indicators
                        .map(ind => ind.displayName)
                        .join('\n')}
                </pre>
            )}
        )}
    </DataQuery>
)
```
