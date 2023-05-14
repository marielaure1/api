import { PrismaClient } from '@prisma/client'
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { emailValidator, passwordValidator } from "../validators/UsersValidators.js"

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
        last_nameError = (last_name && last_name == "") ??  "Veuillez saisir votre nom."
        passwordError = (password && password == "") ??  "Veuillez saisir votre mot de passe."
        verifPasswordError = (verifPassword && verifPassword == "") ??  "Veuillez confirmer votre mot de passe."
    }

    if(!emailValidator(email).validate){
        errors = true
        emailError = emailValidator(email).emailError
    }

    if(!passwordValidator(password).validate){
        errors = true
        passwordError = passwordValidator(password).passwordError
        verifPasswordError = passwordValidator(password).verifPasswordError
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

    try{

        const token = jwt.sign({ email: email }, JWT_KEY, { expiresIn: "2d" })

        const createUser = await prisma.users.create({
            data: { 
                email, first_name, last_name, password, token
            },
        })

        if(!createUser){
            throw new Error("Error Create")
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
        }

        return res.status(code).json({
            message
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body

    try{

        const findUser = await prisma.users.findUnique({
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

        const updateToken = await prisma.users.update({ 
            where: {
                email: findUser.email
            },
            data: { 
                token
            }
        })
        
        return res.status(200).json({
            token
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error SignIn"){
            message = "Les identifiants sont incorrects."
        }

        return res.status(code).json({
            message
        })
    }
}

export const logout = async(req, res, next) => {

    try{
        res.setHeader('Authorization', '')

        return res.status(code).json({
            message: "Deconnexion"
        })


    } catch(error){
        let message = "Echec deconnexion"
        
        return res.status(500).json({
            message
        })
    }
}