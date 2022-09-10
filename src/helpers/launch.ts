import playwright, {
  Browser,
  BrowserType,
  Page,
  BrowserContext,
  devices,
} from 'playwright';
import { BASE_ARGS, BASE_LAUNCH_OPTS, SITE_URL } from '../consts';

interface Options {
  incognito?: boolean;
  deviceName?: keyof typeof devices;
}

export const launchPage = async (
  browserType: BrowserType,
  { incognito, deviceName }: Options = {
    incognito: true,
  },
): Promise<
  | {
    browser: Browser;
    page: Page;
    context: BrowserContext;
  }
  | undefined
> => {
  let browser: Browser | null = null;

  try {
    const args = [
      ...BASE_ARGS,
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--enable-mock-capture-devices=true',
      '--enable-media-stream=true',
    ];

    if (incognito) {
      args.push('--incognito');
    }
    browser = await browserType.launch({
      ...BASE_LAUNCH_OPTS,
      args,
    });

    console.log(`🚀 launching page using ${browserType.name()} browser...`);

    const device = devices[deviceName!];

    const context = await browser.newContext({
      ...(device ?? {}),
    });
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
  } catch (err) {
    console.error('failed to launch page or browser', err);
    if (browser) {
      browser.close();
    }
  }
  return undefined;
};
