const mongoose = require("mongoose");
const coinsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  photos: {
    type: Array,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  features: {
    type: Object,
    required: true,
  },
});
let coins = mongoose.model("coins", coinsSchema);
module.exports = coins;
