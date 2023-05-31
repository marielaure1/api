import stripePackage from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY 
const stripe = stripePackage(STRIPE_SECRET_KEY);


export const createCustomerStripe = async (req) => {
    const { email, first_name, last_name, address, phone } = req

    try{
        
        const customer = await stripe.customers.create({
            email,
            name: first_name + " " + last_name,
            address,
            phone
        });

        let stripe_id = customer.id

        return stripe_id 

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        return message
    }
      
}

export const updateCustomerStripe = async (req, res, next) => {
    const { id, stripe_id, email, first_name, last_name, password, address, phone, role } = req.body

    try{
        let customerExist = await prisma.customers.findUnique({
            where: {
                id: id,
                stripe_id: stripe_id
            },
        })
    
        if(!customerExist){
            throw new Error("Error Customer")
        }
    
        const customer = await stripe.customers.update(
            stripe_id ,
            { 
                email,
                name: first_name + " " + last_name,
                address,
                phone
            }
        );
    
        res.email = email
        res.first_name = first_name
        res.last_name = last_name
        res.password = password
        res.address = address
        res.phone = phone
        res.role = role

        res.stripe_id = customer.id
    
        next()

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Customer"){
            message = "Ce client n'existe pas."
        }

        res.status(code).json({
            message
        })
    }
    
      
}

export const deleteCustomerStripe = async (req, res, next) => {
    const { id } = req.body

    try{
        let customerExist = await prisma.customers.findUnique({
            where: {
                id: id
            },
        })
    
        if(!customerExist){
            throw new Error("Error Customer")
        }

        const customer = await stripe.customers.del(
            customerExist.stripe_id
        )
    
        res.id = customer.id
    
        next()
    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Customer"){
            message = "Ce client n'existe pas."
        }

        res.status(code).json({
            message
        })
    } 
}
