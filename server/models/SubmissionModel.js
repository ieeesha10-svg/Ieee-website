const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },

    // Flexible Object to store answers (e.g., { name: "Ali", year: "3" })
    data: { type: Object, required: true },

    // Event Specifics (Only used if form.type === 'event')
    ticketCode: { type: String, unique: true, sparse: true }, // The QR Data
    attended: { type: Boolean, default: false },
    attendedAt: Date
}, { timestamps: true });
const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;