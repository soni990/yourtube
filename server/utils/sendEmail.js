import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      sender: {
        name: "YourTube",
        email: process.env.EMAIL_FROM,
      },
      to: [
        {
          email: to,
        },
      ],
    });

    console.log("Email sent successfully:", result);

    return result;
  } catch (error) {
    console.error("Brevo email error:", error);
    throw error;
  }
};

export default sendEmail;