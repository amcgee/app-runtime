---
title: How to use useDataQuery in your App
sidebar_label: How to use useDataQuery
---

To fetch data in your DHIS2 Web Application, you can use the `useDataQuery` hook from the `@dhis2/app-runtime` library. This React hook simplifies the process of fetching data from the DHIS2 API. There's no need to make API calls manually using `fetch` because the `useDataQuery` hook handles this for you, including authentication.

In this guide, we'll walk you through, step by step, how to use the `useDataQuery` hook in your application to fetch data from the DHIS2 API. We'll be fetching Organisation Units and applying several filters to the query.

## Prerequisites

To be able to use the `useDataQuery` hook in your application, you need to have the following:

- A web application built using the DHIS2 Application Platform
- A basic understanding of React hooks

If you do not yet have a web application built using the DHIS2 Application Platform, you can follow the [Getting Started](/docs/quickstart/quickstart-web) guide to create a new application.

## Step 1: Import the `useDataQuery` hook

The first step is to import the `useDataQuery` hook from the `@dhis2/app-runtime` library. You can do this by adding the following import statement at the top of your component file:

```jsx
import { useDataQuery } from '@dhis2/app-runtime';
```

Now that you have imported the `useDataQuery` hook, you can use it in your component to fetch data from the DHIS2 API.

## Step 2: Define the query

The next step is to define the query that you want to execute. The query is an object that contains the properties of the data you want to fetch. In this example, we'll be fetching Organisation Units from the DHIS2 API.

You should define the query outside the render loop, such as on top of your file. This is because the query object is a static object that doesn't change during the lifecycle of the component.

```js
// highlight-start
const query = {
    orgUnits: {
        resource: 'organisationUnits',
        params: {
            fields: ['id', 'displayName', 'level'],
            paging: true
        }
    }
};
// highlight-end

const App() => {
    
}
```

In the query object above, we define a property called `orgUnits` that contains the details of the query. The `resource` property specifies the endpoint of the API that we want to fetch data from. The `params` property contains additional parameters that we want to apply to the query, such as the fields we want to fetch and whether we want to paginate the results.

We've enabled pagination by setting the `paging` property to `true`. This means that the results will be paginated, and we'll only get a subset of the results. This is the recommended approach as it is lighter on both the server and uses less data. We'll explain pagination at a later step in this guide.

## Step 3: Execute the query

Now that we have defined the query, we can execute it using the `useDataQuery` hook. The `useDataQuery` hook takes the query object as an argument and returns an object containing the data, error, and loading state of the query.

```jsx

const query = {}; // defined query object as explained in step 2

const App() => {
    // highlight-start
    const { loading, error, data } = useDataQuery(query);
    // highlight-end
}
```

In the code above, we use object destructuring to extract the `loading`, `error`, and `data` properties from the object returned by the `useDataQuery` hook. The `loading` property indicates whether the query is still loading, the `error` property contains any error that occurred during the query, and the `data` property contains the data returned by the query.

## Step 4: Display the data

Now that we have fetched the data, we can display the data returned by the query in our component. We can use the `loading` and `error` properties to conditionally render the data based on the state of the query.

```jsx
// use the CircularLoader component from the @dhis2/ui library
import { CircularLoader } from '@dhis2/ui';

const App() => {
    // highlight-start
    // show an error when the query fails
    if (error) {
        return <span>ERROR: {error.message}</span>;
    }

    // show a loading spinner while the query is loading
    if (loading) {
        return <CircularLoader />;
    }

    if (!data?.orgUnits?.organisationUnits?.length) {
        return <span>No organisation units found</span>
    }

    // show the data when the query is successful
    return (
        <>
            <h1>Organisation Units</h1>
            <ul>
                {data.orgUnits.organisationUnits.map(orgUnit => (
                    <li key={orgUnit.id}>{orgUnit.displayName}</li>
                ))}
            </ul>
        </>
    );
    // highlight-end
}
```

In the code above, we first check if there is an error by checking the `error` property. If there is an error, we display the error message. Next, we check if the query is still loading by checking the `loading` property. If the query is still loading, we display a loading spinner. Finally, if the query is successful, we display the data returned by the query.

:::note
We're expecting data to be in `data.orgUnits`, this is because the query object we defined in step 2 is called `orgUnits`.
:::

Keep in mind that the structure of the data returned by the query may vary depending on the query you execute. In this example, we are fetching Organisation Units, so the data returned by the query contains an `organisationUnits` property that contains an array of Organisation Units. We're also assuming the data structure is always the same. This is not really defensive programming, so you should always check if the data is in the expected format.

For this reason we've added this check in the code above:

```jsx
if (!data?.orgUnits?.organisationUnits?.length) {
```

This code checks if the `orgUnits` property exists in the `data` object, if the `organisationUnits` property exists in the `orgUnits` object, and if the `organisationUnits` array has a length greater than 0. If any of these conditions are not met, we display a message indicating that no Organisation Units were found.

:::info Defensive programming
Defensive programming is a practice where you write code that anticipates and handles errors. This can help prevent your application from crashing when unexpected errors occur. Always check if the data is in the expected format before using it in your application, even if you trust the source the data is coming from.
:::

## Step 5: Apply pagination

In the query object, you can specify the `paging` property to paginate the results. By default, the `paging` property is set to `true`, which means that the results will be paginated. You can specify the `pageSize` property to control the number of items per page.

```js

const query = {
    orgUnits: {
        resource: 'organisationUnits',
        params: {
            fields: ['id', 'displayName', 'level'],
            paging: true,
            pageSize: 10
        }
    }
};
```

In the code above, we set the `paging` property to `true` and the `pageSize` property to `10`, which means that the results will be paginated with 10 items per page. You can use the `page` property to specify the page number you want to fetch.

```js

const query = {
    orgUnits: {
        resource: 'organisationUnits',
        params: {
            fields: ['id', 'displayName', 'level'],
            paging: true,
            pageSize: 10,
            page: 2
        }
    }
};
```

In the code above, we set the `page` property to `2`, which means that we want to fetch the second page of results, so we'll be getting results 11-20. You can use the `pageCount` property to get the total number of pages available.

```js
const pageCount = data.orgUnits.pager.pageCount;
```

:::note `pageCount` not always available
The `pageCount` property is not always available in the response. You should check if the property exists before using it in your application.
:::

## Step 6: Apply filters

You can apply filters to the query to filter the results based on certain criteria. You can use the `filter` property to specify the filters you want to apply. In this example we'll be filtering the Organisation Units where the name contains the word "health".

```js

const query = {
    orgUnits: {
        resource: 'organisationUnits',
        params: {
            fields: ['id', 'displayName', 'level'],
            filter: 'displayName:like:health',
        }
    }
};
```

Executing the query above will return all Organisation Units where the name contains the word "health". You can use the `filter` property to apply more complex filters by supplying an array of filter criteria. In this example, we'll be filtering the Organisation Units where the name contains the word "health" and the level is 4.

```js

const query = {
    orgUnits: {
        resource: 'organisationUnits',
        params: {
            fields: ['id', 'displayName', 'level'],
            filter: ['displayName:ilike:health','level:eq:4'],
        }
    }
};
```

:::info
Filtering can be applied to every property of the resource you are querying. Always check the API documentation to see which filters are available for the resource you are querying.
:::

## Conclusion

In this guide, we walked you through how to use the `useDataQuery` hook in your application to fetch data from the DHIS2 API. We covered how to define a query, execute the query, display the data, apply pagination, and apply filters to the query. By following these steps, you can fetch data from the DHIS2 API in your application with ease. You can now use this knowledge to fetch data from the DHIS2 API in your application and display it to your users, for every API endpoint available in the DHIS2 API.