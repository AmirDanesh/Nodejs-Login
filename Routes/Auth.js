const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../Models/User_Model');
const mailer = require('../functions/SendMail');
const dotenv = require('dotenv');
dotenv.config();

/**
 * @typedef Login
 * @property {string} Username.required - username - eg: AmirDanesh
 * @property {string} Password.required - user's password.
 */
/**
 * Register API
 * @route POST /api/auth/Login
 * @group Auth - Register & Login
 * @param {Login.model} user.body.required - user's password.
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 */
router.post('/Login', async (req, res) => {
    try {
        let foundUser = await User.findOne({
            NormaliziedUsername: req.body.Username.toLowerCase()
        });

        if (!foundUser) {
            res.status(403).json({
                success: false,
                message: 'Authentication Failed, user not found'
            });
        } else {
            if (!foundUser.LockedOut) {
                if (
                    foundUser.LockUntilTime === null ||
                    foundUser.LockUntilTime < Date.now()
                ) {
                    console.log(req.body.Password);
                    if (foundUser.ComparePassword(req.body.Password)) {
                        console.log('true');
                        foundUser.PasswordFailureCount = 0;
                        const expiresIn = 28800;
                        const now = new Date();
                        const token = jwt.sign(
                            //TODO → Add Roles to Token
                            { id: foundUser._id },
                            process.env.JWTSECRET,
                            {
                                expiresIn: expiresIn
                            }
                        );
                        req.currentUser = foundUser;

                        res.status(200).json({
                            expiresIn: now.setSeconds(
                                now.getSeconds() + expiresIn
                            ),
                            token: token,
                            FullName:
                                foundUser.FirstName + ' ' + foundUser.LastName
                        });
                    } else {
                        if (foundUser.PasswordFailureCount >= 3) {
                            foundUser.PasswordFailureCount += 1;
                            var now = new Date();
                            now.setMinutes(
                                now.getMinutes() +
                                    Math.pow(2, foundUser.PasswordFailureCount)
                            );
                            foundUser.LockUntilTime = now;
                        } else {
                            foundUser.PasswordFailureCount += 1;
                        }
                        res.status(401).json({
                            success: false,
                            message:
                                'authentication failed, UserName and Password not matched'
                        });
                    }
                } else {
                    res.status(401).json({
                        success: false,
                        message: `Authentication Failed, user is Locked until: ${foundUser.LockUntilTime}`
                    });
                }
            } else {
                res.status(401).json({
                    success: false,
                    message: 'Authentication Failed, user is Locked'
                });
            }
        }
        foundUser.save();
    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'authentication failed, Wrong Password'
        });
    }
});

module.exports = router;
