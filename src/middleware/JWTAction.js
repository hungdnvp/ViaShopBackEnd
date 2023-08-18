import jwt from "jsonwebtoken";
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const createToken = (data, expire = '1h')=>{
    let token = '';
    if(data && expire){
        token = jwt.sign(data, JWT_SECRET, { expiresIn: expire } );
    }
    else{
        console.log('missing data parameter create token')
    }
    return token;
}

const verifyToken = (token)=>{
    let result = {check: false, data: {}}
    if(token){
        try {
             let verify = jwt.verify(token, JWT_SECRET);
             result.check = true
             result.data = verify
          } catch(err) {
            console.log("error verify token")
          }
    }else{
        console.log('missing token parameter verify')
    }  
    return result; 
}

module.exports = {
    createToken,
    verifyToken,
}