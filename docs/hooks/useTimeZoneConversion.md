# useTimeZoneConversion Hook

Returns helper functions that help account for difference between client and server time zones.

## Background:

DHIS2 can be configured with a chosen server time zone and locale. Dates are stored in the server time zone, and any time and dates rules will be determined using the server time zone.

When using DHIS2 within one country with one time zone, instances will generally use the local time zone and hence will not need to account for the time zone difference between a user and the server. However, if a DHIS2 instance is used across multiple time zones, time zone differences should be accounted for; this hook allows for simplification of time zone logic.

## Basic Usage:

```jsx
import { useTimeZoneConversion } from '@dhis2/app-runtime'

// Within a functional component body or a custom hook
const { fromServerDate, fromClientDate } = useTimeZoneConversion()
```

## Output

|        Name        |    Type    | Description                                                                                                                                                                     |
| :----------------: | :--------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **fromServerDate** | _Function_ | accepts one date-like argument (date string, number, Date object) and returns a DHIS2Date object. If no argument is provided, returns a DHIS2Date corresponding to current time |
| **fromClientDate** | _Function_ | accepts one date-like argument (date string, number, Date object) and returns a DHIS2Date object. If no argument is provided, returns a DHIS2Date corresponding to current time |

Both `fromServerDate` and `fromClientDate` accept the same arguments as the JavaScript `Date()` constructor and return a DHIS2Date object (described below).

## DHIS2Date Object

The DHIS2Date object extends the native JavaScript Date object. Any methods or properties that exist on the native JavaScript Date object are also available on a DHIS2Date. Additionally, the following methods and properties are available:

|            Name             |           Type            | Description                                                                                                                                                                                                                                                                                                                                                                                   |
| :-------------------------: | :-----------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     **serverTimezone**      |    _property (string)_    | a string in the form `Area/Location` that denotes the server's timezone, e.g. `Africa/Freetown`                                                                                                                                                                                                                                                                                               |
|     **clientTimezone**      |    _property (string)_    | a string in the form `Area/Location` that denotes the client/browser's timezone, e.g. `Europe/Oslo`                                                                                                                                                                                                                                                                                           |
|      **serverOffset**       |    _property (number)_    | the difference in milliseconds between the wall-clock time in the server time zone and the client time zone.                                                                                                                                                                                                                                                                                  |
| **getServerZonedISOString** | _method (returns string)_ | method that takes no arguments and returns a string representation of the wall-clock time according to the server in ISO format. For example, if it is 3 February 2023 at 12:00 in the server time zone, `myDate.getServerZonedISOString()` will return `2023-02-03T12:00:00.000`                                                                                                             |
| **getClientZonedISOString** | _method (returns string)_ | method that takes no arguments and returns a string representation of the wall-clock time according to the browser in ISO format. For example, if it is 3 February 2023 at 12:00 in the server time zone (Africa/Freetown), but we are using our DHIS2 instance in Oslo, there will be a 1-hour time difference, and `myDate.getClientZonedISOString()` will return `2023-02-03T13:00:00.000` |

#### Note

Both `fromServerDate` and `fromClientDate` will return a `DHIS2Date` object corresponding to the _client/browser_ time zone. This is done so that the time encapsulated by the DHIS2Date object is the true time; JavaScript Date objects are ultimately the number of milliseconds since 1 January 1970 UTC. As such, the representation will be browser specific based on the browser's time zone.

This means, the same underlying value of `1675425600000` will be interpreted differently depending on the time zone.

-   `Fri Feb 03 2023 13:00:00` in Oslo (Norway)
-   `Fri Feb 03 2023 12:00:00` in Freetown (Sierra Leone)
-   `Sat Feb 04 2023 01:00:00` in Suva (Fiji).

In general, it is likely to be less error prone to consistently make comparisons in the browser's time zone (after correcting for time zone differences), so `fromServerDate` is the function applicable for must use cases. `fromClientDate` exists primarily to help get a string representation of the server time zone (see "fromClientDate / server time stamp representation" example below).

In advanced cases, you may also want to "trick" the browser into thinking that the wall-clock time for the server is actually the wall-clock time for the browser, in this case you can initialize a new date in conjunction with `fromClientDate` (see "fromClientDate / simulating server wall-clock time" example below)

## Examples

The following examples are some common cases in which you could use the `useServerTimeZone` or `useClientTimeZone` hooks.

### fromServerDate / relative time

This example illustrates one of the most typical situations for using the `useServerTimeZone` hook: displaying relative times where the timestamp returned by the server is in the server time zone.

In this example, if the user accessing the DHIS2 instance is in Makassar (Indonesia) (**GMT+9**), the server time zone is Jakarta (Indonesia) (**GMT+8**), and the user logs in at the current _local time_ of `14:30 on 17 November, 2022`, the server will record this as `2022-11-17T13:30:00.000`. Therefore, a comparison to now without adjusting for the server time zone will suggest that the user logged in '1 hour ago'. Correcting for the server time zone, will result in the appopriate relative time stamp of 'a few seconds ago'

```jsx
import React from 'react'
import moment from 'moment'
import { useDataQuery, useTimeZoneConversion } from '@dhis2/app-runtime'

const query = {
    me: {
        resource: 'me',
    },
}

const LastLoginMessage = () => {
    const { error, data } = useDataQuery(query)
    const { fromServerDate } = useTimeZoneConversion()
    const lastLoginClient = fromServerDate(data?.me?.userCredentials?.lastLogin)
    return (
        <div>
            {error && <span>{`ERROR: ${error.message}`}</span>}
            {data && lastLoginClient && (
                <span>
                    You last logged in: {moment(lastLoginClient).fromNow()}
                </span>
            )}
        </div>
    )
}
```

### fromClientDate / server time stamp representation

Generally, times are represented back to the user in the client time zone. In certain cases, however, you may want to show the user a representation of the time in the server time zone.

For example, if a user schedules a system job to run _two hours from "now"_ based on your local time, the user may want to know what time this is for the server (for example, to confirm that the server will be available at that time).

```jsx
import React from 'react'
import { useTimeZoneConversion } from '@dhis2/app-runtime'

const ScheduledJob = () => {
    const { fromClientDate } = useTimeZoneConversion()
    const scheduledTime = fromClientDate(Date.now())
    scheduledTime.setHours(scheduledTime.getHours() + 2) // advance the time to be two hours later

    return (
        <span>
            {`Your job is scheduled for: ${scheduledTime.getServerZonedISOString()} (${
                scheduledTime.serverTimezone
            })`}
        </span>
    )
}
```

### fromClientDate / simulating server wall-clock time

As mentioned above, `fromClientDate` will return a `DHIS2Date` object that corresponds to the client/browser's time zone. The primary purpose of the `fromClientDate` function is to allow one to get a string representation representing the server time zone (as illustrated in the previous example).

However, in certain advanced cases, you may need to initialize a date that behaves such that its wall-clock time representation is the same as the server's wall-clock time representation.

An example of this may be if you have a date/time selector and all of the date/times represent server date/times. You may want to limit this date/time selector to not allow selection of future dates/times. If you are in Oslo (Norway) and it is currently _12:00 on 17 May 2023_, and your server is in Abidjan (Côte d'Ivoire) where it is _10:00 17 May 2023_, then you may need a date that behaves as though it were _10:00 17 May 2023_ in Oslo. You can do this as follows:

:::note
This is an example cannot be copy/pasted unless you have implemented a component named MyCalendarImplementation
:::

```jsx

import React from 'react'
import { useTimeZoneConversion } from '@dhis2/app-runtime'
import MyCalendarImplementation from './MyCalendarImplementation'

const FakeTime = () => {
    const { fromClientDate } = useTimeZoneConversion()
    const now = fromClientDate() // initialize a date for "now"
    console.log(now) // this would display something like `Wed May 17 2023 12:00:00 GMT+0200 (Central European Summer Time)`
    const nowServer = new Date(now.getServerZonedISOString())
    console.log(nowServer) // this would display something like `Wed May 17 2023 10:00:00 GMT+0200 (Central European Summer Time)` (not the real time)

    return <MyCalendarImplementation limitDate={nowServer} />
}
```
:::note
In cases like the above, it is often better to rethink the approach and try to rely on client-representations of time. This will ensure that the dates used correspond to an actual true time representation.
:::