# DHIS2 Application Runtime

[![npm](https://img.shields.io/npm/v/@dhis2/app-runtime.svg)](https://www.npmjs.com/package/@dhis2/app-runtime)
[![build](https://img.shields.io/travis/dhis2/app-runtime.svg?branch=master)](https://travis-ci.com/dhis2/app-runtime)
![Dependabot](https://badgen.net/dependabot/dhis2/app-runtime/?icon=dependabot)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Docs are available at [runtime.dhis2.nu](https://runtime.dhis2.nu).

## Development

```sh
> yarn test # runs yarn test on each directory under ./services, and also in ./runtime
> yarn build # runs yarn build on each directory under ./services, and then in ./runtime
> yarn start # builds all services, builds the runtime, and starts the query playground server
```

## Examples

A `create-react-app` example is available at [./examples/cra](./examples/cra). If running `yarn install` locally in the example directory, be sure to run it with `yarn install --force --check-files` so that it pulls in the runtime (specified as a `file:` dependency).

A query REPL platform application is also available at `./examples/query-playground`.

Running `yarn build` at root will automatically update the example app's copy, and running `yarn start` will build the runtime and then start the example.

A [`DHIS2 App Platform`](https://platform.dhis2.nu) example is available at [./examples/query-playground](./examples/query-playground). This is a full, deployable DHIS2 application and a live standalone version is available at [runtime.dhis2.nu/playground](https://runtime.dhis2.nu/playground)

## Release

Releases run automatically for every commit to the master branch using the [d2 cli](https://github.com/dhis2/cli).

**NEVER PUSH DIRECTLY TO `master`! ALL DEVELOPMENT IN THIS REPOSITORY IS THROUGH PULL REQUESTS**
