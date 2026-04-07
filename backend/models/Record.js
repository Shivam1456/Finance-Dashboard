const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, default: '' },
  amount:    { type: Number, required: true },
  currency:  { type: String, enum: ['$', '₹', '€'], default: '$' },
  type:      { type: String, enum: ['Income', 'Expense'], required: true },
  category:  { type: String, required: true },
  date:      { type: Date, default: Date.now },
  notes:     { type: String, default: '' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema);
