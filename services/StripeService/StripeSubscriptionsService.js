import stripePackage from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = stripePackage(STRIPE_SECRET_KEY);
const APPLICATION_URL = process.env.APPLICATION_URL;


const createCheckoutSession = async (customerId, priceId, successUrl, cancelUrl) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId, // ID du client Stripe
    payment_method_types: ['card'], // Méthodes de paiement autorisées
    line_items: [
      {
        price: priceId, // ID du prix
        quantity: 1, // Quantité
      },
    ],
    mode: 'subscription', // Mode d'abonnement
    success_url: successUrl, // URL de redirection en cas de succès
    cancel_url: cancelUrl, // URL de redirection en cas d'annulation
  });
  return session;
};

// Exemple d'utilisation
export const createSubscription = async (req, res) => {
  const { user, plan } = res;

  try {
    const customerId = user.stripe_id; // ID du client Stripe
    const priceId = plan.lookup_key; // ID du prix
    const successUrl = APPLICATION_URL + '/checkout?success=true'; // URL de redirection en cas de succès
    const cancelUrl = APPLICATION_URL + '/checkout?success=false'; // URL de redirection en cas d'annulation

    const session = await createCheckoutSession(customerId, priceId, successUrl, cancelUrl);
    console.log('Session de paiement créée avec succès:', session);

    res.json({
      session: session,
      message: 'Session de paiement créée avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error);
  }
};

// export const createSubscriptionStripe = async (req, res, next) => {
  // const { user, plan } = res;

  // try {
  //   // Créer un abonnement avec l'API Stripe
  //   const subscription = await stripe.subscriptions.create({
  //     customer: user.stripe_id,
  //     items: [{ price: plan.lookup_key }],
  //     payment_behavior: 'default_incomplete',
  //     payment_settings: { save_default_payment_method: 'on_subscription' },
  //     expand: ['latest_invoice.payment_intent'],
  //     // billing_cycle_anchor: Math.floor(Date.now() / 1000),
  //     // cancel_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90, // Annuler l'abonnement après 90 jours
  //   });

  //   console.log("eee");

  //   res.user = user;
  //   res.subscriptionId = subscription.id;
  //   res.clientSecret = subscription.latest_invoice.payment_intent.client_secret;

  //   next();
  // } catch (error) {
  //   let message = "Une erreur s'est produite.";
  //   let code = 500;

  //   console.log("subscription : " + error);
  //   res.status(code).json({
  //     message
  //   });
  // }
// };

// export const createCheckoutSession = async (req, res) => {
//   const { lookup_key } = req.body;
//   const { user } = res;

//   try {
//     const prices = await stripe.prices.list({
//       lookup_keys: [lookup_key],
//       expand: ['data.product'],
//     });

//     const session = await stripe.checkout.sessions.create({
//       billing_address_collection: 'auto',
//       line_items: [
//         {
//           price: prices.data[0].id,
//           // For metered billing, do not pass quantity
//           quantity: 1,
//         },
//       ],
//       mode: 'subscription',
//       success_url: `${YOUR_DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${YOUR_DOMAIN}?canceled=true`
//     });

//     console.log("fff");

//     return res.json({ url: session.url, session_id: session.id, user_id: user.id });
//   } catch (e) {
//     console.log(e);
//   }
// };

// export const createPortalSession = async (req, res) => {
//   const { session_id, user_id } = req.body;
//   const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

//   // This is the url to which the customer will be redirected when they are done
//   // managing their billing with the portal.
//   const returnUrl = YOUR_DOMAIN;

//   const portalSession = await stripe.billingPortal.sessions.create({
//     customer: checkoutSession.customer,
//     return_url: returnUrl,
//   });

//   console.log("ggg");

//   res.url = portalSession.url;
//   res.user_id = user_id;
// };

// export const webHook = async (req, res) => {
//   let event = req.body;
//   // Replace this endpoint secret with your endpoint's unique secret
//   // If you are testing with the CLI, find the secret by running 'stripe listen'
//   // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
//   // at https://dashboard.stripe.com/webhooks
//   const endpointSecret = 'whsec_a227014db871d2213dfd841aa8e7b60d7319d12c62acfe1e3b02f109aebb7f37';
//   // Only verify the event if you have an endpoint secret defined.
//   // Otherwise use the basic event deserialized with JSON.parse
//   if (endpointSecret) {
//     // Get the signature sent by Stripe
//     const signature = req.headers['stripe-signature'];
//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         signature,
//         endpointSecret
//       );
//     } catch (err) {
//       console.log(`⚠️  Webhook signature verification failed.`, err.message);
//       return res.sendStatus(400);
//     }
//   }
//   let subscription;
//   let status;
//   // Handle the event
//   switch (event.type) {
//     case 'customer.subscription.trial_will_end':
//       subscription = event.data.object;
//       status = subscription.status;
//       console.log(`Subscription status is ${status}.`);
//       // Then define and call a method to handle the subscription trial ending.
//       // handleSubscriptionTrialEnding(subscription);
//       break;
//     case 'customer.subscription.deleted':
//       subscription = event.data.object;
//       status = subscription.status;
//       console.log(`Subscription status is ${status}.`);
//       // Then define and call a method to handle the subscription deleted.
//       // handleSubscriptionDeleted(subscriptionDeleted);
//       break;
//     case 'customer.subscription.created':
//       subscription = event.data.object;
//       status = subscription.status;
//       console.log(`Subscription status is ${status}.`);
//       // Then define and call a method to handle the subscription created.
//       // handleSubscriptionCreated(subscription);
//       break;
//     case 'customer.subscription.updated':
//       subscription = event.data.object;
//       status = subscription.status;
//       console.log(`Subscription status is ${status}.`);
//       // Then define and call a method to handle the subscription update.
//       // handleSubscriptionUpdated(subscription);
//       break;
//     default:
//       // Unexpected event type
//       console.log(`Unhandled event type ${event.type}.`);
//   }
//   // Return a 200 response to acknowledge receipt of the event
//   return res.send();
// };

export const webHook = async (req, res) => {
  const event = req.body;

  // Vérifiez la signature de l'événement pour vous assurer qu'il provient bien de Stripe
  const stripeSignature = req.headers['stripe-signature'];

  try {
    const validatedEvent = stripe.webhooks.constructEvent(
      event,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Traitement de l'événement Stripe
    if (validatedEvent.type === 'checkout.session.completed') {
      // L'événement est une session de paiement terminée (succès du paiement)
      const session = validatedEvent.data.object;

      // Traitez les informations de la session de paiement ici
      const userId = session.customer;
      const planId = session.metadata.plan_id;
      const amountPaid = session.amount_total;

      // Effectuez les opérations nécessaires avec les données récupérées

      // Répondez à Stripe pour confirmer la réception de l'événement
      res.status(200).json({ received: true, session });
    } else {
      // Autres types d'événements Stripe (facultatif)
      // Gérez-les en fonction de vos besoins
      res.status(200).json({ received: true, validatedEvent });
    }
  } catch (error) {
    // Gestion des erreurs de traitement des événements Stripe
    console.error(error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
};


export const updateSubscriptionStripe = async (req, res, next) => {
  const { id, subscription_id, user_id, plan_id } = req.body;

  try {
    let subscriptionExist = await prisma.subscriptions.findUnique({
      where: {
        id: id,
        subscription_id: subscription_id
      },
    });

    if (!subscriptionExist) {
      throw new Error("Error Subscription");
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
      }
    );

    res.subscription = subscription;
    res.user_id = user_id;
    res.plan_id = plan_id;
    res.id = id;

    next();
  } catch (error) {
    let message = "Une erreur s'est produite.";
    let code = 500;

    if (error === "Error Subscription") {
      message = "Cet abonnement n'existe pas.";
    }

    res.status(code).json({
      message
    });
  }
};

export const deleteSubscriptionStripe = async (req, res, next) => {
  const { id } = req.body;

  try {
    let subscriptionExist = await prisma.subscriptions.findUnique({
      where: {
        id: id
      },
    });

    if (!subscriptionExist) {
      throw new Error("Error Subscription");
    }

    const subscription = await stripe.subscriptions.del(
      subscriptionExist.subscription_id
    );

    res.id = id;

    next();
  } catch (error) {
    let message = "Une erreur s'est produite.";
    let code = 500;

    if (error === "Error Subscription") {
      message = "Cet abonnement n'existe pas.";
    }

    res.status(code).json({
      message
    });
  }
};
