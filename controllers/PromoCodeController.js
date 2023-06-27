import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const allData = async (req, res) => {
  try {

    const promoCodes = await prisma.Promo_Code.findMany();

    return res.json({ 
      promoCodes 
    });
  } catch (error) {

    console.log(error);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des codes promo.' });
  }
};

export const showData = async (req, res) => {
  const { id } = req.params;

  try {
    const showPromoCode = await prisma.Promo_Code.findUnique({ where: { id: parseInt(id) },  include: { categories: true} });

    if (!showPromoCode) {
      res.status(404).json({ error: 'Le code promo demandé est introuvable.' });
    } else {
      res.json({ showPromoCode });
    }
  } catch (error) {
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération du code promo.' });
  }
};

export const createData = async (req, res) => {
  const { code, reduction, expiration, categories } = req.body;

  try {
    const createPromoCode = await prisma.Promo_Code.create({
      data: {
        code,
        reduction: parseInt(reduction),
        expiration,
        categories: {
          connect: categories.map(categoryId => ({ id: parseInt(categoryId) })),
        },
      },
    });

    return res.status(201).json({ 
      message: "Code promo créé avec succès.",
      createPromoCode 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la création du code promo.' });
  }
};

export const updateData = async (req, res) => {
  const { id } = req.params;
  const { code, reduction, expiration, categories } = req.body;

  try {
    const updatePromoCode = await prisma.Promo_Code.update({
      where: { id: parseInt(id) },
      data: {
        code,
        reduction,
        expiration,
        categories: {
          set: categories.map(categoryId => ({ id: parseInt(categoryId) })),
        },
      },
    });

    return res.json({ 
      message: "Le code promo a été modifié avec succès",
      updatePromoCode 
    });
  } catch (error) {
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la mise à jour du code promo.' });
  }
};

export const deleteData = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.Promo_Code.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Le code promo a été supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la suppression du code promo.' });
  }
};
