const router = require('express').Router();
const User = require('../Models/User_Model');
const auth = require('../middleware/verify-token');
const mailer = require('../functions/SendMail');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
//Get All Users
router.get('/', auth, async (req, res) => {
    let users = await User.find().select(
        'NormaliziedUsername FirstName LastName PhoneNumber Email'
    );
    res.status(200).json(users);
});

//Get One Users By id
router.get('/:id', auth, async (req, res) => {
    let user = await User.find({ _id: req.params.id }).select(
        'NormaliziedUsername FirstName LastName PhoneNumber Email'
    );
    if (user) {
        res.status(200).json({
            success: true,
            user: user
        });
    }
});

//Delete User By id
router.delete('/:id', async (req, res) => {
    let user = await User.findOneAndDelete({ _id: req.params.id });
    console.log(user);
    res.status(200).json({
        user: user
    });
});

router.get('/getConfirmEmail/:id', async (req, res) => {
    let userEmail = await User.findOne({ _id: req.params.id }).select('Email');
    let token = jwt.sign(
        { userId: req.params.id, Email: userEmail },
        process.env.MAILSECRET,
        {
            expiresIn: '1h'
        }
    );

    let confirmUrl = `https://nodeboiler.herokuapp.com/api/users/ConfirmEmail/${token}`;
    mailer(userEmail, confirmUrl).catch(console.error());
    res(200).json({
        message: 'Please check your Email',
        link: confirmUrl
    });
});

router.get('/ConfirmEmail/:token', async (req, res) => {
    jwt.verify(
        req.params.token,
        process.env.MAILSECRET,
        async (err, decoded) => {
            if (err) {
                res.status(203).json({
                    success: false,
                    message: `failed to confirm Email, because ${err.message}`
                });
            } else {
                let user = await User.findOne({ _id: decoded.userId }).select(
                    'EmailConfirm Email'
                );
                if (decoded.Email === user.Email) {
                    user.EmailConfirm = true;
                    user.save();
                    res.status(200).json('Email Confirmed Successfully');
                } else {
                    res.status(403).json(
                        'this link is not valid, try again...!'
                    );
                }
            }
        }
    );
});
/**
 * @typedef Register
 * @property {string} Username.required - username - eg: AmirDanesh
 * @property {string} FirstName.required - firsname - eg: Amir
 * @property {string} LastName.required - firsname - eg: Daneshvar
 * @property {string} Email.required - Email - eg: amir77daneshvar@gmail.com
 * @property {string} PhoneNumber.required - Phone Number - eg: 555-315-14
 * @property {string} Password.required - Password - eg: 123456
 */
/**
 * Register API
 * @route POST /api/users
 * @group Users - Registering new User
 * @param {Register.model} user.body.required - user's password.
 * @returns {object} 201 - jwt token
 * @returns {Error}  500 - Unexpected error
 */
router.post('/', async (req, res) => {
    if (!req.body.Username || !req.body.Password) {
        res.status(203).json({
            seccess: false,
            message: 'Please Enter Username Or Password'
        });
    } else {
        try {
            let user = new User(req.body);
            user.NormaliziedUsername = req.body.Username;
            user.PasswordHash = req.body.Password;
            await user.save().then(function () {
                let token = jwt.sign(
                    { userId: user._id, Email: user.Email },
                    process.env.MAILSECRET,
                    {
                        expiresIn: '1h'
                    }
                );
                let confirmUrl = `https://nodeboiler.herokuapp.com/api/users/ConfirmEmail/${token}`;
                mailer(user.Email, confirmUrl).catch(console.error());
            });

            let token = jwt.sign(user.toJSON(), process.env.JWTSECRET, {
                expiresIn: '8h'
            });
            res.status(201).json({
                success: true,
                token: token,
                expiresIn: token.expiresIn,
                message: `User with ${user.NormaliziedUsername} Created...!, check your Email to Confirm that`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
});
module.exports = router;
