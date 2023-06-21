import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createData = async (req, res) => {
  const { user_id, products, ingredients, total, address, pay } = req.body;

  try {
    const createdProductOrder = await prisma.products_Order.create({
      data: {
        user_id,
        products,
        ingredients,
        total,
        address,
        pay,
      },
    });

    res.status(200).json({
      message: "La commande de produit a été créée avec succès.",
      productOrder: createdProductOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur s'est produite lors de la création de la commande de produit.",
    });
  }
};

export const allData = async (req, res) => {
  try {
    const productOrders = await prisma.products_Order.findMany();

    res.json({
      productOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur s'est produite lors de la récupération des commandes de produit.",
    });
  }
};

export const showData = async (req, res) => {
  const { id } = req.params;

  try {
    const productOrder = await prisma.products_Order.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!productOrder) {
      return res.status(404).json({
        message: "La commande de produit spécifiée est introuvable.",
      });
    }

    res.json({
      productOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur s'est produite lors de la récupération de la commande de produit.",
    });
  }
};

export const updateData = async (req, res) => {
  const { id } = req.params;
  const { user_id, products, ingredients, total, address, pay } = req.body;

  try {
    const updatedProductOrder = await prisma.products_Order.update({
      where: {
        id: parseInt(id),
      },
      data: {
        user_id,
        products,
        ingredients,
        total,
        address,
        pay,
      },
    });

    res.json({
      message: "La commande de produit a été mise à jour avec succès.",
      productOrder: updatedProductOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur s'est produite lors de la mise à jour de la commande de produit.",
    });
  }
};

export const deleteData = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.products_Order.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.json({
      message: "La commande de produit a été supprimée avec succès.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur s'est produite lors de la suppression de la commande de produit.",
    });
  }
};
