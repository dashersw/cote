# Changelog

## [v1.0.2](https://github.com/dashersw/cote/tree/v1.0.2) (2020-11-16)

[Full Changelog](https://github.com/dashersw/cote/compare/v1.0.1...v1.0.2)

**Merged pull requests:**

- Update deps and ava [\#232](https://github.com/dashersw/cote/pull/232) ([dashersw](https://github.com/dashersw))

## [v1.0.1](https://github.com/dashersw/cote/tree/v1.0.1) (2020-11-16)

[Full Changelog](https://github.com/dashersw/cote/compare/v1.0.0...v1.0.1)

**Merged pull requests:**

- Bugfix responding to wildcard events with promises [\#230](https://github.com/dashersw/cote/pull/230) ([jessety](https://github.com/jessety))

## [v1.0.0](https://github.com/dashersw/cote/tree/v1.0.0) (2019-12-29)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.21.1...v1.0.0)

**Release cote version 1.0.0.**

Cote has been stable and backwards compatible since the very first commit, with the exception of deprecating older Node.js versions. It hasn't received new major features in the past year, and with all its users and community, it's now time to release this version as 1.0.0.

With this release cote drops support for Node.js version 6 and 8, which allows us to remove Babel transpilation which was only used for the object spread operator.

**Breaking changes:**

- Require minimum Node.js version of 10 and remove babel transpiling [\#207](https://github.com/dashersw/cote/pull/207) ([dashersw](https://github.com/dashersw))

**Implemented enhancements:**

- Add changelog [\#208](https://github.com/dashersw/cote/pull/208) ([dashersw](https://github.com/dashersw))
- Added NodeJS 12 support [\#194](https://github.com/dashersw/cote/pull/194) ([gnought](https://github.com/gnought))
- Fixed prepublish that deprecated in npm@5 [\#192](https://github.com/dashersw/cote/pull/192) ([gnought](https://github.com/gnought))
- Fixed missing err argument in client.js example [\#191](https://github.com/dashersw/cote/pull/191) ([gnought](https://github.com/gnought))

**Closed issues:**

- Missing change log and release notes. [\#181](https://github.com/dashersw/cote/issues/181)

## [v0.21.1](https://github.com/dashersw/cote/tree/v0.21.1) (2019-09-29)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.21.0...v0.21.1)

## [v0.21.0](https://github.com/dashersw/cote/tree/v0.21.0) (2019-09-28)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.20.3...v0.21.0)

## [v0.20.3](https://github.com/dashersw/cote/tree/v0.20.3) (2019-09-28)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.20.2...v0.20.3)

## [v0.20.2](https://github.com/dashersw/cote/tree/v0.20.2) (2019-09-28)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.20.1...v0.20.2)

**Implemented enhancements:**

- Log a warning to the console if there are no handlers for a specific event [\#168](https://github.com/dashersw/cote/issues/168)

**Merged pull requests:**

- feature: Log message when no listener for event [\#189](https://github.com/dashersw/cote/pull/189) ([otothea](https://github.com/otothea))

## [v0.20.1](https://github.com/dashersw/cote/tree/v0.20.1) (2019-08-11)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.20.0...v0.20.1)

**Closed issues:**

- Document the use of DISCOVERY\_HOSTNAME environment variable [\#160](https://github.com/dashersw/cote/issues/160)

**Merged pull requests:**

- Improve docs around redis and DISCOVERY\_HOSTNAME [\#170](https://github.com/dashersw/cote/pull/170) ([drubin](https://github.com/drubin))

## [v0.20.0](https://github.com/dashersw/cote/tree/v0.20.0) (2019-04-07)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.19.1...v0.20.0)

**Implemented enhancements:**

- Add colors to colorless code blocks [\#158](https://github.com/dashersw/cote/pull/158) ([ScottRudiger](https://github.com/ScottRudiger))

## [v0.19.1](https://github.com/dashersw/cote/tree/v0.19.1) (2019-02-05)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.19.0...v0.19.1)

## [v0.19.0](https://github.com/dashersw/cote/tree/v0.19.0) (2019-01-25)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.18.4...v0.19.0)

**Merged pull requests:**

- Add ability to target subgroups of Requesters [\#150](https://github.com/dashersw/cote/pull/150) ([pelzerim](https://github.com/pelzerim))
- Using PM2 Cluster Properly - README [\#149](https://github.com/dashersw/cote/pull/149) ([knoxcard](https://github.com/knoxcard))

## [v0.18.4](https://github.com/dashersw/cote/tree/v0.18.4) (2019-01-06)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.18.3...v0.18.4)

## [v0.18.3](https://github.com/dashersw/cote/tree/v0.18.3) (2018-12-24)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.18.2...v0.18.3)

## [v0.18.2](https://github.com/dashersw/cote/tree/v0.18.2) (2018-12-24)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.18.1...v0.18.2)

## [v0.18.1](https://github.com/dashersw/cote/tree/v0.18.1) (2018-12-23)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.18.0...v0.18.1)

**Merged pull requests:**

- More documentation for Sockend [\#132](https://github.com/dashersw/cote/pull/132) ([matejthetree](https://github.com/matejthetree))

## [v0.18.0](https://github.com/dashersw/cote/tree/v0.18.0) (2018-10-03)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.17.5...v0.18.0)

## [v0.17.5](https://github.com/dashersw/cote/tree/v0.17.5) (2018-10-03)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.17.4...v0.17.5)

## [v0.17.4](https://github.com/dashersw/cote/tree/v0.17.4) (2018-10-03)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.17.3...v0.17.4)

**Merged pull requests:**

- Add timeout to request [\#125](https://github.com/dashersw/cote/pull/125) ([cakuki](https://github.com/cakuki))

## [v0.17.3](https://github.com/dashersw/cote/tree/v0.17.3) (2018-09-30)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.17.2...v0.17.3)

## [v0.17.2](https://github.com/dashersw/cote/tree/v0.17.2) (2018-09-30)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.17.1...v0.17.2)

**Merged pull requests:**

- update readme.md [\#127](https://github.com/dashersw/cote/pull/127) ([matejthetree](https://github.com/matejthetree))
- Update README.md [\#124](https://github.com/dashersw/cote/pull/124) ([roblabat](https://github.com/roblabat))
- Update README.md [\#121](https://github.com/dashersw/cote/pull/121) ([matejthetree](https://github.com/matejthetree))
- Update README.md [\#120](https://github.com/dashersw/cote/pull/120) ([matejthetree](https://github.com/matejthetree))

## [v0.17.1](https://github.com/dashersw/cote/tree/v0.17.1) (2018-08-19)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.17.0...v0.17.1)

## [v0.17.0](https://github.com/dashersw/cote/tree/v0.17.0) (2018-06-25)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.16.2...v0.17.0)

**Merged pull requests:**

- Sockend rooms with message as wrapper [\#104](https://github.com/dashersw/cote/pull/104) ([orrgal1](https://github.com/orrgal1))
- Updated the broadcast address [\#94](https://github.com/dashersw/cote/pull/94) ([tk120404](https://github.com/tk120404))

## [v0.16.2](https://github.com/dashersw/cote/tree/v0.16.2) (2018-02-19)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.16.1...v0.16.2)

## [v0.16.1](https://github.com/dashersw/cote/tree/v0.16.1) (2017-12-19)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.16.0...v0.16.1)

## [v0.16.0](https://github.com/dashersw/cote/tree/v0.16.0) (2017-11-29)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.15.1...v0.16.0)

**Merged pull requests:**

- renamed Requester to Responder [\#67](https://github.com/dashersw/cote/pull/67) ([robophil](https://github.com/robophil))

## [v0.15.1](https://github.com/dashersw/cote/tree/v0.15.1) (2017-07-09)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.15.0...v0.15.1)

## [v0.15.0](https://github.com/dashersw/cote/tree/v0.15.0) (2017-07-09)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.14.1...v0.15.0)

## [v0.14.1](https://github.com/dashersw/cote/tree/v0.14.1) (2017-06-04)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.14.0...v0.14.1)

## [v0.14.0](https://github.com/dashersw/cote/tree/v0.14.0) (2017-06-04)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.13.2...v0.14.0)

**Implemented enhancements:**

- Quit retrying connection after a set amount of tries / time [\#16](https://github.com/dashersw/cote/issues/16)

**Merged pull requests:**

- ES6 rewrite [\#45](https://github.com/dashersw/cote/pull/45) ([dashersw](https://github.com/dashersw))
- Fix \#34 Check statusLogsEnabled option when logging online status [\#40](https://github.com/dashersw/cote/pull/40) ([otothea](https://github.com/otothea))

## [v0.13.2](https://github.com/dashersw/cote/tree/v0.13.2) (2017-05-08)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.13.1...v0.13.2)

## [v0.13.1](https://github.com/dashersw/cote/tree/v0.13.1) (2017-05-08)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.13.0...v0.13.1)

## [v0.13.0](https://github.com/dashersw/cote/tree/v0.13.0) (2017-04-27)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.12.1...v0.13.0)

**Closed issues:**

- Add Promise support [\#36](https://github.com/dashersw/cote/issues/36)

## [v0.12.1](https://github.com/dashersw/cote/tree/v0.12.1) (2017-04-26)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.12.0...v0.12.1)

## [v0.12.0](https://github.com/dashersw/cote/tree/v0.12.0) (2017-04-26)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.11.0...v0.12.0)

**Closed issues:**

- Implement preliminary internal queue for requesters [\#24](https://github.com/dashersw/cote/issues/24)

## [v0.11.0](https://github.com/dashersw/cote/tree/v0.11.0) (2017-04-20)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.10.1...v0.11.0)

## [v0.10.1](https://github.com/dashersw/cote/tree/v0.10.1) (2017-04-20)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.10.0...v0.10.1)

**Implemented enhancements:**

- Add a GUI for Monitor component [\#9](https://github.com/dashersw/cote/issues/9)

## [v0.10.0](https://github.com/dashersw/cote/tree/v0.10.0) (2017-02-05)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.9.3...v0.10.0)

## [v0.9.3](https://github.com/dashersw/cote/tree/v0.9.3) (2017-01-20)

[Full Changelog](https://github.com/dashersw/cote/compare/monitoring-tool...v0.9.3)

## [monitoring-tool](https://github.com/dashersw/cote/tree/monitoring-tool) (2016-08-24)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.9.2...monitoring-tool)

## [v0.9.2](https://github.com/dashersw/cote/tree/v0.9.2) (2016-08-24)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.9.1...v0.9.2)

**Merged pull requests:**

- Fix some of the linter issues [\#26](https://github.com/dashersw/cote/pull/26) ([frontconnect](https://github.com/frontconnect))

## [v0.9.1](https://github.com/dashersw/cote/tree/v0.9.1) (2016-07-15)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.9.0...v0.9.1)

## [v0.9.0](https://github.com/dashersw/cote/tree/v0.9.0) (2016-07-12)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.8.8...v0.9.0)

## [v0.8.8](https://github.com/dashersw/cote/tree/v0.8.8) (2016-07-11)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.8.7...v0.8.8)

## [v0.8.7](https://github.com/dashersw/cote/tree/v0.8.7) (2016-06-22)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.8.6...v0.8.7)

## [v0.8.6](https://github.com/dashersw/cote/tree/v0.8.6) (2016-06-22)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.8.5...v0.8.6)

**Closed issues:**

- Let components use hostnames when establishing connection [\#25](https://github.com/dashersw/cote/issues/25)

## [v0.8.5](https://github.com/dashersw/cote/tree/v0.8.5) (2016-06-21)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.8.4...v0.8.5)

## [v0.8.4](https://github.com/dashersw/cote/tree/v0.8.4) (2016-04-06)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.8.3...v0.8.4)

## [v0.8.3](https://github.com/dashersw/cote/tree/v0.8.3) (2016-04-03)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.8.2...v0.8.3)

**Merged pull requests:**

- Fix for leaking socket connections [\#21](https://github.com/dashersw/cote/pull/21) ([dmitry-ilin](https://github.com/dmitry-ilin))

## [v0.8.2](https://github.com/dashersw/cote/tree/v0.8.2) (2016-03-28)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.8.1...v0.8.2)

**Merged pull requests:**

- feature\(port\): Adds advertisement port option [\#20](https://github.com/dashersw/cote/pull/20) ([kenjones-cisco](https://github.com/kenjones-cisco))

## [v0.8.1](https://github.com/dashersw/cote/tree/v0.8.1) (2016-02-20)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.8.0...v0.8.1)

**Implemented enhancements:**

- Allow disabling monitor screen [\#18](https://github.com/dashersw/cote/issues/18)
- Add health checks and monitoring [\#17](https://github.com/dashersw/cote/issues/17)

## [v0.8.0](https://github.com/dashersw/cote/tree/v0.8.0) (2016-02-20)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.7.2...v0.8.0)

## [v0.7.2](https://github.com/dashersw/cote/tree/v0.7.2) (2016-01-14)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.7.1...v0.7.2)

## [v0.7.1](https://github.com/dashersw/cote/tree/v0.7.1) (2016-01-14)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.7.0...v0.7.1)

**Closed issues:**

- Implement key prefixes as global config [\#15](https://github.com/dashersw/cote/issues/15)

## [v0.7.0](https://github.com/dashersw/cote/tree/v0.7.0) (2016-01-12)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.6.3...v0.7.0)

## [v0.6.3](https://github.com/dashersw/cote/tree/v0.6.3) (2015-12-01)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.6.2...v0.6.3)

## [v0.6.2](https://github.com/dashersw/cote/tree/v0.6.2) (2015-11-19)

[Full Changelog](https://github.com/dashersw/cote/compare/v0.6.1...v0.6.2)

## [v0.6.1](https://github.com/dashersw/cote/tree/v0.6.1) (2015-11-06)

[Full Changelog](https://github.com/dashersw/cote/compare/0.6.0...v0.6.1)

## [0.6.0](https://github.com/dashersw/cote/tree/0.6.0) (2015-05-06)

[Full Changelog](https://github.com/dashersw/cote/compare/0.5.10...0.6.0)

**Merged pull requests:**

- Put an upper limit to the node engine versions. [\#10](https://github.com/dashersw/cote/pull/10) ([mertdogar](https://github.com/mertdogar))

## [0.5.10](https://github.com/dashersw/cote/tree/0.5.10) (2015-03-26)

[Full Changelog](https://github.com/dashersw/cote/compare/0.5.9...0.5.10)

## [0.5.9](https://github.com/dashersw/cote/tree/0.5.9) (2015-03-26)

[Full Changelog](https://github.com/dashersw/cote/compare/0.5.8...0.5.9)

## [0.5.8](https://github.com/dashersw/cote/tree/0.5.8) (2015-03-26)

[Full Changelog](https://github.com/dashersw/cote/compare/0.5.7...0.5.8)

**Merged pull requests:**

- Update socket.io version from 0.9.14 to 1.0.6. [\#7](https://github.com/dashersw/cote/pull/7) ([mehmettamturk](https://github.com/mehmettamturk))
- Update benchmark, wait for socket connection to start testing [\#6](https://github.com/dashersw/cote/pull/6) ([mertcetin](https://github.com/mertcetin))
- Benchmarks [\#5](https://github.com/dashersw/cote/pull/5) ([mertcetin](https://github.com/mertcetin))

## [0.5.7](https://github.com/dashersw/cote/tree/0.5.7) (2014-04-26)

[Full Changelog](https://github.com/dashersw/cote/compare/0.5.6...0.5.7)

## [0.5.6](https://github.com/dashersw/cote/tree/0.5.6) (2014-04-24)

[Full Changelog](https://github.com/dashersw/cote/compare/0.5.5...0.5.6)

## [0.5.5](https://github.com/dashersw/cote/tree/0.5.5) (2014-04-21)

[Full Changelog](https://github.com/dashersw/cote/compare/0.5.4...0.5.5)

**Merged pull requests:**

- Average response time fix [\#4](https://github.com/dashersw/cote/pull/4) ([mertcetin](https://github.com/mertcetin))

## [0.5.4](https://github.com/dashersw/cote/tree/0.5.4) (2014-04-14)

[Full Changelog](https://github.com/dashersw/cote/compare/0.5.3...0.5.4)

**Merged pull requests:**

- Callbacks are called with the passed error value for error propagation [\#3](https://github.com/dashersw/cote/pull/3) ([mertcetin](https://github.com/mertcetin))

## [0.5.3](https://github.com/dashersw/cote/tree/0.5.3) (2014-04-14)

[Full Changelog](https://github.com/dashersw/cote/compare/0.5.2...0.5.3)

**Merged pull requests:**

- TimeBalancedRequester [\#2](https://github.com/dashersw/cote/pull/2) ([mertcetin](https://github.com/mertcetin))

## [0.5.2](https://github.com/dashersw/cote/tree/0.5.2) (2014-04-10)

[Full Changelog](https://github.com/dashersw/cote/compare/0.5.1...0.5.2)

## [0.5.1](https://github.com/dashersw/cote/tree/0.5.1) (2014-04-04)

[Full Changelog](https://github.com/dashersw/cote/compare/0.5.0...0.5.1)

## [0.5.0](https://github.com/dashersw/cote/tree/0.5.0) (2014-04-01)

[Full Changelog](https://github.com/dashersw/cote/compare/0.4.10...0.5.0)

**Merged pull requests:**

- TimeBalancedRequester [\#1](https://github.com/dashersw/cote/pull/1) ([mertcetin](https://github.com/mertcetin))

## [0.4.10](https://github.com/dashersw/cote/tree/0.4.10) (2014-03-27)

[Full Changelog](https://github.com/dashersw/cote/compare/0.4.9...0.4.10)

## [0.4.9](https://github.com/dashersw/cote/tree/0.4.9) (2014-03-25)

[Full Changelog](https://github.com/dashersw/cote/compare/0.4.8...0.4.9)

## [0.4.8](https://github.com/dashersw/cote/tree/0.4.8) (2014-03-25)

[Full Changelog](https://github.com/dashersw/cote/compare/0.4.7...0.4.8)

## [0.4.7](https://github.com/dashersw/cote/tree/0.4.7) (2014-03-24)

[Full Changelog](https://github.com/dashersw/cote/compare/0.4.6...0.4.7)

## [0.4.6](https://github.com/dashersw/cote/tree/0.4.6) (2014-02-09)

[Full Changelog](https://github.com/dashersw/cote/compare/0.4.5...0.4.6)

## [0.4.5](https://github.com/dashersw/cote/tree/0.4.5) (2014-01-22)

[Full Changelog](https://github.com/dashersw/cote/compare/0.4.4...0.4.5)

## [0.4.4](https://github.com/dashersw/cote/tree/0.4.4) (2014-01-22)

[Full Changelog](https://github.com/dashersw/cote/compare/0.4.3...0.4.4)

## [0.4.3](https://github.com/dashersw/cote/tree/0.4.3) (2013-05-20)

[Full Changelog](https://github.com/dashersw/cote/compare/0.4.2...0.4.3)

## [0.4.2](https://github.com/dashersw/cote/tree/0.4.2) (2013-05-20)

[Full Changelog](https://github.com/dashersw/cote/compare/0.4.1...0.4.2)

## [0.4.1](https://github.com/dashersw/cote/tree/0.4.1) (2013-05-17)

[Full Changelog](https://github.com/dashersw/cote/compare/0.4.0...0.4.1)

## [0.4.0](https://github.com/dashersw/cote/tree/0.4.0) (2013-05-17)

[Full Changelog](https://github.com/dashersw/cote/compare/0.3.10...0.4.0)

## [0.3.10](https://github.com/dashersw/cote/tree/0.3.10) (2013-05-16)

[Full Changelog](https://github.com/dashersw/cote/compare/0.3.9...0.3.10)

## [0.3.9](https://github.com/dashersw/cote/tree/0.3.9) (2013-05-16)

[Full Changelog](https://github.com/dashersw/cote/compare/0.3.8...0.3.9)

## [0.3.8](https://github.com/dashersw/cote/tree/0.3.8) (2013-05-05)

[Full Changelog](https://github.com/dashersw/cote/compare/0.3.7...0.3.8)

## [0.3.7](https://github.com/dashersw/cote/tree/0.3.7) (2013-05-04)

[Full Changelog](https://github.com/dashersw/cote/compare/0.3.6...0.3.7)

## [0.3.6](https://github.com/dashersw/cote/tree/0.3.6) (2013-05-04)

[Full Changelog](https://github.com/dashersw/cote/compare/0.3.5...0.3.6)

## [0.3.5](https://github.com/dashersw/cote/tree/0.3.5) (2013-05-03)

[Full Changelog](https://github.com/dashersw/cote/compare/0.3.4...0.3.5)

## [0.3.4](https://github.com/dashersw/cote/tree/0.3.4) (2013-05-03)

[Full Changelog](https://github.com/dashersw/cote/compare/0.3.3...0.3.4)

## [0.3.3](https://github.com/dashersw/cote/tree/0.3.3) (2013-05-03)

[Full Changelog](https://github.com/dashersw/cote/compare/0.3.2...0.3.3)

## [0.3.2](https://github.com/dashersw/cote/tree/0.3.2) (2013-05-03)

[Full Changelog](https://github.com/dashersw/cote/compare/0.3.1...0.3.2)

## [0.3.1](https://github.com/dashersw/cote/tree/0.3.1) (2013-05-02)

[Full Changelog](https://github.com/dashersw/cote/compare/0.3.0...0.3.1)

## [0.3.0](https://github.com/dashersw/cote/tree/0.3.0) (2013-05-02)

[Full Changelog](https://github.com/dashersw/cote/compare/0.2.0...0.3.0)

## [0.2.0](https://github.com/dashersw/cote/tree/0.2.0) (2013-04-30)

[Full Changelog](https://github.com/dashersw/cote/compare/0.1.0...0.2.0)

## [0.1.0](https://github.com/dashersw/cote/tree/0.1.0) (2013-04-28)

[Full Changelog](https://github.com/dashersw/cote/compare/b82acf036d12bedc41a8b364c69fc34c737d94b7...0.1.0)



\* *This Changelog was automatically generated by [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator)*
