import { Page } from 'playwright';
import { promiseTimeout } from './promise';

export const waitForRenderStart = (page: Page): Promise<boolean> => {
  return promiseTimeout<any>(
    30000,
    page.evaluate(() => {
      return new Promise(resolve => {
        const scene = document.querySelector('a-scene');
        if ((scene as any).renderStarted) {
          resolve(true);
          return;
        }

        (scene as any).addEventListener('renderstart', () => {
          resolve(true);
        });
      });
    }),
    'wait-for-render-start',
  );
};

// wait for: All nodes have loaded.
export const waitForSceneLoaded = (page: Page): Promise<any> => {
  return promiseTimeout<any>(
    80000,
    page.evaluate(() => {
      return new Promise(resolve => {
        const scene = document.querySelector('a-scene');

        if ((scene as any).hasLoaded) {
          resolve(true);
          return;
        }

        (scene as any).addEventListener('loaded', () => {
          resolve(true);
        });
      });
    }),
    'wait-for-scene-loaded',
  );
};

export const gltfModelLoaded = (
  page: Page,
  selector: string,
): Promise<boolean> => {
  return promiseTimeout<boolean>(
    80000,
    // eslint-disable-next-line no-shadow
    page.evaluate((selector): Promise<boolean> => {
      return new Promise(res => {
        const model = document.querySelector(selector);

        (model as any).addEventListener(
          'model-loaded',
          () => {
            res(true);
          },
          { once: true },
        );
      });
    }, selector),
    `load gltf with selector ${selector}`,
  );
};

// MIT Licensed
// Inspo from: jwilson8767
/**
 * Waits for an element satisfying selector to exist, then resolves promise with true, if found.
 *
 * *would normally use `toMatchElement`, but it does not play well with Aframe entities*
 *
 * @param selector
 * @returns {Promise}
 */
export function elementReady(
  page: Page,
  selector: string,
  deadline = 5000,
): Promise<boolean | unknown> {
  return promiseTimeout(
    deadline,
    // eslint-disable-next-line no-shadow
    page.evaluate<any>((selector: any) => {
      return new Promise(resolve => {
        const el = document.querySelector(selector);
        if (el) {
          resolve(true);
        }
        new MutationObserver((_mutationRecords, observer) => {
          // Query for elements matching the specified selector
          Array.from(document.querySelectorAll(selector)).forEach(_element => {
            resolve(true);
            // Once we have resolved we don't need the observer anymore.
            observer.disconnect();
          });
        }).observe(document.documentElement, {
          childList: true,
          subtree: true,
        });
      });
    }, selector),
    `element-ready: ${selector}`,
  );
}
