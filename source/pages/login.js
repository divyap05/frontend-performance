import data from "/Users/divyapolaki/Documents/Frontend-Performance/data/user.json" assert {type: 'json'};
class LoginPage{
    getMobileNumber(){
        return 'input[data-testid="phone-number-id"]';
    }
    getPassword(){
        return 'input[name="login-password-input"]';
    }
    getSubmitButton(){
        return 'button[type="submit"]';
    }
    async  enterAndSubmitMobileNumber(page) {
        const inputMobileNumber = await page.$(this.getMobileNumber());
        await inputMobileNumber.type(data.MOBILE);
        await page.click(this.getSubmitButton());
        await page.waitForNavigation();
    }
    async  enterAndSubmitPassword(page) {
        const inputPassword = await page.$(this.getPassword());
        await inputPassword.type(data.PASSWORD);
        await page.click(this.getSubmitButton());
        await page.waitForNavigation({ waitUntil: ["load", "networkidle2"] });
    }
    
}
export default LoginPage;