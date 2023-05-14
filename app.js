import express from 'express'

// Routes
import productsRoutes from "./routes/ProductsRoutes.js"
import ingredientsRoutes from "./routes/IngredientsRoutes.js"
import usersRoutes from "./routes/UsersRoutes.js"
import authRoutes from "./routes/AuthRoutes.js"
// import subscriptionsRoutes from "./routes/PlansRoutes.js"
// import postsRoutes from "./routes/PostsRoutes.js"
// import usersRoutes from "./routes/UsersRoutes.js"
// import authRoutes from "./routes/AuthRoutes.js"
// import subscriptionsRoutes from "./routes/PlansRoutes.js"

// Middlewares
import { authentification } from "./middlewares/AuthMiddleware.js"
import { contentType } from "./middlewares/ContentTypeMiddleware.js"

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json())
app.use(contentType)
app.use("/api/products", productsRoutes)
app.use("/api/ingredients", ingredientsRoutes)
// app.use("api/subscriptions", subscriptionsRoutes)
// app.use("api/posts", postsRoutes)
app.use("/api/users", authentification, usersRoutes)
app.use("/api/auth", authRoutes)

// app.use("api/users", authentification, usersRoutes)

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});