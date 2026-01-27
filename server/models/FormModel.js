const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // This Array stores the JSON from your React Form Builder library
    // We don't need to define fields strictly here, just store the structure
    structure: { type: Array, required: true },

    // Logic Settings
    type: { type: String, enum: ['general', 'event'], default: 'general' },
    maxSubmissions: { type: Number, default: 0 },
    expiryDate: Date,
}, { timestamps: true });

const Form = mongoose.model('Form', formSchema);
module.exports = Form;