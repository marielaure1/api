import stripePackage from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY 
const stripe = stripePackage(STRIPE_SECRET_KEY);


export const createSubscriptionStripe = async (req, res) => {
    const { user_stripe_id, plan_stripe_id  } = res

    try{
    
        // Créer un abonnement avec l'API Stripe
        const subscription = await stripe.subscriptions.create({
            customer: user_stripe_id,
            items: [{ plan: plan_stripe_id }],
            billing_cycle_anchor: Math.floor(Date.now() / 1000),
            cancel_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90, // Annuler l'abonnement après 90 jours
        });
    
        res.subscription = subscription
    } catch(error){  
        let message = "Une erreur c'est produite."
        let code = 500

        console.log("subscription order : " + error);
        res.status(code).json({
            message
        })
    }
      
}

export const checkout = async (req, res) => {
    const { amount } = res

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "eur",
        automatic_payment_methods: {
            enabled: true,
        },
    });
  
    res.send({
        clientSecret: paymentIntent.client_secret,
    });
}

export const updateSubscriptionStripe = async (req, res, next) => {
    const { id, subscription_id, user_id, plan_id } = req.body

    try{
        let subscriptionExist = await prisma.subscriptions.findUnique({
            where: {
                id: id,
                subscription_id: subscription_id
            },
        })
    
        if(!subscriptionExist){
            throw new Error("Error Subscription")
        }
    
        const subscription = await stripe.subscriptions.update(
            subscription_id,
            {
            customer: user_id,
            items: [{ plan: plan_id }],
            billing_cycle_anchor: 'now',
            trial_period_days: 0,
            billing_thresholds: {
            amount_gte: 0,
            reset_billing_cycle_anchor: true,
            },
            cancel_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90, // Annuler l'abonnement après 90 jours
        });
    
        res.subscription = subscription
        res.user_id = user_id
        res.plan_id = plan_id
        res.id = id

        next()

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Subscription"){
            message = "Cet abonnement n'existe pas."
        }

        res.status(code).json({
            message
        })
    }
    
      
}

export const deleteSubscriptionStripe = async (req, res, next) => {
    const { id } = req.body

    try{

        let subscriptionExist = await prisma.subscriptions.findUnique({
            where: {
                id: id
            },
        })
    
        if(!subscriptionExist){
            throw new Error("Error Subscription")
        }

        const subscription = await stripe.subscriptions.del(
            subscriptionExist.subscription_id
        );
    
        res.id = id
    
        next()
    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Subscription"){
            message = "Cet abonnement n'existe pas."
        }

        res.status(code).json({
            message
        })
    }
}