const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
}, { timestamps: true });


AgentSchema.virtual('name').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

AgentSchema.set('toJSON', { virtuals: true });
AgentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Agent', AgentSchema);
