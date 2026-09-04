import nodemailer from "nodemailer";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

const sendEmail = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
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
    subject,
    html: message,
  });
};

export default sendEmail;