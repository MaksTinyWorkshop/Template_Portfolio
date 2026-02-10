import { Page } from "@playwright/test";

export async function sneakyNavigateWithInterception(
  page: Page,
  url: string,
  interceptor: () => Promise<void>,
) {
  const requestReady = interceptor();
  const responseReady = page.waitForResponse(
    (resp) => resp.url().includes("/api/") && resp.status() === 200,
  );
  await page.goto(url);
  await Promise.all([requestReady, responseReady]);
}
