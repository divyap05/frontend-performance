import fs from 'fs';
import puppeteer from 'puppeteer';
import { startFlow, desktopConfig } from "lighthouse";
import { describe } from 'node:test';
import { expect } from 'chai';
import data from '../data/user.json' assert {type: 'json'};
import LoginPage from '../source/pages/login.js';
import DashboardPage from '../source/pages/dashboard.js';



describe('Test for Cold Start', async function () {
    const login = new LoginPage();
    const dashboard = new DashboardPage();

    async function enterAndSubmitMobileNumber(page) {
        const inputMobileNumber = await page.$(login.getMobileNumber());
        await inputMobileNumber.type(data.MOBILE);
        await page.click(login.getSubmitButton());
        await page.waitForNavigation();
    }
    async function enterAndSubmitPassword(page) {
        const inputPassword = await page.$(login.getPassword());
        await inputPassword.type(data.PASSWORD);
        await page.click(login.getSubmitButton());
        await page.waitForNavigation({ waitUntil: ["load", "networkidle2"] });
    }

    async function navigateToAccountsPage(page) {
        await page.waitForTimeout(30000)
        await page.waitForSelector(dashboard.getAccounts());
        await page.click(dashboard.getAccounts());
        // await page.waitForNavigation({ waitUntil: ["load", "networkidle2"] });
    }

    async function generateReports(flow) {

        const htmlReport = await flow.generateReport();
        fs.writeFileSync('reports/html/'+Date.now()+'.html', htmlReport);
        const jsonReport = await flow.createFlowResult()
        fs.writeFileSync('reports/json/'+Date.now()+'.json', JSON.stringify(jsonReport, null, 2));
        return { htmlReport, jsonReport };
    }

    async function browserSetup() {
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


    it('Cold Start', async function () {
        const setup = await browserSetup();
        const flow = setup.flow;
        await flow.navigate(data.BASEURL, { name: 'Cold Start' });

        await setup.browser.close();
        const reports = await generateReports(flow);

        var fcp = reports.jsonReport.steps[0].lhr.audits["first-contentful-paint"].numericValue;
        var performanceScore = reports.jsonReport.steps[0].lhr.categories.performance.score;
        var abc = reports.jsonReport.steps[0].name;
        console.log(fcp, performanceScore, abc);
        expect(fcp).to.below(15000);
        expect(performanceScore).to.above(0.25);
    });

    it('Warm Start and Navigation', async function () {
        const setup = await browserSetup();
        const flow = setup.flow, page = setup.page;


        await flow.navigate(data.BASEURL,
            {
                name: 'Warm Start',
                configContext: {
                    settingsOverrides: { disableStorageReset: true },
                },
            });
        await flow.snapshot({ name: "Login" });

        //Login enter mobile number
        await flow.startTimespan({ name: "Login-Mobile Number" });
        await enterAndSubmitMobileNumber(page);
        await flow.endTimespan();
        //Login - Enter Password
        await flow.startTimespan({ name: "Login - Enter Password" });
        await enterAndSubmitPassword(page);
        await flow.endTimespan();

        // Navigate to Accounts Page
        await flow.startTimespan({ name: "Navigate to Accounts" });
        await page.waitForSelector(dashboard.getAccounts());
        await page.click(dashboard.getAccounts());
        await flow.endTimespan();
        await flow.snapshot({ name: "Account Page" });

        await setup.browser.close();
    })

});