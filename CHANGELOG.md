# Changelog

## 1.6.0 - 2017-04-19

- Dropped Jest in favor of `tape` (minimalistic testing)
- Refactor library to be ES5 instead of ES6
- Dropped chalk in favor of simpel `throw new Error()`
- Dropped `lodash.range` in favor of inline `range`

## 1.5.0 - 2017-02-09

- Default `option.indentifier` as `title`
- Fix keywords when undefined provided
- Fix bounding box not being detected (removed comma)
- Dropped Web mercator bounding box (not required)
- Ordered metadata xml (ServiceMetadataURL at the bottom)

## 1.2.0 - 2017-01-24

- Convert module into pure Javascript

## 1.1.0 - 2017-01-18

- Major refactoring
- Convert `xml-js` Element to Compact
- Testing, replaced Ava with Jest

## 1.0.1 - 2016-11-01

- Update xml-js 0.9.6 (issue with extra spaces)

## 1.0.0 - 2016-10-31

- First stable WMTS release
