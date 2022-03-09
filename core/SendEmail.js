nodeMailer = require('nodemailer');

const EmailService = {
    send : (to, subject, body)  => {
        var transporter = nodeMailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "62ce606dd3b4d8",
              pass: "0f8c6f1727a1e5"
            }
          });
        let mailOptions = {
            // should be replaced with real recipient's account
            from: 'mailtrap@outlook.com',
            to: to,
            subject: subject,
            text: 'nice day',
            html: body
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return error;
            }
            //console.log('Message %s sent: %s', info.messageId, info.response);
        });
        // res.writeHead(301, { Location: 'index.html' });
        // res.end();
    }
}

module.exports = EmailService