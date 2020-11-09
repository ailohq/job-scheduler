# @ailo/job-scheduler

Async jobs scheduler. (Powered by [node-cron](https://www.npmjs.com/package/node-cron).)

**Note: There's no configuration here for CI (GoCD) yet.** Releasing is done manually, and linters/tests/build are being run during each `git push` / `yarn publish`.

## Development

```sh
yarn
yarn start
```

## Testing

```sh
yarn lint # prettier and eslint
yarn test # unit tests
yarn test:watch # unit tests in watch mode
yarn validate # run linters, tests and build
```

## Releasing

**Note: Releasing is done manually. This project has no CI/CD configuration.**

```sh
yarn release # will automatically ask you about version bump, run tests and build, and push new version to git & npm
```
