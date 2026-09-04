import Brevo from "@getbrevo/brevo";

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sendEmail = async (email, subject, message) => {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = message;
    sendSmtpEmail.sender = {
      name: "YourTube",
      email: process.env.EMAIL_FROM,
    };
    sendSmtpEmail.to = [
      {
        email: email,
      },
    ];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("Email sent successfully:", data);

    return data;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

export default sendEmail;