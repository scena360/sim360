# Sim 360

## Getting started

### Installing dependencies

1. Make sure you have the latest version of the following installed:
   1. Yarn: https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable
   2. NodeJS: Install here 👉 https://nodejs.org/en
2. Clone the sim360 repo
3. Run `yarn install` to install the yarn dependencies / node modules

### Compiling and running the project

You can build-and-run the simulation environment with one command:

`yarn build:run`

You can also...

1. Compile using `yarn run build`
2. Run a clean build using `yarn run build:clean`
3. Start the simulation after compilation using `yarn start`

### Adding a new simulation

1. create a `<simulation-name>.ts` file in `src/simulations/`
2. add the following boilerplate to your new simulation file

```typescript
export const yourSimulationName = async () => {
  await Promise.all(
    // specify browser types which you wish to launch
    [playwright.chromium].map(async browserType => {
      const { browser, page } = (await launchPage(browserType))!;
      try {
        await joinRoom({ browser, page });

        // do stuff once avatar has entered the room
      } finally {
        browser.close();
      }
    }),
  );
};
```

3. register your simulation in `src/simulations/index.ts` by adding it to the
   `sims/` map.
4. (temporary) pass in the name of the simulation you wish to run in
   `src/index.ts`:

```typescript
(async () => {
  await startSim('yourSimulationName'); // update
})();
```

5. Run `yarn build:run` to run your simulation.
