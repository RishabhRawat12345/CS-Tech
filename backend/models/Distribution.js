const mongoose = require('mongoose');

const DistributionSchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ListItem' }],
  originalFileName: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Distribution', DistributionSchema);
