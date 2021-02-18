'use strict';
const ListSchema = require('./../models/shopList');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String, 
    default: 'https://res.cloudinary.com/dshasfnu4/image/upload/v1613421182/rflqat8clopn1qvj4hkq.jpg'
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  passwordHashAndSalt: {
    type: String
  },
  addressStreet: {
    type: String,
  },
  addressHouseNr: {
    type: Number,
  },
  addressZip: {
    type: Number,
  },
  addressCity: {
    type: String
  },
  addressCountry: {
    type: String,
  },
  lat: {
    type: Number
  },
  lng: {
    type: Number
  },
  createdLists:[{
    type: mongoose.Types.ObjectId,
    ref: 'shopList'
  }]
},
{
  timestamps: {
    createdAt: 'creationDate',
    updatedAt: 'UpdateDate'
  }
});

module.exports = mongoose.model('User', schema);
