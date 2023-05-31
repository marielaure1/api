import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { emailValidator, passwordValidator } from "../validators/UsersValidators.js";
import { createCustomerStripe, updateCustomerStripe, deleteCustomerStripe } from '../services/StripeService/StripeCustomersService.js';

const { JWT_KEY } = process.env;
const prisma = new PrismaClient();

/**
 * POST api/user
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */

export const request = async (req, res, next) => {
  const { email, first_name, last_name, password, verifPassword, address, phone, role } = req.body;
  let emailError, first_nameError, last_nameError, passwordError, verifPasswordError, addressError, phoneError, roleError;
  let errors = false;

  if (!email || !first_name || !last_name || !password || !verifPassword || !address || !phone || !role) {
    errors = true;

    emailError = email && email.trim() === "" ? "Veuillez saisir un email." : null;
    first_nameError = first_name && first_name.trim() === "" ? "Veuillez saisir un prénom." : null;
    last_nameError = last_name && last_name.trim() === "" ? "Veuillez saisir un nom." : null;
    passwordError = password && password.trim() === "" ? "Veuillez saisir un mot de passe." : null;
    verifPasswordError = verifPassword && verifPassword.trim() === "" ? "Veuillez confirmer le mot de passe." : null;
    addressError = address && address.trim() === "" ? "Veuillez choisir une adresse." : null;
    phoneError = phone && phone.trim() === "" ? "Veuillez choisir un numéro de téléphone." : null;
    roleError = role && role.trim() === "" ? "Veuillez choisir un rôle." : null;
  }

  // regex
  const emailRegex = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;

  if (!emailRegex.test(email)) {
    errors = true;
    emailError = "Veuillez saisir un email valide.";
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
      error: { emailError, first_nameError, last_nameError, passwordError, verifPasswordError, address, phone, role }
    });
  }

  res.email = email;
  res.first_name = first_name;
  res.last_name = last_name;
  res.password = bcrypt.hashSync(password, 12);
  res.address = address;
  res.phone = phone;
  res.role = role;

  next();
};

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

    res.status(code).json({
      message
    });
  }
};

export const createData = async (req, res) => {
  const { email, first_name, last_name, password, address, phone, role } = req.body;
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
        password,
        address,
        phone,
        role,
        stripe_id
      }
    });


    try {
      const createStripeUser = await createCustomerStripe({ email, first_name, last_name, address, phone });

      try {
        const updateUser = await prisma.users.update({
          where: {
            id: createUser.id
          },
          data: {
            stripe_id: createStripeUser
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

    res.json({
      showUser
    });
  } catch (error) {
    let message = "Une erreur s'est produite.";
    let code = 500;

    if (error === "Error Users") {
      message = "Il n'y a aucun utilisateur.";
    }

    res.status(code).json({
      message
    });
  }
};

export const updateData = async (req, res) => {
  const { email, first_name, last_name, password, address, phone, role } = res;
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
        password,
        address,
        phone,
        role
      }
    });

    if (!updateUser) {
      throw new Error("Error Update");
    }

    res.json({
      message: "L'utilisateur a été modifié avec succès.",
      updateUser
    });
  } catch (error) {
    let message = "Une erreur s'est produite.";
    let code = 500;

    if (error === "Error Update") {
      message = "Une erreur s'est produite lors de la modification de l'utilisateur.";
    }

    res.status(code).json({
      message
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

    res.json({
      message: "L'utilisateur a été supprimé avec succès.",
      deleteUser
    });
  } catch (error) {
    let message = "Une erreur s'est produite.";
    let code = 500;

    if (error === "Error Delete") {
      message = "Une erreur s'est produite lors de la suppression de l'utilisateur.";
    }

    res.status(code).json({
      message
    });
  }
};
