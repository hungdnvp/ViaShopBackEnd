import userService from '../services/userService';

let handleRegister = async (req, res) =>{
    let message = await userService.registerService(req.body);
    return res.status(200).json(message);

}

let handleLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    if (!email || !password) {
        return res.status(500).json({
            errCode: 1,
            errMessage: 'Missing inputs parameter !',
            user: {}
        })
    }
    let Data = await userService.loginService(email, password);
    return res.status(200).json({
        errCode: Data.errCode,
        errMessage: Data.errMessage,
        user: Data.user
    })
}
module.exports = {
    handleLogin: handleLogin,
    handleRegister: handleRegister,

}