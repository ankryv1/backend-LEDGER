import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

export const sendEmail = async (to, subject, text, html) => {
  try {

    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const info = await transporter.sendMail({
      from: `"Backend-Ledger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent:", info.messageId);

  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const sendRegistrationEmail = async (userEmail, name) => {

  const subject = "Welcome to Backend-Ledger 🎉";

  const text = `Hello ${name},
Welcome to Backend-Ledger!

Your account has been successfully created.

Thanks,
Backend-Ledger Team`;

  const html = `
  <div style="font-family: Arial, sans-serif; padding:20px;">
    <h2>Welcome to Backend-Ledger 🎉</h2>

    <p>Hello <b>${name}</b>,</p>

    <p>Your account has been successfully created.</p>

    <p>You can now start using our platform.</p>

    <br/>

    <p><b>Backend-Ledger Team</b></p>
  </div>
  `;

  await sendEmail(userEmail, subject, text, html);
};

export const sendTransactionEmail= async(userEmail, name, amount, toAccount) =>{
  const subject = "Transaction Successful";
  const text = `Hii ${name}, Your Transaction of ${amount} is complete`;
  const html = `<p>Hello, Your Transation is complete of amount ₹${amount}</p>`

  await sendEmail(userEmail, subject, text, html)
}

export const sendTransactionFailureEmail = async (userEmail, name, amount, toAccount) => {

  const subject = "Transaction Failed ❌";

  const text = `Hi ${name}, your transaction of ${amount} failed. Please try again.`;

  const html = `<p>Hello ${name},</p>
                <p>Your transaction of <b>${amount}</b> failed. Please try again.</p>`;

  await sendEmail(userEmail, subject, text, html);
};

