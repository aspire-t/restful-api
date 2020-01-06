const mongoose = require('mongoose')

const { Schema, model } = mongoose

const userSchema = new Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true },
  password: { type: String, required: true, select: false }// select: false这样在请求返回的时候，不会返回这个值
})

module.exports = model('User', userSchema) 