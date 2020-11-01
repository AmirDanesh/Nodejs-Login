const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

module.exports = async function (toMail, text) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.GUSER, // generated ethereal user
            pass: process.env.GPASS // generated ethereal password
        }
    });

    await transporter.sendMail({
        from: '"Amir no-reply" <amir77daneshvar@gmail.com>', // sender address
        to: toMail, // list of receivers
        subject: 'Confirmation', // Subject line
        // text: text, // plain text body
        html: `<h1>click on this <a href=${text}>link</a> to confirm your Email</h1>` // html body
    });
};
