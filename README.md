# API Youvence

## Description
Api pour un site de ecommerce avec un système d'abonnement Stripe.

Technologie utilisés : 
- Node.js
- Express
- MySQL
- Prisma
- Stripe
- Mailtrap
- JWT

## Structure du projet
Définit la logique de chaque route.

### Middlewares
Contient des fonctionnalités.

### Routes
Fichiers de définition des routes.

### Services
Services externes.

### Config
Fichiers de configuration.

app.js : Application de configuration de l'API avec Express.



Je veux que tu corrige mon shema prima en respectant la syntaxe que j'utilise et les relations ( ajouter les relations man,quante et supprimer les relations en trop):
la table Users peut avoir plusieurs Products_Order, plusierus Posts, plusieurs Subscriptions, plusieurs Favorites.
la table Products peux avoir plusieurs Categories, plusieurs Favorites et peut avoir un seul Plan.
la table Plan peut avoir plusieurs Products, plusieurs Subscriptions
la table Subscriptions peut avoir plusieurs Users, plusieurs Plan, plusieurs Subscriptions_Order 
la table Subscriptions_Order peut avoir plusieurs Subscriptions
la table Posts peut avoir plusieurs User
la table Products_Order peut avoir plusieurs users
la table Categories peut avoir plusieurs Promo_Code et plusieurs Products
la table Favorites peut avoir plusieurs Products et plusieurs Favorites
la table Promo_Code peut avoir plusieurs Categories

Voici mon shema prisma actuel : 
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Products {
  id                     Int                      @id @default(autoincrement())
  title                  String                   @db.VarChar(255)
  images                 Json
  price                  Float                    @db.Double
  slug                   String                   @unique(map: "Products_slug_key") @db.VarChar(255)
  composition            String                   @db.Text()
  short_description      String                   @db.Text()
  description            String                   @db.Text()
  created_at             DateTime                 @default(now())
  updated_at             DateTime                 @updatedAt
  categories             Categories[]             
  plan                   Plan @relation(fields: [plan_id], references: [id])
  plan_id                Int
}

model Ingredients {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(255)
  description String   @db.Text
  images      Json
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}

model Plan {
  id                     Int                      @id @default(autoincrement())
  title                  String                   @db.VarChar(255)
  image                  Json                     
  stripe_id              Float                    @db.Double
  slug                   String                   @unique(map: "Subscriptions_slug_key") @db.VarChar(255)
  description            String                   @db.Text
  created_at             DateTime                 @default(now())
  updated_at             DateTime                 @updatedAt
  products               Products[]
  users                  Users[]
  subscription           Subscriptions[]
}

model Subscriptions {
  id               Int      @id @default(autoincrement())
  users      Users     @relation(fields: [user_id], references: [id])
  user_id    Int 
  plan       Plan      @relation(fields: [plan_id], references: [id])
  plan_id    Int 
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt

  @@id([user_id, plan_id])
}

model Post {
  id                  Int                   @id @default(autoincrement())
  body                String                @db.Text
  image               String                
  title               String                @db.VarChar(255)
  slug                String                @db.VarChar(255)
  published           Boolean               
  published_at         DateTime              
  created_at           DateTime              @default(now())
  updated_at           DateTime              @updatedAt
  user_id             Int
  users               Users                 @relation(fields: [user_id], references: [id], map: "Posts_user_id_key")

  @@index([user_id], map: "Posts_user_id_key")
}

model Products_Order {
  id         Int      @id @default(autoincrement())
  user_id    Int
  products   Json
  ingredients Json?
  total      Float    @db.Double
  address    String   @db.Text
  pay        String?   @db.VarChar(255)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  users      Users    @relation(fields: [user_id], references: [id], map: "Products_Order_user_id_key")

  @@index([user_id], map: "Products_Order_user_id_key")
}

model Subscriptions_Order {
  id               Int      @id @default(autoincrement())
  user_id          Int
  subscription_id          Int
  ingredients      Json?
  pay              String   @db.VarChar(255)
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  users            Users    @relation(fields: [user_id], references: [id], map: "Subscriptions_Order_user_id_key")
  subscriptions    Subscriptions     @relation(fields: [subscription_id], references: [id], map: "Subscriptions_Order_subscription_id_key")

  @@index([user_id], map: "Subscriptions_Order_user_id_key")
}

model Categories {
  id        Int        @id @default(autoincrement())
  name      String     @unique
  created_at DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  products  Products[]
  promo_codes Promo_Code[]
}

model Favorites {
  id                  Int                   @id @default(autoincrement())
  created_at           DateTime              @default(now())
  updated_at           DateTime              @updatedAt
}

model Promo_Code {
  id           Int        @id @default(autoincrement())
  code         String     @unique
  reduction    Float
  expiration   DateTime
  created_at    DateTime   @default(now())
  updated_at    DateTime   @updatedAt
  categories   Categories[] 
}

model Users {
  id                  Int                   @id @default(autoincrement())
  email               String                @unique(map: "Users_email_key") @db.VarChar(255)
  first_name          String                @db.VarChar(255)
  last_name           String                @db.VarChar(255)
  address             Json?               
  phone               String?                
  password            String                @db.VarChar(255)
  role                Users_Role?           @default(USER)
  created_at          DateTime              @default(now())
  updated_at          DateTime              @updatedAt
  token               String?
  products_order      Products_Order[]
  subscriptions_order Subscriptions_Order[]
  posts               Post[]
  subscriptions       Subscriptions[]
  plan                Plan[]
}

model Error {
  id                  Int                   @id @default(autoincrement())
  message             Json
  created_at          DateTime              @default(now())
}

enum Users_Role {
  USER
  ADMIN
  SUPERADMIN
}

