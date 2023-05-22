const mongoose = require("mongoose");
const personSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      required: true,
    },
  }, {
      timestamps: true,
      toJSON: {
          transform: (doc, ret) => {
              ret.id = doc._id
              delete ret._id
              delete ret.__v
              return ret
          }
      },
      versionKey: false
  });
  
module.exports = mongoose.model("Person", personSchema, "People");