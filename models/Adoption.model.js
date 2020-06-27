const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adoptionSchema = new Schema({
  type: {
    type: String,
    enum: ['permanent', 'temporary']
  },
  checkin: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkout: {
    type: Date,
    default: Date.now
  },
  animal: {
    type: Schema.Types.ObjectId,
    ref: 'Animal',
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'You must be logged in to access to this feature']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    required: true
  }
});

const Adoption = mongoose.model('Adoption', adoptionSchema);
module.exports = Adoption;