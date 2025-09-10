import nodemailer from "nodemailer";
import nodemailerConfig from "./nodemailerConfig.js";

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport(nodemailerConfig);

  const info = await transporter.sendMail({
    from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
