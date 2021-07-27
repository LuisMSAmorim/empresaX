const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = new Schema ({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        required: true
    },
    ifAdmin: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now()
    } 
})

mongoose.model('users', User)