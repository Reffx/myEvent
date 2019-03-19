var mongoose = require("mongoose");

var partySchema = new mongoose.Schema({
  name: String,
  image: String,
  imageId: String,
  description: String,
  cost: Number,
  createdAt: {type: Date, default: Date.now },
  age: Number,
  date: Date,
  location: String,
  lat: Number,
  lng: Number,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
});

module.exports = mongoose.model("Party", partySchema);
