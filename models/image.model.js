const mongoose = require('mongoose')
const Schema = mongoose.Schema

const imageSchema = new Schema({
    originalName: String,
    fileName: String,
    path: String
})

module.exports = mongoose.model('Image', imageSchema)