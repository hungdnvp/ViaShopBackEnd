import jwt from "jsonwebtoken";
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) =>{
    const token = req.cookies.access_token;
    if(token){
        jwt.verify(token, JWT_SECRET, function(err, data){
            if(err){
                console.log(err.message);
                res.redirect('/login')
            }
            else{
                console.log(data)
                next()
            }
        })
    }
    else{
        res.redirect('/login');
    }
}

module.exports = {
    authMiddleware
}