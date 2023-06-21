import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createData = async (req, res, next) => {
  const { user_id, subscription_id, ingredients, pay } = req.body;

  try {
    const createdSubscriptionOrder = await prisma.subscriptions_Order.create({
      data: {
        user_id,
        subscription_id,
        ingredients,
        pay,
      },
    });

    res.status(200).json({
      message: "La commande d'abonnement a été créée avec succès.",
      subscriptionOrder: createdSubscriptionOrder,
    });

    next()
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur s'est produite lors de la création de la commande d'abonnement.",
    });
  }
};

export const allData = async (req, res) => {
  try {
    const subscriptionOrders = await prisma.subscriptions_Order.findMany();

    res.json({
      subscriptionOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur s'est produite lors de la récupération des commandes d'abonnement.",
    });
  }
};

export const showData = async (req, res) => {
  const { id } = req.params;

  try {
    const subscriptionOrder = await prisma.subscriptions_Order.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!subscriptionOrder) {
      return res.status(404).json({
        message: "La commande d'abonnement spécifiée est introuvable.",
      });
    }

    res.json({
      subscriptionOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur s'est produite lors de la récupération de la commande d'abonnement.",
    });
  }
};

export const updateData = async (req, res) => {
  const { id } = req.params;
  const { user_id, subscription_id, ingredients, pay } = req.body;

  try {
    const updatedSubscriptionOrder = await prisma.subscriptions_Order.update({
      where: {
        id: parseInt(id),
      },
      data: {
        user_id,
        subscription_id,
        ingredients,
        pay,
      },
    });

    res.json({
      message: "La commande d'abonnement a été mise à jour avec succès.",
      subscriptionOrder: updatedSubscriptionOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur s'est produite lors de la mise à jour de la commande d'abonnement.",
    });
  }
};

export const deleteData = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.subscriptions_Order.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.json({
      message: "La commande d'abonnement a été supprimée avec succès.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur s'est produite lors de la suppression de la commande d'abonnement.",
    });
  }
};
