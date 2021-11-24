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
  sleep,
} from '../helpers';

// declare const SCENA_ENV: any;

const clickOnDeviceSettingsConfirmations = async (p: Page) => {
  await sleep(8000);

  // click on device settings confirmation
  return p.click(SELECTORS.ONBOARDING_MODAL_FOOTER_BTN, {
    button: 'left',
    clickCount: 1,
    timeout: 20000,
    force: true,
  });
};

// 1. sign in as anon user
// 2. skip avatar URL check
// 3. create space
// 4. confirm onboarding instructions
// 5. confirm device settings
// 6. wait for scene to load

// TODO: add abilit to return url created by this avatar so that guest bots can join the same room
export const joinRoom = async ({
  browser,
  page,
}: {
  browser: Browser;
  page: Page;
}) => {
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
      delay: 5000,
      force: true,
      button: 'left',
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

    await sleep(4000);

    // enter space in page
    await page.click(SELECTORS.ENTER_SPACE_BTN, {
      timeout: 15000,
      force: true,
      button: 'left',
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
  } catch (err) {
    console.error('Something went wrong while running the simulation 😢', err);
  }
};
