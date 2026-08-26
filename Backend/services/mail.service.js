const { createTransport } = require("nodemailer");

const transport = createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  const info = await transport.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    html,
  });

  console.log("Email sent:", info.messageId);
  return info;
};

module.exports = {
  sendMail,
};
