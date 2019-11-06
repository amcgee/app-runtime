# Hooks

The DHIS2 Application Runtime supports [React Hooks](https://reactjs.org/docs/hooks-intro.html) (introduced in React 16.8). The following hooks are supported:

-   [**useConfig**](hooks/useConfig) - Access the raw application configuration object
-   [**useDataQuery**](hooks/useDataQuery) - Fetch data from the DHIS2 Core server API without worrying about HTTP requests!
-   [**useDataMutation**](hooks/useDataMutation) - Mutate resources in the DHIS2 Core server API without worrying about HTTP requests!
-   [**useDataEngine**](hooks/useDataEngine) _(Advanced)_ - Access the underlying [Data Engine](advanced/DataEngine) instance

While these Hooks are incredibly powerful and usually preferable, some [Components](components/) are also provided which conveniently wrap their corresponding Hooks.
