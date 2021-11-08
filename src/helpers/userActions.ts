import { Page } from 'playwright';
import { SELECTORS } from '../consts';
import { sleep } from './sleep';

export const signInAsAnon = async (p: Page) => {
  await p.waitForSelector(SELECTORS.DISPLAY_NAME_INPUT_FIELD, {
    state: 'visible',
    timeout: 59000,
  });
  // click name input
  await p.click(SELECTORS.DISPLAY_NAME_INPUT_FIELD);
  // enter name
  await p.fill(SELECTORS.DISPLAY_NAME_INPUT_FIELD, 'Moss Bot', {
    force: true,
  });

  // Register as anon. user: click "Continue" (submit button)
  await p.click(SELECTORS.SUBMIT_NAME_BTN, {
    delay: 500,
    button: 'left',
    timeout: 4000,
  });
};

export const shouldWaitForOnboarding = async (p: Page): Promise<boolean> => {
  const waitForOnboarding = await p.evaluate(() => {
    const cache = JSON.parse(localStorage.getItem('cache')!);
    return !(cache.seenTips || []).includes('onboarding-instructions');
  });
  return waitForOnboarding;
};

export const handleOnboardingModal = async (p: Page) => {
  await sleep(3000);

  await p.waitForSelector(SELECTORS.ONBOARDING_MODAL_FOOTER_BTN, {
    timeout: 20000,
    state: 'visible',
  });
  // click confirmation button for instructions
  await p.click(SELECTORS.ONBOARDING_MODAL_FOOTER_BTN, {
    button: 'left',
    clickCount: 1,
    delay: 500,
    timeout: 20000,
  });
};
