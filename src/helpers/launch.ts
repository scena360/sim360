import playwright, {
  Browser,
  BrowserType,
  Page,
  BrowserContext,
} from 'playwright';
import { BASE_ARGS, BASE_LAUNCH_OPTS, SITE_URL } from '../consts';

interface Options {
  incognito?: boolean;
}

export const launchPage = async (
  browserType: BrowserType,
  { incognito }: Options = {},
): Promise<{
  browser: Browser;
  page: Page;
  context: BrowserContext;
}> => {
  const args = [
    ...BASE_ARGS,
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
  ];

  if (incognito) {
    args.push('--incognito');
  }
  const browser = await browserType.launch({
    ...BASE_LAUNCH_OPTS,
    args,
  });

  console.log('launch page :)', browserType);

  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(100000);

  const url = new URL(SITE_URL);
  url.searchParams.set('bot', '1');
  // bypass avatar restriction
  url.searchParams.set(
    'aUrl',
    'https://d1a370nemizbjq.cloudfront.net/7953896c-d56e-498a-b128-3aea60fefc0c.glb',
  );

  await page.goto(url.toString());

  return { page, browser, context };
};
