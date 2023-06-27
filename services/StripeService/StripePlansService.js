import stripePackage from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY 
const stripe = stripePackage(STRIPE_SECRET_KEY);

// Créer un produit (Product)
const createProduct = async (name, description, images) => {
    const product = await stripe.products.create({
      name: name,
      description: description,
      images: images,
    });
    return product;
  };
  
  // Créer un prix (Price)
  const createPrice = async (productId, nickname, amount, currency, interval) => {
    const price = await stripe.prices.create({
      product: productId,
      nickname: nickname,
      unit_amount: amount,
      currency: currency,
      recurring: { interval: interval },
    });
    return price;
  };
  
  // Exemple d'utilisation
export  const createPlan = async (req, res, next) => {
    const { title, image, amount, slug, description, published, interval } = req.body

    try {
      // Créer un produit
      const product = await createProduct(title, description, [image]);
  
      // Créer un prix
      const price = await createPrice(product.id, `${title} prix`, parseInt(amount) * 100, 'eur', interval);

      console.log('Plan créé avec succès:', product, price);

      res.title = title
      res.image = image
      res.amount = amount
      res.slug = slug
      res.description = description
      res.published = published
      res.interval = interval
      res.lookup_key = price.id
      

      res.stripe_id = product.id


    next()
      
    } catch (error) {
      console.error('Erreur lors de la création du plan:', error);
    }
  };

// export const createPlanStripe = async (req, res, next) => {
//     const { title, image, amount, slug, description, published, interval } = req.body

//     try{
        
//         const plan = await stripe.products.create({ 
//             active: published,
//             name: title,
//             description: description,
//             images: [image]
//         });

//         const lookup_key_generate = await generateLookupKey(title, amount, interval)

//         if(!lookup_key_generate){
//             throw new Error("Error Lookup")
//         }

//         const price = await stripe.prices.create({
//             nickname: `${title} Pricing`,
//             unit_amount: parseInt(amount) * 100,
//             currency: 'eur',
//             recurring: {
//               interval: interval,
//             },
//             product: plan.id,
//             lookup_key: lookup_key_generate
//         });

//         if(!price){
//             throw new Error("Error Price")
//         }

//         console.log(price);

//         res.title = title
//         res.image = image
//         res.amount = amount
//         res.slug = slug
//         res.description = description
//         res.published = published
//         res.interval = interval
//         res.lookup_key = price.lookup_key
        

//         res.stripe_id = plan.id

//         next()
//     } catch(e){
//         let error = "Une erreur c'est produite."
//         let code = 500

//         if(e == "Error Lookup"){
//             error = "Le lookup_key n'a pas été généré."
//         }

//         if(e == "Error Price"){
//             error = "Le prix n'a pas été généré."
//         }

//         console.log(e);

//         return res.status(code).json({
//             error
//         })
//     }
      
// }

export const generateLookupKey = async (title, amount, interval) => {

    try{

        let lookup_keyB = `${title}-${amount}-${interval}`

        let lookup_key = lookup_keyB.toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Remplace les espaces par des tirets
        .replace(/[^\w\-]+/g, '') // Supprime les caractères non alphanumériques et les tirets
        .replace(/\-\-+/g, '-') // Remplace plusieurs tirets consécutifs par un seul tiret
        .replace(/^-+/, '') // Supprime les tirets en début de chaîne
        .replace(/-+$/, ''); // Supprime les tirets en fin de chaîne
        
        let priceExist = await stripe.prices.search({
            query: `lookup_key:\'${lookup_key}\'`
        });

        console.log(lookup_key);

        let priceNb = 1
        let priceGenerate = lookup_key

        while (priceExist.data.length > 0){
            priceGenerate = lookup_key + "-" + priceNb 
            priceNb++
            console.log(priceExist);
             priceExist = await stripe.prices.search({
                query: `lookup_key:\'${priceGenerate}\'`
              });

        }

        lookup_key = priceGenerate

        console.log(lookup_key);

        return lookup_key
    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        console.log(e);

        return false
    }
      
}

export const updatePlanStripe = async (req, res, next) => {

    const { title, image, description, published } = req.body

    if(!title || !image || !description){

        let titleError = (title && title.trim() == "") ??  "Veuillez saisir un titre."
        let imageError = (image && image == "") ??  "Veuillez choisir au moins une image."
        let descriptionError = (description && description.trim() == "") ??  "Veuillez saisir une description."

        return res.status(422).json({
            errors: { titleError, imageError, descriptionError }
        })
    }

    const id = req.params.id

    try{
        
        let planExist = await prisma.plans.findUnique({
            where: {
                id: parseInt(id),
            },
        })
    
        if(!planExist){
            throw new Error("Error Plan")
        }

        let priceExist = await stripe.prices.search({
            query: `lookup_key:\'${planExist.lookup_key}\'`
        });
    
        const plan = await stripe.products.update(
            planExist.stripe_id ,
            { 
                active: published,
                name: title,
                description: description,
                images: [image]
            }
        );
        
        const price = await stripe.prices.update(
            priceExist.data[0].id,
            {
            nickname: `${title} Pricing`,
        });

        res.title = title
        res.image = image
        res.description = description
        res.published = published
        res.oldTitle = planExist.title

        res.stripe_id = plan.id

        next()
    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        console.log(e);

        return res.status(code).json({
            error
        })
    }


    
    
      
}

export const deletePlanStripe = async (req, res, next) => {
    const id = req.params.id

    try{
        let planExist = await prisma.plans.findUnique({
            where: {
                id: parseInt(id)
            },
        })
    
        if(!planExist){
            throw new Error("Error Plan")
        }

        const plan = await stripe.plans.del(
            planExist.stripe_id
        );
    
        res.id = plan.id
    
        next()
    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Plan" || e == "PrismaClientValidationError:"){
            error = "Cet abonnement n'existe pas."
        }

        console.log(e);

        return res.status(code).json({
            error
        })
    } 
}
