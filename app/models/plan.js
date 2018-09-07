const mongoose = require('mongoose')

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    food: {
      type: String,
      required: true
    },
    movie: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: false
    },
    start_time: {
      type: String,
      required: false
    },
    end_time: {
      type: String,
      required: false
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Plan', planSchema)
