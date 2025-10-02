const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    phone: { type: String, required: true },
    notes: { type: String },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
