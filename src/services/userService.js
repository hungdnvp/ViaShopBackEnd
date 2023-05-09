import db from '../models/index';
import bcrypt from 'bcryptjs';
const salt = bcrypt.genSaltSync(10);

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            })
            if (user) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (e) {
            reject(e);
        }
    })
}
let hashPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPass = await bcrypt.hashSync(password, salt);
            resolve(hashPass);
        } catch (e) {
            reject(e);
        }
    })
}

let registerService = (data)=>{
    return new Promise( async(resolve,reject) =>{
        try{
            // check email
            let check = await checkUserEmail(data.email);
            if(check === true){
                resolve({
                    errCode: 1,
                    errMessage: 'Your email is already in used, Plz try another email'
                })
            }
            else{
                let hashPassFromBcrypt = await hashPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPassFromBcrypt,
                    username: data.username,
                    phonenumber: data.phonenumber,
                    balance: 0,
                    role: 'user',
                })
                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }
        }catch(e){
            reject(e);
        }
    })
}

let loginService = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let isExist = await checkUserEmail(email);
            if (isExist) {
                let user = await db.User.findOne({      // check mail again
                    attributes: ['email','username','password','balance','role'],
                    where: { email: email },
                    raw: true
                    })
                if (user) {
                    let check = await bcrypt.compareSync(password, user.password); // check pass
                    if (check) {
                        delete user.password;
                        resolve({
                            errCode:0,
                            errMessage: 'OK',
                            user: user
                        })
                    }else{
                        resolve({
                            errCode: 3,
                            errMessage: 'Password is incorrect',
                            user: {}
                        })
                    }
                } else {        // mail lose
                    resolve({
                        errCode: 2,
                        errMessage: `Your's Email isn't exist in system.`,
                        user: {}
                    })
                }
            } else {
                resolve({
                    errCode: 1,
                    errMessage: `Your's Email isn't exist in system.`,
                    user: {}
                });
            }
        } catch (e) {
            reject(e);
        }
    })
}
module.exports = {
    registerService: registerService,
    loginService: loginService
}