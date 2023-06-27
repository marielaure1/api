import stripePackage from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY 
const stripe = stripePackage(STRIPE_SECRET_KEY);

export const createProductStripe = async (req, res, next) => {
    const { title, images, price, composition, short_description, description, published, stock, plan_id, collection_id, categories } = res

    try{
        
        const product = await stripe.products.create({
            name: title,
            images: images,
            description: description,
            metadata: {
                plan_id,
                collection_id,
                short_description,
            }
        });

        const stripePrice = await stripe.prices.create({
            product: product.id,
            unit_amount: parseInt(price) * 100, // Le montant doit être en centimes
            currency: 'EUR',
            // Autres détails du prix (optionnel)...
        });

        res.title = title
        res.images = images
        res.price = price
        res.composition = composition
        res.short_description = short_description
        res.description = description
        res.published = published
        res.stock = stock
        res.plan_id = plan_id
        res.collection_id = collection_id
        res.categories = categories

        res.stripe_id = product.id
        res.stripe_price_id = stripePrice.id

        next()
    } catch(error){
        let message = "Une erreur s'est produite."
        let code = 500

        console.log(error);
        res.status(code).json({
            message
        })
    }
}

export const updateProductStripe = async (req, res, next) => {
    const { title, images, price, composition, short_description, description, published, stock, plan_id, collection_id, categories, stripe_id, stripe_price_id } = res

    try{
        let productExist = await prisma.products.findUnique({
            where: {
                id: id,
                stripe_id: stripe_id
            },
        })
    
        if(!productExist){
            throw new Error("Error Product")
        }
    
        const product = await stripe.products.update(
            stripe_id ,
            { 
                name: title,
                images: images,
                description: description,
                metadata: {
                    plan_id,
                    collection_id
                }
            }
        );

        const newPrice = await stripe.prices.update(
            stripe_price_id,
            {
                unit_amount: price * 100, // Le montant doit être en centimes
                // Autres détails du prix (optionnel)...
            }
        );
    
        res.title = title
        res.images = images
        res.price = price
        res.composition = composition
        res.short_description = short_description
        res.description = description
        res.published = published
        res.stock = stock
        res.plan_id = plan_id
        res.collection_id = collection_id
        res.categories = categories
    
        next()

    } catch(error){
        let message = "Une erreur s'est produite."
        let code = 500

        if(error == "Error Product"){
            message = "Produit introuvable."
            code = 404
        }

        console.log(error);
        res.status(code).json({
            message
        })
    }
}

export const deleteProductStripe = async (req, res, next) => {
    const { stripe_id, stripe_price_id } = req.body

    try{
        const deletedProduct = await stripe.products.del(stripe_id);
        const deletedPrice = await stripe.prices.del(stripe_price_id);

        if (deletedProduct.deleted && deletedPrice.deleted) {
            next();
        } else {
            throw new Error("Erreur lors de la suppression du produit.");
        }
    } catch(error){
        let message = "Une erreur s'est produite lors de la suppression du produit."
        let code = 500

        console.log(error);
        res.status(code).json({
            message
        })
    }
}

