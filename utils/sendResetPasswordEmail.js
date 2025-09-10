import sendEmail from "./sendEmail.js";

const sendResetPasswordEmail = async ({ name, email, token, origin }) => {
  const resetPasswordURL = `${origin}/user/reset-password/?token=${token}&email=${email}`;

  const message = `<p>Bitte setzen Sie das Passwort zurück, indem Sie auf den folgenden Link klicken: <a href=${resetPasswordURL}>Passwort zurücksetzen</a></p>`;
  return sendEmail({
    to: email,
    subject: "TODO LISTE Passwort zurücksetzen",
    html: `<h4>Hallo ${name}</h4> ${message}`,
  });
};

export default sendResetPasswordEmail;
