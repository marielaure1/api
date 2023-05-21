import { PrismaClient } from '@prisma/client'
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { email, first_name, last_name, password, verifPassword, address, phone, role } = req.body
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

    // regex
    const emailRegex = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;

    if(!emailRegex.test(email)){
        errors = true
        emailError = "Veuillez saisir un email valide."
    }

    if(!passwordRegex.test(password)){
        errors = true
        passwordError = "Veuillez saisir un mot de passe valide ( entre 8 et 20 caractères, au moins un chiffre, au moins une majuscule et une miniscule )"
    }

    if(password != verifPassword || verifPassword.trim().length > 0){
        errors = true
        passwordError = "Les deux mots de pass doit être identique"
    }

    if(!errors) {
        res.status(422).json({
            error: { emailError, first_nameError, last_nameError, passwordError, verifPasswordError }
        })
    }

    res.email = email
    res.first_name = first_name
    res.last_name = last_name
    res.password = bcrypt.hashSync(password, 12)
    res.address = address
    res.phone = phone
    res.role = role

    next()
}

export const allData = async (req, res) => {

    try{
        const allUser = await prisma.users.findMany()

        if(!allUser){
            throw new Error("Error Users")
        }

        res.json({
            allUser
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Users"){
            message = "Il n'y a aucun utilisateur."
        }

        res.status(code).json({
            message
        })
    }
}

export const createData = async (req, res) => {
    const { email, first_name, last_name, password, address, phone, role } = res

    try{

        const createUser = await prisma.users.create({
            data: { 
                email, first_name, last_name, password, address, phone, role
            },
        })

        if(!createUser){
            throw new Error("Error Create")
        }

        res.status(200).json({
            message: "L'utilisateur a été créé avec succès."
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Create"){
            message = "Une erreur c'est produite lors de la création de l'utilisateur."
        }

        res.status(code).json({
            message
        })
    }
}

export const showData = async (req, res) => {
    const id = req.params.id

    try{
        const showUser = await prisma.users.findUnique({
            where: {
              id: parseInt(id)
            },
          })

        if(!showUser){
            throw new Error("Error Users")
        }

        res.json({
            showUser
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Users"){
            message = "Il n'y a aucun utilisateur."
        }

        res.status(code).json({
            message
        })
    }
}

export const updateData = async(req, res) => {
    const { email, first_name, last_name, password, address, phone, role } = res
    const id = req.params.id

    try{
        const updateUser = await prisma.users.update({ 
            where: {
                id: parseInt(id)
            },
            data: { 
                email, first_name, last_name, password, address, phone, role
            }
        })

        if(!updateUser){
            throw new Error("Error Update")
        }

        res.json({
            message: "L'utilisateur a été modifié avec succès.",
            updateUser
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Update"){
            message = "Une erreur c'est produite lors de la modification de l'utilisateur."
        }

        res.status(code).json({
            message
        })
    }
}

export const deleteData = async(req, res) => {
    const id = req.params.id

    try{
        const deleteUser = await prisma.users.delete({ 
            where: {
                id: parseInt(id)
            }
        })

        if(!deleteUser){
            throw new Error("Error Delete")
        }

        res.json({
            message: "L'utilisateur a été supprimé avec succès.",
            deleteUser
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Delete"){
            message = "Une erreur c'est produite lors de la suppression de l'utilisateur."
        }

        res.status(code).json({
            message
        })
    }
}