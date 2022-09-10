/* eslint-disable no-console */
import { Request, Response, Page } from 'playwright';

export const enableLogs = (p: Page, pageId = '', logXhr = false) => {
  p.on('console', msg => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < msg.args().length; ++i) {
      console.log(`[page-${pageId}]: ${msg.args()[i]}`);
    }
  });

  if (logXhr) {
    p.on('requestfailed', async request => {
      if (shouldPrint(request.url())) {
        await handleRequest(request, 'requestfailed', pageId);
      }
    });

    p.on('requestfinished', async request => {
      if (shouldPrint(request.url())) {
        await handleRequest(request, 'requestfinished', pageId);
      }
    });

    p.on('response', async response => {
      try {
        if (shouldPrint(response.url())) {
          console.log(
            `
          [page-${pageId}] XHR response received:
          url: ${response.url()}
          body: ${await handleBody(response)}
          status: ${response.status()}
          headers: ${JSON.stringify(response.headers())}
          `,
          );
        }
      } catch (_err) {
        console.log(_err);
      }
    });
  }
};

const shouldPrint = (url: string) => {
  return ['8080', '8081', '8082', '9099'].some(p => url.includes(p));
};

const handleBody = async (response: Response): Promise<string> => {
  try {
    const resp = await response.json();
    return JSON.stringify(resp);
  } catch (_err) {
    return '---cannot-parse---';
  }
};

const responseToString = async (response: Response | null): Promise<string> => {
  if (!response) {
    return '---no-response---';
  }

  try {
    return JSON.stringify({
      status: response.status(),
      body: await handleBody(response),
    });
  } catch (_err) {
    return '---something-went-wrong---';
  }
};

const handleRequest = async (
  request: Request,
  event: string,
  pageId = '',
): Promise<void> => {
  try {
    const failure = request.failure();
    console.log(
      `
        [page-${pageId}] XHR request ${event}:
        url: ${request.url()}
        postBody: ${request.postData()}
        response: ${await responseToString(await request.response())}
        resource-type: ${request.resourceType()}
        headers: ${JSON.stringify(request.headers())}
        failure: ${failure != null
        ? `FAIL REQUEST: ${failure.errorText}`
        : '--no-failure--'
      }
        method: ${request.method()}
      `,
    );
  } catch (_err) {
    console.log(_err);
  }
};
