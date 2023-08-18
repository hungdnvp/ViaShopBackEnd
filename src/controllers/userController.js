import userService from '../services/userService';
import cookieParser from 'cookie-parser';

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
        })
    }
    let Data = await userService.loginService(email, password);
    return res.status(200).json(Data);
}
let getAllUser =  async (req, res) =>{
    try{
        let data = await userService.getAllUserService(); 
        return res.status(200).json(data);
    }catch(err){
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
module.exports = {
    handleLogin: handleLogin,
    handleRegister: handleRegister,
    getAllUser: getAllUser,

}