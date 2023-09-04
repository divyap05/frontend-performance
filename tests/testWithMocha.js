import { describe } from 'node:test';
import { expect } from 'chai';
import data from '../data/user.json' assert {type: 'json'};
import LoginPage from '../source/pages/login.js';
import DashboardPage from '../source/pages/dashboard.js';
import BaseSetup from '../source/baseSetup.js';
import Reports from '../source/reports.js';


describe('Test for Cold Start', async function () {
    const login = new LoginPage();
    const dashboard = new DashboardPage();
    const browser = new BaseSetup();
    const report = new Reports();

    it('Cold Start', async function () {
        const setup = await browser.browserSetup();
        const flow = setup.flow;
        await flow.navigate(data.BASEURL, { name: 'Cold Start' });

        await setup.browser.close();
        const reports = await report.generateReports(flow, this.test.title);

        var fcp = reports.jsonReport.steps[0].lhr.audits["first-contentful-paint"].numericValue;
        var performanceScore = reports.jsonReport.steps[0].lhr.categories.performance.score;
        expect(fcp).to.below(15000);
        expect(performanceScore).to.above(0.25);
    });

    it('Warm Start and Navigation', async function () {
        const setup = await browser.browserSetup();
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
        await login.enterAndSubmitMobileNumber(page);
        await flow.endTimespan();
        //Login - Enter Password
        await flow.startTimespan({ name: "Login - Enter Password" });
        await login.enterAndSubmitPassword(page);
        await flow.endTimespan();

        // Navigate to Accounts Page
        await flow.startTimespan({ name: "Navigate to Accounts" });
        await dashboard.navigateToAccountsPage(page);
        await flow.endTimespan();
        await flow.snapshot({ name: "Account Page" });

        await setup.browser.close();
        const reports = await report.generateReports(flow, this.test.title);

        var fcp = reports.jsonReport.steps[0].lhr.audits["first-contentful-paint"].numericValue;
        var performanceScore = reports.jsonReport.steps[0].lhr.categories.performance.score;
        expect(fcp).to.below(15000);
        expect(performanceScore).to.above(0.25);
    })

});