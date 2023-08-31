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
    
}
export default LoginPage;