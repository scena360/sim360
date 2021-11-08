/* eslint-disable no-shadow */
/* eslint-disable no-console */
import playwright, { Browser, Page } from 'playwright';
import { SELECTORS } from '../consts';
import {
  signInAsAnon,
  waitForRenderStart,
  enableLogs,
  handleOnboardingModal,
  shouldWaitForOnboarding,
  launchPage,
} from '../helpers';

declare const N360: any;
// declare const SCENA_ENV: any;

const clickOnDeviceSettingsConfirmations = (p: Page) => {
  // click on device settings confirmation
  return p.click(SELECTORS.ONBOARDING_MODAL_FOOTER_BTN, {
    button: 'left',
    clickCount: 1,
    delay: 8000, // takes time for this button to load (at least 1.5 seconds)
    timeout: 10000,
  });
};

export const oneAvatarJoinsRoom = async () => {
  const { browser, page } = await launchPage(playwright.chromium);
  try {
    enableLogs(page, 'page', true);

    const SCENA_ENV = await page.evaluate(() => SCENA_ENV);
    console.log(`SCENA_ENV ${JSON.stringify(SCENA_ENV)}`);

    await signInAsAnon(page);

    await page.waitForSelector(SELECTORS.CREATE_SPACE_BTN, {
      timeout: 40000,
      state: 'visible',
    });
    // create space in page
    await page.click(SELECTORS.CREATE_SPACE_BTN, {
      timeout: 40000,
      delay: 400,
    });

    await page.waitForSelector(SELECTORS.INVITE_LINK_TEXT, {
      state: 'visible',
      timeout: 30000,
    });

    const shouldWaitForOnboardingpage = await shouldWaitForOnboarding(page);

    await page.waitForSelector(SELECTORS.ENTER_SPACE_BTN, {
      state: 'visible',
      timeout: 10000,
    });
    // enter space in page
    await page.click(SELECTORS.ENTER_SPACE_BTN, {
      timeout: 10000,
      delay: 400,
    });

    if (shouldWaitForOnboardingpage) {
      await handleOnboardingModal(page);
    }
    await clickOnDeviceSettingsConfirmations(page);

    // wait for control buttons to show up in both pages
    // this oracle helps us determine whether we were able to enter the space
    await page.waitForSelector(SELECTORS.CONTRAL_BUTTONS_BAR, {
      timeout: 95000,
      state: 'visible',
    });

    await waitForRenderStart(page);

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
        'property: position; from: 5 0 0; to: -5 0 0; dur: 1000; easing: easeInOutQuad; loop: true',
      );
    });
  } catch (err) {
    console.error('Something went wrong while running the simulation 😢', err);
  } finally {
    await browser.close();
  }
};
