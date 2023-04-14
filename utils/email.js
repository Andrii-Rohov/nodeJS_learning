const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    //1)Create a transporter (service to send emails)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMIAL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    //2) Define the email options
    const mailOptions = {
        "from": "Rohov Andrii",
        "to": options.email,
        "subject": options.subject,
        "text": options.message,
        // "html"
    }
    //3) Actually send the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;