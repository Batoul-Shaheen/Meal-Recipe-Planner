import express from "express";
import mongoose from "mongoose";
import recipeRoutes from "./routes/recipes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use('/recipe', recipeRoutes)

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "mealrecipePlanner"
  }).then(() => {
    console.log('Successfully connected to MongoDB');
  }).catch((err) => {
    console.error('Connection error', err);
  });

app.listen(PORT, () => {
  console.log(`APP is listening in port ${PORT}`);
});
