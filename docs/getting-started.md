# Getting Started

[![npm](https://img.shields.io/npm/v/@dhis2/app-runtime.svg)](https://www.npmjs.com/package/@dhis2/app-runtime)

The DHIS2 application runtime provides a common, consistent, single-dependency runtime dependency for DHIS2 applications. It is published as `@dhis2/app-runtime` on [npm](https://www.npmjs.com/package/@dhis2/app-runtime)

## Installation

To use App Runtime in your project, install it as a dependency using `yarn`:

```bash
yarn add @dhis2/app-runtime
```

:::info
Please ensure that all webpack bundles reference the same instance of `@dhis2/app-runtime`. We recommmend running `npx yarn-deduplicate --packages @dhis2/app-runtime`. Libraries should include `@dhis2/app-runtime` as a `peerDependency`.
:::

## Requirements

### React >= 16.8

This library uses the official React Context API (introduced in 16.3) and React Hooks (introduced in 16.8), so **React >= 16.8 is required** to use it. Visit [reactjs.org](https://reactjs.org) to learn about React development.

### Polyfills

The following must be polyfilled to support older and non-compliant browsers (i.e. IE11):

-   es6.promise (i.e. [core-js/features/promise](https://github.com/zloirock/core-js))
-   window.fetch (i.e. [whatwg-fetch](https://github.com/github/fetch))
-   AbortController / AbortSignal (i.e. [abortcontroller-polyfill](https://www.npmjs.com/package/abortcontroller-polyfill))
