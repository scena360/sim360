/* eslint-disable no-shadow */
/* eslint-disable no-console */
import playwright from 'playwright';
import { launchPage, sleep } from '../helpers';
import { joinRoom } from '../helpers/joinRoom';
import { randomNumberBetween } from '../helpers/utils';

declare const N360: any;
// declare const SCENA_ENV: any;

export const oneAvatarJoinsRoom = async () => {
  await Promise.all(
    [playwright.chromium].map(async browserType => {
      const { browser, page } = (await launchPage(browserType))!;
      try {
        await joinRoom({ browser, page });

        const signallingClientId = await page.evaluate(() => N360.clientId);

        console.log('Scena 360 signalling client ID: ', signallingClientId);

        // make avatar move to center
        await page.evaluate(() => {
          const localAvatarRig = document.querySelector('#local-avatar-rig');
          localAvatarRig!.setAttribute('position', '0 0 0');
        });

        let counter = 0;
        while (counter < 300) {
          let randTime = randomNumberBetween(1, 5);
          counter = counter + randTime;
          let randDirection: number = randomNumberBetween(1, 4);
          let direction = '';
          console.log('moving for ' + randTime + ' seconds');
          switch (randDirection) {
            case 1:
              console.log('going left');
              direction = 'ArrowLeft';
              break;

            case 2:
              console.log('going up');
              direction = 'ArrowUp';
              break;

            case 3:
              console.log('going right');
              direction = 'ArrowRight';
              break;

            case 4:
              console.log('going down');
              direction = 'ArrowDown';
              break;
          }
          await page.keyboard.down(direction);
          await sleep(1000 * randTime);
          await page.keyboard.up(direction);
        }

        await sleep(30000); // sleep for 30 seconds
      } finally {
        browser.close();
      }
    }),
  );
};
