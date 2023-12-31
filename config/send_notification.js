const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require("../models/User");
const ExpenseSchema = require("../models/ExpenseModel");
const path = require("path");

let mailOptions = [];

// Mail transport configuration
let transporter;

const mailSend = (listUser) => {
    listUser.forEach((e) => {
        mailOptions.push({
            from: 'ITSS Group',
            to: e.email,
            subject: 'Notification From Expense Tracker',
            text: 'Some content to send',
            html: {
                path: path.resolve(__dirname, "../public/template/mail.html"),
            },
        })
    })
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_SEND,
            pass: process.env.PASSWORD_EMAIL_SEND,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
}

const send = cron.schedule('* 11 * * *', function () {
    const today = new Date();
    console.log('---------------------');
    console.log('Running Cron Process');
    User.find()
        .then((users) => {
            if (users) {
                const listUser = users.map((user) => user.toObject())
                ExpenseSchema.find({
                    createdAt: {
                        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                    },
                })
                    .then((expenses) => {
                        const expense = expenses.map((expense) => expense.toObject());
                        expense.forEach((e) => {
                            listUser.splice(0, listUser.length, ...listUser.filter((user) => e.user_id != user._id));
                        });
                        mailSend(listUser);
                    })
                    .then(() => {
                        // Delivering mail with sendMail method
                        mailOptions.forEach((e) => {
                            transporter.sendMail(e, (error, info) => {
                                if (error) console.log(error);
                                else console.log('Email sent: ' + info.response);
                            });
                        })
                    })
            }
        })
});

module.exports = send;