'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
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
  }
},
{
  timestamps: {
    createdAt: 'creationDate',
    updatedAt: 'UpdateDate'
  }
});

module.exports = mongoose.model('User', schema);
