const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nutritionSchema = new Schema({
    selected: {
        type: String,
        required: true
    },
    details: {
        type: String,
        default: ''
    }
});

const daySchema = new Schema({
    "Break Fast": nutritionSchema,
    "Mid-Morning Snacks": nutritionSchema,
    "Lunch": nutritionSchema,
    "Afternoon Snacks": nutritionSchema,
    "Dinner": nutritionSchema
});

const nutritionDetailsSchema = new Schema({
    Sunday: daySchema,
    Monday: daySchema,
    Tuesday: daySchema,
    Wednesday: daySchema,
    Thursday: daySchema,
    Friday: daySchema,
    Saturday: daySchema
});

const dietPlanSchema = new Schema({
    name:String,
    category:String,
    nutritionDetails: {
        type: nutritionDetailsSchema,
        required: true
    }
}, { timestamps: true });

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);

module.exports = DietPlan;
