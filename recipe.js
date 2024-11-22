import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
    name: String,
    ingredients: [String],
    preparationSteps: String,
    cookingTime: Number, 
    nutritionalInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fats: Number
    }
});

const Recipe = mongoose.model('meal', recipeSchema);
export default Recipe;
