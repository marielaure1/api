import { PrismaClient } from '@prisma/client'
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { emailValidator, passwordValidator } from "../validators/UsersValidators.js"
import { createCustomerStripe } from '../services/StripeService/StripeCustomersService.js'

const { JWT_KEY } = process.env
const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { email, first_name, last_name, password, verifPassword } = req.body
    let emailError, first_nameError, last_nameError, passwordError, verifPasswordError;
    let errors = false;

    if(!email || !first_name || !last_name || !password || !verifPassword){
        errors = true

        emailError = (email && email.trim() == "") ??  "Veuillez saisir votre email."
        first_nameError = (first_name && first_name.trim() == "") ??  "Veuillez saisir votre prénom."
        last_nameError = (last_name && last_name.trim() == "") ??  "Veuillez saisir votre nom."
        passwordError = (password && password.trim() == "") ??  "Veuillez saisir votre mot de passe."
        verifPasswordError = (verifPassword && verifPassword.trim() == "") ??  "Veuillez confirmer votre mot de passe."
    }

    if(!emailValidator(email).validate){
        errors = true
        emailError = emailValidator(email).emailError
    }

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

    const findUser = await prisma.users.findFirst({
        where: { 
            email
        }
    })
    
    if(findUser){
        errors = true
        emailError = "Ce compte existe déjà."
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

        console.log("test");

        const token = jwt.sign({ email: email }, JWT_KEY, { expiresIn: "2d" })

        if(!createUser){
            throw new Error("Error Create")
        }

        const createStripeUser = await createCustomerStripe({ email, first_name, last_name, password })

        const updateUser = await prisma.users.update({ 
            where: {
                id: createUser.id
            },
            data: { 
                stripe_id: createStripeUser
            }
        })

        if(!updateUser){
            throw new Error("Error Create Stripe")
        }

        return res.status(200).json({
            message: "L'utilisateur a été créé avec succès.",
            token
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Create"){
            message = "Une erreur c'est produite lors de la création de l'utilisateur."

            // try{
            //     const error = await prisma.error.create({
            //         data: { 
            //             message: {
            //                 route: "/api/auth/register",
            //                 error
            //             }
            //         },
            //     })
            // } catch(error){
            //     console.log(error)
            // }
        }

        if(error == "Error Update"){
            message = "Une erreur c'est produite lors de l'ajout du stripe_id de l'utilisateur."

            // try{
            //     const error = await prisma.error.create({
            //         data: { 
            //             message: {
            //                 route: "/api/auth/register",
            //                 error
            //             }
            //         },
            //     })
            // } catch(error){
            //     console.log(error)
            // }
        }

        // try{
        //     const error = await prisma.error.create({
        //         data: { 
        //             message: {
        //                 route: "/api/auth/register",
        //                 error
        //             }
        //         },
        //     })
        // } catch(error){
        //     console.log(error)
        // }

        console.log(error);

        return res.status(code).json({
            message
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body

    try{

        const findUser = await prisma.users.findFirst({
            where: { 
                email
            }
        })

        
        if(!findUser){
            throw new Error("Error SignIn")
        }

        bcrypt.compare(password, findUser.password, (err, rep) => {
            if (err){
                return res.status(409).json({
                    message: "Une erreur c'est produite"
                })
            } else if (!rep){
                return res.status(409).json({
                    message: "Mot de passe incorrect."
                })
            }
        })

        const token = jwt.sign({ email: email }, JWT_KEY, { expiresIn: "2d" })
        
        return res.status(200).json({
            token
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error SignIn"){
            message = "Les identifiants sont incorrects."
        }

        console.log(error);

        return res.status(code).json({
            message
        })
    }
}


export const me = async (req, res) => {
    const { token } = res

    try{

        const findUser = await prisma.users.findFirst({
            where: { 
                email: token.emal
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

export const logout = async(req, res, next) => {

    try{
        req.removeHeader('Authorization');

        return res.status(204).json({
            message: "Deconnexion"
        })


    } catch(error){
        let message = "Echec deconnexion"
        
        return res.status(401).json({
            message
        })
    }
}