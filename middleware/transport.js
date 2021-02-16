const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transport = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      pass: process.env.GMAIL_PASSWORD,
      user: process.env.GMAIL_ADDRESS
    }
});

module.exports = transport;