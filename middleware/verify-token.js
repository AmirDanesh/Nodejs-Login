const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();


module.exports = function (req, res, next) {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    let bearer = 'Bearer ';
    if (token) {
        if (token.startsWith(bearer)) {
            token = token.slice(bearer.length, token.length);
        }
        jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
            if (err) {
                res.status(401).json({
                    success: false,
                    message: 'failed to authenticate'
                });
            } else {
                req.currentUser = decoded;
                next();
            }
        });
    } else {
        res.status(403).json({
            success: false,
            message: 'no token provided'
        });
    }
};
