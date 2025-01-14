# `useAlerts`

`useAlerts() → Alert[]`

## Alert

| Prop      | Type       | Description                                                                                                                                                                      |
| --------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `message` | `string`   | The alert message to display                                                                                                                                                     |
| `id`      | `number`   | Can be used as `key` when mapping over `alerts`                                                                                                                                  |
| `remove`  | `function` | Call this to remove the `alert`                                                                                                                                                  |
| `options` | `object`   | A configuration object that matches the props of the alert component, for example [a @dhis2/ui `AlertBar`](https://ui.dhis2.nu/#/api?id=coresrcalertbaralertbarproptypes-object) |

:::info Usage note
The DHIS2 app-shell wraps the app in an `AlertsProvider` and also includes an `Alerts` component which leverages `useAlerts` to show `AlertBars` in an `AlertStack` (`@dhis2/ui` components). So in a typical DHIS2 app the only hook used from the alerts-service is `useAlert`.
:::

## Standalone example

Below is a very basic example of how a non-platform app could use the alerts-service provider and hooks. For a more advanced implementation of a component that displays alerts with a hide/show animation, see [here](https://github.com/dhis2/app-platform/blob/master/adapter/src/components/Alerts.js).

```js
import { AlertsProvider, useAlert, useAlerts } from '@dhis2/alerts-service'

const Alerter = () => {
    const { show, hide } = useAlert('Hello world')

    return (
        <>
            <button onClick={show}>Show</button>
            <button onClick={hide}>Hide</button>
        </>
    )
}
const Alerts = () => {
    const alerts = useAlerts()

    return alerts.map((alert) => (
        <div key={alert.id}>
            {alert.message}
            <button onClick={alert.remove}>hide</button>
        </div>
    ))
}

const App = () => (
    <AlertsProvider>
        <Alerter />
        <Alerts />
    </AlertsProvider>
)
```
