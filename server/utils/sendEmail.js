import nodemailer from "nodemailer";

const sendEmail = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  await transporter.verify();
  console.log("SMTP connection successful");
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    html: message,
  });
};

export default sendEmail;
