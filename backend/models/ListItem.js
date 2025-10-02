const mongoose = require('mongoose');

const ListItemSchema = new mongoose.Schema({
  firstName: { type: String },
  phone: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('ListItem', ListItemSchema);
