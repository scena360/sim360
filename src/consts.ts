import { LaunchOptions } from 'playwright';

export const SITE_URL = 'https://scena-app--master-639ff59-hnj3mkaw.web.app/';

export const BASE_ARGS = ['--no-sandbox', '--ignore-certificate-errors'];

export const BASE_LAUNCH_OPTS: LaunchOptions = {
  headless: false,
  // executablePath: process.env.PLAYRIGHT_EXEC_PATH, // set by docker container
};

export const SELECTORS = {
  ENTER_SPACE_BTN:
    'button[data-testid="create-space-modal-enter-space-btn"]:not([disabled])',
  CREATE_SPACE_BTN: 'button[name=create-space-btn]',
  CONTRAL_BUTTONS_BAR: '[data-testid="control-buttons"]',
  DISPLAY_NAME_INPUT_FIELD: 'input[name=displayname-input]',
  SUBMIT_NAME_BTN: 'button[name=displayname-submit]',
  ONBOARDING_MODAL_FOOTER_BTN: 'button[name=onboarding-modal-footer-btn]',
  INVITE_LINK_TEXT: 'span[data-testid="generated-invite-link-text"]',
  SHARE_SCREEN_BUTTON: '[data-testid="Screen-Share"]',
};
