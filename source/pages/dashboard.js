class DashboardPage{
    getAccounts(){
        return 'span[data-testid="Accounts"]';
    }
    async navigateToAccountsPage(page) {
        await page.waitForTimeout(10000)
        await page.waitForSelector(this.getAccounts());
        await page.click(this.getAccounts());
        // await page.waitForNavigation({ waitUntil: ["load", "networkidle2"] });
    }
}
export default DashboardPage;