import sendEmail from "./sendEmail.js";

//http://localhost:5173

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {
  const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;

  const message = `<p>Bitte bestätigen Sie Ihre E-Mail, indem Sie auf den folgenden Link klicken: <a href=${verifyEmail}>E-Mail bestätigen</a></p>`;
  return sendEmail({
    to: email,
    subject: "TODO LISTE E-Mail Bestätigung",
    html: `<h4>Hallo ${name}</h4> ${message}`,
  });
};

export default sendVerificationEmail;
