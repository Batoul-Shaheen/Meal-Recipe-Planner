import express from "express";
import Recipe from "../recipe.js";

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const recipe = new Recipe(req.body);
        await recipe.save();
        res.status(201).send(recipe);   
    } catch (err) {
        res.status(400).send({ message: 'Error creating recipe', error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!recipe) return res.status(404).send({ message: 'Recipe not found' });
        res.send(recipe);
    } catch (err) {
        res.status(400).send({ message: 'Error updating recipe', error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndDelete(req.params.id);
        if (!recipe) return res.status(404).send({ message: 'Recipe not found' });
        res.send({ message: 'Recipe deleted' });
    } catch (err) {
        res.status(400).send({ message: 'Error deleting recipe', error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.send(recipes);
    } catch (err) {
        res.status(400).send({ message: 'Error fetching recipes', error: err.message });
    }
});

router.get('/nutrition', async (req, res) => {
    try {
        const nutrition = await Recipe.aggregate([
            {
                $group: {
                    _id: null,
                    totalCalories: { $sum: "$nutritionalInfo.calories" },
                    totalProtein: { $sum: "$nutritionalInfo.protein" },
                    totalCarbs: { $sum: "$nutritionalInfo.carbs" },
                    totalFats: { $sum: "$nutritionalInfo.fats" }
                }
            }
        ]);
        res.send(nutrition);
    } catch (err) {
        res.status(400).send({ message: 'Error aggregating nutrition info', error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).send({ message: 'Recipe not found' });
        res.send(recipe);
    } catch (err) {
        res.status(400).send({ message: 'Error fetching recipe', error: err.message });
    }
});

router.get('/search', async (req, res) => {
    try {
        const ingredient = req.query.ingredient;
        if (!ingredient) return res.status(400).send({ message: 'Ingredient query parameter is required' });
        const recipes = await Recipe.find({ ingredients: ingredient });
        res.send(recipes);
    } catch (err) {
        res.status(400).send({ message: 'Error searching recipes', error: err.message });
    }
});


export default router;