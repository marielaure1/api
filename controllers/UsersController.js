import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { emailValidator, passwordValidator } from "../features/UsersValidators.js";
import { createCustomerStripe, updateCustomerStripe, deleteCustomerStripe } from '../services/StripeService/StripeCustomersService.js';
import { sendWelcomeEmail } from '../services/MailTrapService/MailtrapService.js';
import crypto from 'crypto';
import { generatePasswordResetToken } from "../features/GenerateToken.js"

const { JWT_KEY } = process.env;
const prisma = new PrismaClient();

/**
 * POST api/user
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */

export const allData = async (req, res) => {
  try {
    const allUser = await prisma.users.findMany();

    if (!allUser) {
      throw new Error("Error Users");
    }

    res.json({
      allUser
    });
  } catch (error) {
    let message = "Une erreur s'est produite.";
    let code = 500;

    if (error === "Error Users") {
      message = "Il n'y a aucun utilisateur.";
    }

    console.log(error);

    res.status(code).json({
      message
    });
  }
};

export const createData = async (req, res) => {
  const { email, first_name, last_name, password, verifPassword, address, phone, role } = req.body;
  let emailError, first_nameError, last_nameError, passwordError, verifPasswordError, addressError, phoneError, roleError;
  let errors = false;

  if (!email || !first_name || !last_name || !password || !verifPassword || !phone || !role) {
    errors = true;

    emailError = email && email.trim() === "" ? "Veuillez saisir un email." : null;
    first_nameError = first_name && first_name.trim() === "" ? "Veuillez saisir un prénom." : null;
    last_nameError = last_name && last_name.trim() === "" ? "Veuillez saisir un nom." : null;
    passwordError = password && password.trim() === "" ? "Veuillez saisir un mot de passe." : null;
    verifPasswordError = verifPassword && verifPassword.trim() === "" ? "Veuillez confirmer le mot de passe." : null;
    phoneError = phone && phone.trim() === "" ? "Veuillez choisir un numéro de téléphone." : null;
    roleError = role && role.trim() === "" ? "Veuillez choisir un rôle." : null;
  }

  if(!emailValidator(email).validate){
    errors = true
    emailError = emailValidator(email).emailError
}

  let passwordValidatorResult = passwordValidator(password, verifPassword);

  if (!passwordValidatorResult.validate) {
    errors = true;

    if (passwordValidatorResult.passwordError) {
      passwordError = passwordValidatorResult.passwordError;
    }

    if (passwordValidatorResult.verifPasswordError) {
      verifPasswordError = passwordValidatorResult.verifPasswordError;
    }
  }

  if (errors) {
    return res.status(422).json({
      error: { emailError, first_nameError, last_nameError, passwordError, verifPasswordError, phoneError, roleError }
    });
  }

  let stripe_id = "N/A";

  if (email) {
    try {
      const findUser = await prisma.users.findFirst({ where: { email } });

      if (findUser) {
        return res.status(409).json({
          message: "Ce compte existe déjà."
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Une erreur s'est produite lors de la recherche de l'utilisateur."
      });
    }
  }

  try {
    const createUser = await prisma.users.create({
      data: {
        email,
        first_name,
        last_name,
        password: bcrypt.hashSync(password, 12),
        address,
        phone,
        role,
        stripe_id,
        passwordResetToken: generatePasswordResetToken(),
      }
    });
    


    try {
      const createStripeUser = await createCustomerStripe({ email, first_name, last_name, address, phone });

      if(createStripeUser.message){
        return res.status(200).json({
          message: "Erreur Stripe"
        });
      }

      try {
        const updateUser = await prisma.users.update({
          where: {
            id: createUser.id
          },
          data: {
            stripe_id: createStripeUser.stripe_id
          }
        });

        return res.status(200).json({
          message: "L'utilisateur a été créé avec succès."
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          message: "Une erreur s'est produite lors de l'ajout du stripe_id de l'utilisateur."
        });
      }

      try{
        const passwordResetLink = `${APP_URL}/reset-password/${updateUser.passwordResetToken}`;

        await sendWelcomeEmail(email, passwordResetLink);

        return res.status(200).json({
            message: "L'e-mail de bienvenue a été envoyé.",
            token: res.token
          });
      } catch(error){
        return res.status(409).json({
            message: "Une erreur s'est produite lors de l'envoi de l'e-mail de bienvenue."
          });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Une erreur s'est produite lors de l'ajout de l'utilisateur dans Stripe Client."
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Une erreur s'est produite lors de la création de l'utilisateur."
    });
  }
};

export const showData = async (req, res) => {
  const id = req.params.id;

  try {
    const showUser = await prisma.users.findUnique({
      where: {
        id: parseInt(id)
      },
    });

    if (!showUser) {
      throw new Error("Error Users");
    }

    return res.json({
      showUser
    });
  } catch (error) {
    let message = "Une erreur s'est produite.";
    let code = 500;

    if (error === "Error Users") {
      message = "Il n'y a aucun utilisateur.";
    }

    return res.status(code).json({
      message
    });
  }
};

export const updateData = async (req, res) => {
  const { email, first_name, last_name, address, phone, role } = req.body;
  let emailError, first_nameError, last_nameError, phoneError;
  let errors = false;

  if (!email || !first_name || !last_name || !phone) {
    errors = true;

    emailError = email && email.trim() === "" ? "Veuillez saisir un email." : null;
    first_nameError = first_name && first_name.trim() === "" ? "Veuillez saisir un prénom." : null;
    last_nameError = last_name && last_name.trim() === "" ? "Veuillez saisir un nom." : null;
    phoneError = phone && phone.trim() === "" ? "Veuillez choisir un numéro de téléphone." : null;
  }

  if(!emailValidator(email).validate){
    errors = true
    emailError = emailValidator(email).emailError
}


  if (errors) {
    return res.status(422).json({
      error: { emailError, first_nameError, last_nameError, phoneError }
    });
  }

  const id = req.params.id;

  try {
    
    const updateUser = await prisma.users.update({
      where: {
        id: parseInt(id)
      },
      data: {
        email,
        first_name,
        last_name,
        address,
        phone,
        role
      }
    });

    if (!updateUser) {
      throw new Error("Error Update");
    }

    return res.json({
      message: "L'utilisateur a été modifié avec succès.",
      updateUser
    });
  } catch (error) {
    let message = "Une erreur s'est produite.";
    let code = 500;

    if (error === "Error Update") {
      message = "Une erreur s'est produite lors de la modification de l'utilisateur.";
    }

    return res.status(code).json({
      message
    });
  }
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword, verifPassword } = req.body;
  let currentPasswordError, newPasswordError, verifPasswordError;
  let errors = false;

  if (!currentPassword || !newPassword || !verifPassword) {
    errors = true;

    currentPasswordError = currentPassword && currentPassword.trim() === "" ? "Veuillez votre un mot de passe actuel." : null;
    newPasswordError = newPassword && newPassword.trim() === "" ? "Veuillez saisir un nouveau mot de passe." : null;
    verifPasswordError = verifPassword && verifPassword.trim() === "" ? "Veuillez confirmer nouveau le mot de passe." : null;
  }

  let passwordValidatorResult = passwordValidator(newPassword, verifPassword);

  if (!newPasswordError && !passwordValidatorResult.validate) {
    errors = true;

    if (passwordValidatorResult.passwordError) {
      newPasswordError = passwordValidatorResult.passwordError;
    }

    if (passwordValidatorResult.verifPasswordError) {
      verifPasswordError = passwordValidatorResult.verifPasswordError;
    }
  }

  if (errors) {
    return res.status(422).json({
      error: { currentPasswordError, newPasswordError, verifPasswordError }
    });
  }

  const id = req.params.id;

  try {

    const findUser = await prisma.users.findFirst({
      where: {
        id: parseInt(id),
      },
    });

    if (!findUser) {
      return res.status(409).json({
        message: "Les identifiants sont incorrects.",
      });
    }

    bcrypt.compare(newPassword, findUser.password, (err, result) => {
      if (err || !result) {
        return res.status(409).json({
          message: "Mot de passe incorrect.",
        });
      }
    });

    const updateUser = await prisma.users.update({
      where: {
        id: parseInt(id),
      },
      data: {
        password: bcrypt.hashSync(newPassword, 12),
      },
    });

    if (!updateUser) {
      throw new Error("Error Update");
    }

    return res.json({
      message: "L'utilisateur a été modifié avec succès.",
      updateUser,
    });
  } catch (error) {
    let message = "Une erreur s'est produite.";
    let code = 500;

    if (error === "Error Update") {
      message = "Une erreur s'est produite lors de la modification de l'utilisateur.";
    }

    console.log(error);

    return res.status(code).json({
      message,
    });
  }
};

export const deleteData = async (req, res) => {
  const id = req.params.id;

  try {
    const deleteUser = await prisma.users.delete({
      where: {
        id: parseInt(id)
      }
    });

    if (!deleteUser) {
      throw new Error("Error Delete");
    }

    return res.json({
      message: "L'utilisateur a été supprimé avec succès.",
      deleteUser
    });
  } catch (error) {
    let message = "Une erreur s'est produite.";
    let code = 500;

    if (error === "Error Delete") {
      message = "Une erreur s'est produite lors de la suppression de l'utilisateur.";
    }

    return res.status(code).json({
      message
    });
  }
};

