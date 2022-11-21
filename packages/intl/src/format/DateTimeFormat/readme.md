# Date/Time Patterns

Patterns follow the rules defined in [UTS#35](https://www.unicode.org/reports/tr35/tr35-dates.html#Contents).
This implementation is however very simplified and only supports the most basic
date and time representations.

Any characters `[a-zA-Z]` are considered reserved and will be replaced by the
formatter (even if this implementation does not support a particular pattern).
Surround letters in single quotes `'` to escape them (to escape the quote itself
use a pair of consecutive quotes `''`).

## Supported patterns

\* - requires relevant translations to be provided at initialization.

| Pattern  | Description                                                | Examples                    |
|----------|------------------------------------------------------------|-----------------------------|
| `y`      | The year.                                                  | 1, 1999, 2022               |
| `yy`     | The last two digits of a year with padding.                | 01, 99, 22                  |
| `yyy...` | The year, padded to the specified length.                  | 001, 1999, 2022             |
| `M`      | The month.                                                 | 1, 2, 12                    |
| `MM`     | The month with padding.                                    | 01, 02, 12                  |
| `MMM` *  | The short name of the month.                               | Jan, Feb, Dec               |
| `MMMM` * | The long name of the month.                                | January, February, December |
| `d`      | The date.                                                  | 1, 2, 31                    |
| `dd`     | The date with padding.                                     | 01, 02, 31                  |
| `E` *    | The short name of the weekday.                             | Sun, Mon, Sat               |
| `EE` *   | Equivalent of `E`.                                         | Sun, Mon, Sat               |
| `EEE` *  | Equivalent of `E`.                                         | Sun, Mon, Sat               |
| `EEEE` * | The long name of the weekday.                              | Sunday, Monday, Saturday    |
| `a` *    | The period of the day.                                     | AM, PM                      |
| `h`      | The hour of a 12-hour clock, 12 is used instead of 0.      | 12, 1, 11                   |
| `hh`     | The hour of a 12-hour clock with padding.                  | 12, 01, 11                  |
| `H`      | The hour of a 24-hour clock.                               | 0, 1, 23                    |
| `HH`     | The hour of a 24-hour clock with padding.                  | 00, 01, 23                  |
| `m`      | The minutes.                                               | 1, 2, 59                    |
| `mm`     | The minutes with padding.                                  | 01, 02, 59                  |
| `s`      | The seconds.                                               | 1, 2, 59                    |
| `ss`     | The seconds with padding.                                  | 01, 02, 59                  |
| `X`      | The timezone offset as hours and optional minutes.         | Z, +01, -0130               |
| `XX`     | The timezone offset as hours and minutes.                  | Z, +0100, -0130             |
| `XXX`    | The timezone offset as hours and minutes separated by `:`. | Z, +01:00, -01:30           |
