# Plugin Component

:::info Experimental
This component is experimental and is available for import from `@dhis2/app-runtime/experimental`. The api for this component is not guaranteed to be stable.
:::

A wrapper that creates an iframe for a specified plugin and establishes a two-way communication channel with said plugin, allowing you to pass props (including callbacks between an app and a plugin). Note that the plugin must be built using the app-platform with entryPoints.plugin specified in the d2.config.js file.

## Basic Usage (Defining a plugin within an app)

Within an app you can specify a plugin (either by providing its short name `pluginShortName`, or by specifying a URL directly (`pluginSource`). If you have provided `pluginSource`, this will take precedence.

```jsx
import { Plugin } from '@dhis2/app-runtime/experimental'

// within the app
const MyApp = () => (
    <Plugin
        pluginShortName={'myPluginShortName'}
        onError={(err) => {
            console.error(err)
        }}
        showAlertsInPlugin={true}
        numberToPass={'42'}
        callbackToPass={({ name }) => {
            console.log(`Hi ${name}!`)
        }}
    />
)
```

## Basic Usage (Using properties from the parent app)

You must build your plugin with the app-platform. If you have done this, your entry component will be passed the props from the parent app. From the example above, the properties `numberToPass` and `callbackToPass` will be available in the build plugin (when it is rendered with a `<Plugin>` component).

```jsx
// your plugin entry point (the plugin itself)

const MyPlugin = (propsFromParent) => {
    const { numberToPass, callbackToPass: sayHi } = propsFromParent
    return (
        <>
            <p>{`The meaning of life is: ${numberToPass}`}</p>
            <button onClick={() => sayHi({ name: 'Arthur Dent' })}>
                Say hi
            </button>
        </>
    )
}
```

## Plugin Props (reserved props)

|          Name          |        Type        |                    Required                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :--------------------: | :----------------: | :---------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  **pluginShortName**   |      _string_      |  _required_ if `pluginSource` is not provided   | The shortName of the app/plugin you wish to load (matching the result from api/apps). Used to look up the plugin entry point. If this is not provided, `pluginSource` must be provided. `pluginSource` will take precedence if provided.                                                                                                                                                                                                                                                                                                                                         |
|    **pluginSource**    |   _string_ (url)   | _required_ if `pluginShortName` is not provided | The URL of the plugin. If this is not provided, `pluginShortName` must be provided.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
|      **onError**       |     _Function_     |                   _optional_                    | Callback function to be called when an error in the plugin triggers an error boundary. You can use this to pass an error back up to the app and create a custom handling/UX if errors occur in the plugin. In general, it is recommended that you use the plugin's built-in error boundaries                                                                                                                                                                                                                                                                                     |
| **showAlertsInPlugin** |     _boolean_      |                   _optional_                    | If `true`, any alerts within the plugin (defined with the `useAlert` hook) will be rendered within the iframe. By default, this is `false`. It is recommended, in general, that you do not override this and allow alerts to be hoisted up to the app level                                                                                                                                                                                                                                                                                                                      |
|       **height**       | _string or number_ |                   _optional_                    | If a height is provided, the iframe will be fixed to the specified height. It can be any valid CSS dimension. By default, if no height is provided, the iframe will automatically resize its height based on its contents, in order to match the behavior of a normal block element. The value of `height` will not be passed to the plugin, as it is in an internal implementation detail. If you do need to also pass the height to the plugin, you can pass another variable (e.g. `pluginHeight`).                                                                           |
|       **width**        | _string or number_ |                   _optional_                    | Width for the `iframe` element to use; can be any valid CSS dimension. The default is `100%` to approximate the behavior of a normal block element (but not quite, since `auto` is the default for blocks, but that doesn't work for `iframe`s). If you want the width to resize based on the size of the Plugin's contents, use the `contentWidth` prop instead. The value of `width` will not be passed to the plugin, as it is in an internal implementation detail. If you do need to also pass the width to the plugin, you can pass another variable (e.g. `pluginWidth`). |
|    **contentWidth**    |      _string_      |                   _optional_                    | Set this if you want the width of the iframe to be driven by the contents inside the plugin. The value provided here will be used as the `width` of a `div` wrapping the plugin contents, which will be watched with a resize observer to update the size of the iframe according to the plugin content width. Therefore, **`'max-content'`** is probably the value you want to use for this prop. `'fit-content'` or `'min-content'` may also work, depending on your use case.                                                                                                 |
|     **className**      |      _string_      |                   _optional_                    | A `className` value to be used on the `iframe` element to add styles. Sizing styles will take precedence over `width` and `height` props. Flex styles can be used, for example. **NB:** If you want to use this to add a margin, and you're using default width (or have set it `100%` yourself), you should instead wrap the `Plugin` with a div and add the margin on that div to approximate normal behavior of a block element                                                                                                                                               |

## Plugin Props (custom props)

You can specify pass any other props on the `<Plugin>` component and these will be passed down to the plugin (provided it was built with app-platform). When props are updated, they will be passed back down to the plugin. This mimics the behaviour of a normal React component, and hence you should provide stable references as needed to prevent rerendering.

## Extended example

See these links for an extended example of how `<Plugin>` component can be used within an [app](https://github.com/tomzemp/workingplugin/blob/plugin-wrapper-in-platform/src/App.js) and consumed within the [plugin](https://github.com/tomzemp/workingplugin/blob/plugin-wrapper-in-platform/src/Plugin.js).
