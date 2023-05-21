import { PrismaClient } from '@prisma/client'
import jwt from "jsonwebtoken"

const { JWT_KEY } = process.env
const prisma = new PrismaClient()

export const authentification = async(req, res, next) => {
    const header = req.headers['authorization']
    const tokenHeader = header && header.split(' ')[1]
    
    if(!tokenHeader){
        return res.status(500).json({
            message: "Vous devez être connecté"
        })
    }

    const token = jwt.verify(tokenHeader, JWT_KEY, function(err, success) {
        if (err){
            throw new Error("Invalid token")
        } else {
            return success
        }
      });

    try{
       
        const user = await prisma.users.findFirst({
            where: { 
                email: token.email
            }
        })
        
        if(!user){
            throw new Error("Echec authentification")
        }

        res.token = token

        next()

    } catch(error){
        let message = "Echec authentification"

        console.log(error)
        
        if(error == "Invalid token"){
            message = "Echec authentification1"
        }

        if(error == "Echec authentification"){
            message = "Echec authentification2"
        }
        return res.status(500).json({
            message
        })
    }
}

// export const noAuthentification = async(req, res, next) => {
//     const header = req.headers['authorization']
//     const tokenHeader = header && header.split(' ')[1]
    
//     if(!tokenHeader){
//         return res.status(500).json({
//             message: "erreur"
//         })
//     }

//     const token = jwt.verify(tokenHeader, JWT_KEY)

//     try{
       
//         const user = await prisma.users.findUnique({
//             where: { 
//                 email: token.email
//             }
//         })
        
//         if(!user){
//             throw new Error("Echec authentification")
//         }

//         res.token = token

//         next()

//     } catch(error){
//         let message = "Echec authentification"

//         if(error == "Echec authentification"){
//             message = "Echec authentification2"
//         }
//         return res.status(500).json({
//             message
//         })
//     }
// }