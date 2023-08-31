import fs from 'fs';
import puppeteer from 'puppeteer';
import { startFlow, desktopConfig } from "lighthouse";
import data from '../data/user.json' assert {type: 'json'};
import LoginPage from '../source/pages/login.js';
import DashboardPage from '../source/pages/dashboard.js';

const login = new LoginPage();
const dashboard = new DashboardPage();

export async function enterAndSubmitMobileNumber(page) {
    const inputMobileNumber = await page.$(login.getMobileNumber());
    await inputMobileNumber.type(data.MOBILE);
    await page.click(login.getSubmitButton());
    await page.waitForNavigation();
}

export async function enterAndSubmitPassword(page){
    const inputPassword = await page.$(login.getPassword());
    await inputPassword.type(data.PASSWORD);
    await page.click(login.getSubmitButton());
    await page.waitForNavigation({ waitUntil: ["load", "networkidle2"] });
}

export async function navigateToAccountsPage(page){
    await page.waitForTimeout(30000)
    await page.waitForSelector(dashboard.getAccounts());
    await page.click(dashboard.getAccounts());
    // await page.waitForNavigation({ waitUntil: ["load", "networkidle2"] });
}

export async function generateReports(flow){

    const htmlReport = await flow.generateReport();
    fs.writeFileSync('reports/html/flow_report13.html', htmlReport);
    const jsonReport = await flow.createFlowResult()
    fs.writeFileSync('reports/json/flow-result13.json', JSON.stringify(jsonReport, null, 2));
}

(async () => {
    const browser = await puppeteer.launch(
        {
            headless: false,
            defaultViewport: null,
            args: ['--start-fullscreen'],
        }
    );

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

    await flow.navigate(data.BASEURL);
    await flow.navigate(data.BASEURL,
        {
            stepName: 'Warm Start',
            configContext: {
                settingsOverrides: { disableStorageReset: true },
            },
        });
    await flow.snapshot({ stepName: "Login" });

    //Login enter mobile number
    await flow.startTimespan({ stepName: "Login-Mobile Number" });
    enterAndSubmitMobileNumber(page);
    await flow.endTimespan();

    //Login - Enter Password
    await flow.startTimespan({ stepName: "Login - Enter Password" });
    enterAndSubmitPassword(page);
    await flow.endTimespan();

    // Navigate to Accounts Page
    await flow.startTimespan({ stepName: "Navigate to Accounts" });
    await page.waitForSelector(dashboard.getAccounts());
    await page.click(dashboard.getAccounts());
    // await page.waitForNavigation({ waitUntil: ["load", "networkidle2"] });    
    await flow.endTimespan();
    await flow.snapshot({ stepName: "Account Page" });

    await browser.close();

    generateReports(flow);

})();