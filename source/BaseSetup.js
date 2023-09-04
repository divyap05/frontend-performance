import puppeteer from 'puppeteer';
import { startFlow, desktopConfig } from "lighthouse";
class BaseSetup{
    async browserSetup() {
        const browser = await puppeteer.launch(
            {
                headless: false,
                defaultViewport: null,
                args: ['--start-fullscreen']
            });
        const page = await browser.newPage();
        const flow = await startFlow(page,
            {
                config: desktopConfig,
                flags: { screenEmulation: { disabled: true } }
            });
        await page.setViewport(
            {
                width: 1920, height: 1080
            });

        return { page, browser, flow };
    }
}
export default BaseSetup;