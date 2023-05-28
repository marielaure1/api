import stripePackage from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY 
const stripe = stripePackage(STRIPE_SECRET_KEY);


export const createChargeStripe = async (req, res, next) => {
    const { amount, user_id } = req.body

    try{
        
        const charge = await stripe.charges.create({
            amount: amount,
            currency: 'eur',
            customer: user_id,
            source: 'tok_mastercard'
        });

        res.charge = charge

        next()
    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        res.status(code).json({
            message
        })
    }
      
}

export const retrieveChargeStripe = async (req, res, next) => {
    const { id } = req.body

    try{
        
        const charge = await stripe.charges.retrieve(
            id
        );

        res.charge = charge

        next()
    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        res.status(code).json({
            message
        })
    }
      
}

export const updateChargeStripe = async (req, res, next) => {
    const { amount, user_id } = req.body

    try{
        
        const charge = await stripe.charges.update(
            id,
            {
                amount: amount,
                customer: user_id,
            }
        );

        res.charge = charge

        next()
    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        res.status(code).json({
            message
        })
    }
      
}

export const captureChargeStripe = async (req, res, next) => {
    const { user_id } = req.body

    try{

        const charge = await stripe.charges.capture(
            user_id
        );

        res.charge = charge

        next()
    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        res.status(code).json({
            message
        })
    }
      
}

export const listChargeStripe = async (req, res, next) => {
    const { limit } = req.body

    try{
        
        const charge = await stripe.charges.list({
            limit
        })

        res.charge = charge

        next()
    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        res.status(code).json({
            message
        })
    }
      
}