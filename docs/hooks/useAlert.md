# `useAlert`

`useAlert(message, options?) → { show, hide }`

## Hook arguments

| Name      | Type                   | Description                                                                                                 |
| --------- | ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `message` | `string` or `Function` | The message to display                                                                                      |
| `options` | `object` or `Function` | A configuration object for the alert. See [note](#note) below for usage instructions in DHIS2 platform-apps |

## Usage in apps built on the DHIS2 app platform

The DHIS2 app-shell comes with the alerts provider and a component to show `AlertBar`s in an `AlertStack` (a `@dhis2/ui` components), so in a typical DHIS2 platform app only the `useAlert` hook is used and it can be imported from `@dhis2/app-runtime`.

When used in an app build on the DHIS2 platform (using `@dhis2/cli-app-scripts`), the `options` argument should be an object with properties that match the [props of an `AlertBar`](/docs/ui/components/alertbar#props).

## Usage of the returned `show` function

`show(props?) → void`

### Static alerts

When the `useAlert` hook receives the `message` argument as a `string` and the `options` argument as an `object`, the `show` function should be called without any arguments, for example:

```js
// Create the alert
const { show } = useAlert('My alert message', { duration: 3000 })
// ...later (show the alert)
show()
```

When using static arguments calling `show` multiple times is a no-op.

### Dynamic alerts

When providing functions as arguments to the `useAlert` hook, it's possible to pass arbitrary arguments to the `show` function to make a more dynamic alert, for example:

```js
// Create the alert
const { show } = useAlert(
    ({ username }) => `Successfully deleted ${username}`,
    ({ isCurrentUser }) =>
        isCurrentUser ? { critical: true } : { success: true }
)
// ...later (show the alert)
show({ username: 'hendrik', isCurrentUser: true })

// message: "Successfully deleted hendrik"
// options: { critical: true }
```

When using dynamic arguments calling `show` multiple times will result in the alert being updated. It will retain its position in the array of alerts.

### Hybrid alerts

The two approaches can also be combined, i.e. having a static `message` and dynamic `options` or vice versa.

## Usage of the returned `hide` function

`hide() -> void`

Calling `hide` will immediately remove the alert from the list of alerts in the context.

If `hide` is called before `show` this is a no-op. When first calling `show`, then `hide` and then `show` the alert will re-appear, but it will have a different position in the alerts array because it gets added to the end.
