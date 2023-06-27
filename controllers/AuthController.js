import { PrismaClient } from '@prisma/client'
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { emailValidator, passwordValidator } from "../features/UsersValidators.js"
// import { generatePasswordResetToken } from "../features/GenerateToken.js"
import { createCustomerStripe } from '../services/StripeService/StripeCustomersService.js'
import { sendWelcomeEmail } from '../services/MailTrapService/MailtrapService.js'

const { JWT_KEY } = process.env
const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { email, first_name, last_name, password, verifPassword } = req.body
    let emailError, first_nameError, last_nameError, passwordError, verifPasswordError;
    let errors = false;

    // console.log(req);
    
    if(!email || !first_name || !last_name || !password || !verifPassword){
        errors = true

        emailError = (!email || email.trim() == "") ? "Veuillez saisir votre email." : ""
        first_nameError = (!first_name && first_name.trim() == "") ?  "Veuillez saisir votre prénom." : ""
        last_nameError = (!last_name && last_name.trim() == "") ?  "Veuillez saisir votre nom." : ""
        passwordError = (!password && password.trim() == "") ?  "Veuillez saisir votre mot de passe." : ""
        verifPasswordError = (!verifPassword && verifPassword.trim() == "") ?  "Veuillez confirmer votre mot de passe." : ""

        console.log(first_nameError);
    } 
    
    if(!emailError && !emailValidator(email).validate){
        errors = true
        emailError = emailValidator(email).emailError
    } else{
        const findUser = await prisma.users.findFirst({
            where: { 
                email
            }
        })
        
        if(findUser){
            errors = true
            emailError = "Ce compte existe déjà."
        }
    }

    let passwordValidatorResult = passwordValidator(password, verifPassword)

    if(!password && !passwordValidatorResult.validate){
        errors = true

        if(passwordValidatorResult.passwordError){
            passwordError = passwordValidatorResult.passwordError
        }

        if(passwordValidatorResult.verifPasswordError){
            verifPasswordError = passwordValidatorResult.verifPasswordError
        }
    }

    if(errors) {

        
        return res.status(422).json({
            error: { emailError, first_nameError, last_nameError, passwordError, verifPasswordError }
        })
    }


    res.email = email
    res.first_name = first_name
    res.last_name = last_name
    res.password = bcrypt.hashSync(password, 12)
    
    next()
}

export const register = async (req, res) => {
    const { email, first_name, last_name, password } = res
    let stripe_id = "N/A"

    try{

        const createUser = await prisma.users.create({
            data: { 
                email, first_name, last_name, password, stripe_id
            },
        })

        const token = jwt.sign({ email: email }, JWT_KEY, { expiresIn: "2d" })

        if(!createUser){
            throw new Error("Error Create")
        }

        const createStripeUser = await createCustomerStripe({ email, first_name, last_name })

        if(!createStripeUser.stripe_id){
            throw new Error("Error Update")
        }
        const updateUser = await prisma.users.update({ 
            where: {
                id: createUser.id
            },
            data: { 
                stripe_id: createStripeUser.stripe_id
            }
        })

        if(!updateUser){
            throw new Error("Error Create Stripe")
        }

        const sendEmail = await sendWelcomeEmail(createUser.email)

        if(!sendEmail){
            throw new Error("Error Send Email")
        }

        return res.status(200).json({
            message: "L'utilisateur a été créé avec succès. Un email de bienvenue lui a été envoyé !",
            token
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Create"){
            error = "Une erreur c'est produite lors de la création de l'utilisateur."
        }

        if(e == "Error Update"){
            error = "Une erreur c'est produite lors de l'ajout du stripe_id de l'utilisateur."
        }

        if(e == "Error Send Email"){
            error = "Une erreur c'est produite lors de l'envoie de l'email à l'utilisateur."
        }

        console.log(e);

        return res.status(code).json({
            error
        })
    }
}
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            let emailError = !email || email.trim() === "" ? "Veuillez saisir votre email." : false;
            let passwordError = !password || password.trim() === "" ? "Veuillez saisir votre mot de passe." : false;

            return res.status(422).json({
                errors: {
                    emailError,
                    passwordError,
                },
            });
        }

        const findUser = await prisma.users.findFirst({
            where: {
                email,
            },
        });

        if (!findUser) {
            return res.status(409).json({
                message: "Les identifiants sont incorrects.",
            });
        }

        bcrypt.compare(password, findUser.password, (err, result) => {
            if (err || !result) {
                return res.status(409).json({
                    message: "Les identifiants sont incorrects.",
                });
            } else {
                const token = jwt.sign({ email: email }, JWT_KEY, { expiresIn: "1d" });

                return res.status(200).json({
                    token: token,
                    user: findUser
                });
            }
        });
        
    } catch (e) {
        console.log(e);
        let error = "Une erreur s'est produite.";
        let code = 500;

        res.status(code).json({
            error,
        });
    }
};

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            let emailError = !email || email.trim() === "" ? "Veuillez saisir votre email." : false;
            let passwordError = !password || password.trim() === "" ? "Veuillez saisir votre mot de passe." : false;

            return res.status(422).json({
                errors: {
                    emailError,
                    passwordError,
                },
            });
        }

        const findUser = await prisma.users.findFirst({
            where: {
                email,
            },
        });

        if (!findUser) {
            return res.status(409).json({
                message: "Les identifiants sont incorrects.",
            });
        }

        bcrypt.compare(password, findUser.password, (err, result) => {
            if (err || !result) {
                return res.status(409).json({
                    message: "Les identifiants sont incorrects.",
                });
            } else {

                if (!findUser.role == "ADMIN") {
                    return res.status(409).json({
                        message: "Accès non authorisé",
                    });
                }
        
                const token = jwt.sign({ email: email }, JWT_KEY, { expiresIn: "1d" });

                return res.status(200).json({
                    token: token,
                    user: findUser
                });
            }
        });

    } catch (e) {
        console.log(e);
        let error = "Une erreur s'est produite.";
        let code = 500;

        return res.status(code).json({
            error,
        });
    }
};

export const me = async (req, res) => {
    const { token } = res

    try{

        const findUser = await prisma.users.findFirst({
            where: { 
                email: token.email
            },
            include:{
                products_order: true,
                subscriptions_order: true,
                posts: true,
                subscriptions: true,
                favorites: true,
            }
        })
       
        if(!findUser){
            throw new Error("Error Me")
        }
        
        return res.status(200).json({
            me: findUser
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Me"){
            message = "Données indisponible"
        }

        console.log(error);

        return res.status(code).json({
            message
        })
    }
}

export const updateMe = async (req, res) => {
    const { email, first_name, last_name, address, phone } = req.body;
    let emailError, first_nameError, last_nameError;
    let errors = false;
  
    if (!email || !first_name || !last_name) {
      errors = true;
  
      emailError = !email || email.trim() === "" ? "Veuillez saisir un email." : null;
      first_nameError = !first_name || first_name.trim() === "" ? "Veuillez saisir un prénom." : null;
      last_nameError = !last_name || last_name.trim() === "" ? "Veuillez saisir un nom." : null;
    }
  
    if(!emailValidator(email).validate){
      errors = true
      emailError = emailValidator(email).emailError
  }
  
  
    if (errors) {
      return res.status(422).json({
        error: { emailError, first_nameError, last_nameError }
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
        }
      });
  
      if (!updateUser) {
        throw new Error("Error Update");
      }
  
      return res.json({
        message: "L'utilisateur a été modifié avec succès.",
        updateMe: updateUser
      });
    } catch (e) {
      let error = "Une erreur s'est produite.";
      let code = 500;
  
      if (e === "Error Update") {
        error = "Une erreur s'est produite lors de la modification de l'utilisateur.";
      }

      console.log(e);
  
      return res.status(code).json({
        error
      });
    }
  };
  

export const logout = async(req, res, next) => {

    try{

        console.log(req);
        
        // delete req.headers['authorization']

        return res.status(204).json({
            message: "Deconnexion"
        })


    } catch(error){
        let message = "Echec deconnexion"
        
        console.log(error);
        return res.status(401).json({
            message
        })
    }
}


export const resetTokenEmail = async (req, res) => {
  
    const email = req.body

    try {
  
      const user = await prisma.users.findFirst({
          where: {
            email
          },
      });


  
      return res.json({
        message: "Mail envoyé",
        token
      });
    } catch (error) {
      let message = "Une erreur s'est produite.";
      let code = 500;
  
      return res.status(code).json({
        message
      });
    }
  };

export const resetTokenLinkExist = async (req, res) => {
    const token = req.params.token;
  
    try {
  
      const user = await prisma.users.findFirst({
          where: {
            passwordResetToken: token,
            passwordResetTokenExpiration: {
              gte: Date.now(),
            },
          },
      });
  
      return res.json({
        message: "Modifier votre mot de passe.",
        token
      });
    } catch (error) {
      let message = "Une erreur s'est produite.";
      let code = 500;
  
      if (error === "Error Delete") {
        message = "Ce lien à expirer.";
      }
  
      return res.status(code).json({
        message
      });
    }
  };
  
  
  export const resetPassword = async (req, res) => {
    const token = req.params.token;
    const { password, passwordValidator } = req.body;
    let errors = false
  
    try {

        let passwordValidatorResult = passwordValidator(password, verifPassword)

        if(!passwordValidatorResult.validate){
            errors = true

            if(passwordValidatorResult.passwordError){
                passwordError = passwordValidatorResult.passwordError
            }

            if(passwordValidatorResult.verifPasswordError){
                verifPasswordError = passwordValidatorResult.verifPasswordError
            }
        }

        if(errors) {
            return res.status(422).json({
                error: {  passwordError, verifPasswordError }
            })
        }
  
      const user = await prisma.users.findFirst({
          where: {
            passwordResetToken: token
          },
      });

      const updateUser = await prisma.users.update({ 
        where: {
            id: user.id
        },
        data: { 
            password: bcrypt.hashSync(password, 12)
        }
    })
  
      return res.json({
        message: "Modification du mot de passe réussi.",
        token
      });
    } catch (error) {
      let message = "Une erreur s'est produite.";
      let code = 500;
  
      return res.status(code).json({
        message
      });
    }
  };