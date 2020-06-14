const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adoptionSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['permanent', 'temporary']
  },
  checkin: {
    type: Date,
    required: true,
    default: Date.now
  },
  cheackout: {
    type: Date,
    required: true,
    default: Date.now
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Adoption = mongoose.model('Adoption', adoptionSchema);
module.exports = Adoption;