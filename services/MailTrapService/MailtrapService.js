import nodemailer from 'nodemailer';


const { MAIL_TRAP_HOST, MAIL_TRAP_PORT, MAIL_TRAP_USER, MAIL_TRAP_PASS, APPLICATION_URL, BACKOFFICE_URL} = process.env


// Fonction pour envoyer l'e-mail de bienvenue User
export const sendWelcomeEmail = async (email) => {
  const transporter = nodemailer.createTransport({
    host: MAIL_TRAP_HOST,
    port: MAIL_TRAP_PORT,
    auth: {
        user: MAIL_TRAP_USER,
        pass: MAIL_TRAP_PASS
    }
  });

  const mailOptions = {
    from: 'no-reply@youvence.com',
    to: email,
    subject: 'Bienvenue sur Youvence !',
    html: `
      <h1>Bienvenue sur Youvence !</h1>
      <a href="${BACKOFFICE_URL}">Voir le site</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    return true
    console.log('E-mail de bienvenue envoyé !');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'e-mail de bienvenue :', error);

    return false
  }
};

// Fonction pour envoyer l'e-mail de bienvenue Admin
export const sendWelcomeEmailAdmin = async (email, passwordResetLink) => {
  const transporter = nodemailer.createTransport({
    host: MAIL_TRAP_HOST,
    port: MAIL_TRAP_PORT,
    auth: {
        user: MAIL_TRAP_USER,
        pass: MAIL_TRAP_PASS
    }
  });

  const mailOptions = {
    from: 'no-reply@youvence.com',
    to: email,
    subject: 'Bienvenue sur notre Youvence !',
    html: `
      <h1>Bienvenue sur notre Youvence !</h1>
      <p>Veuillez cliquer sur le lien suivant pour créer votre mot de passe :</p>
      <a href="${passwordResetLink}">Créer un mot de passe</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail de bienvenue envoyé !');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'e-mail de bienvenue :', error);
  }
};


export const sendResetPassord = async (email, passwordResetLink) => {
  const transporter = nodemailer.createTransport({
    host: MAIL_TRAP_HOST,
    port: MAIL_TRAP_PORT,
    auth: {
        user: MAIL_TRAP_USER,
        pass: MAIL_TRAP_PASS
    }
  });

  const mailOptions = {
    from: 'no-reply@youvence.com',
    to: email,
    subject: 'Youvence - Changement de mot de passe',
    html: `
      <h1>Changement de mot de passe</h1>
      <p>Veuillez cliquer sur le lien suivant pour modifier votre mot de passe :</p>
      <a href="${passwordResetLink}">Modifier un mot de passe</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail de bienvenue envoyé !');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'e-mail de reset mot de passe :', error);
  }
};
