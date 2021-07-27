const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Colaborador = new Schema({
    nome: {
        type: String,
        required: true
    },
    cargo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    departamento: {
        type: Schema.Types.ObjectId,
        ref: 'departamentos',
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('colaboradores', Colaborador)