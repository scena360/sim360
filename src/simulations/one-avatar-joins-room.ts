/* eslint-disable no-shadow */
/* eslint-disable no-console */
import playwright from 'playwright';
import { launchPage, sleep } from '../helpers';
import { joinRoom } from '../helpers/joinRoom';

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

        // make avatar move back and forth using A-frame animations
        await page.evaluate(() => {
          const localAvatarRig = document.querySelector('#local-avatar-rig');
          localAvatarRig!.setAttribute(
            'animation',
            'property: position; from: 5 0 0; to: -5 0 0; dir: alternate; dur: 2000; easing: easeInOutQuad; loop: true',
          );
        });

        await sleep(30000); // sleep for 30 seconds
      } finally {
        browser.close();
      }
    }),
  );
};
