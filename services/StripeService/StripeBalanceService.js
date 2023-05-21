import stripePackage from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY 
const stripe = stripePackage(STRIPE_SECRET_KEY);


export const retrieveBalanceStripe = async (req, res, next) => {
    const { id } = req.body

    try{
        
        const balanceTransaction = await stripe.balanceTransactions.retrieve(
            id
        );

        res.balance = balanceTransaction

        next()
    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        res.status(code).json({
            message
        })
    }
      
}

export const listBalanceStripe = async (req, res, next) => {
    const { limit } = req.body

    try{
        
        const balanceTransactions = await stripe.balanceTransactions.list({
            limit
        })

        res.balance = balanceTransactions

        next()
    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        res.status(code).json({
            message
        })
    }
      
}