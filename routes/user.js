const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
require('../models/Departamento')
const Departamento = mongoose.model('departamentos')
require('../models/Colaborador')
const Colaborador = mongoose.model('colaboradores')
const passport = require('passport')
const {ifUser} = require('../helpers/isUser')


// principal do user
router.get('/', ifUser, (req, res) => {
    res.render('users/index')
})

// login
router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/user',
        failureRedirect: '/user/login',
        failureFlash: true,
        successFlash: true
    })(req, res, next)

})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'Deslogado com sucesso')
    res.redirect('/')
})

router.get('/departamentos', ifUser, (req, res) => {
    Departamento.find().lean().sort({date: 'desc'}).then((departamentos) => {
        res.render('departamentos/index', {departamentos: departamentos})
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao listar os departamentos')
        req.redirect('/user')
    })
})

router.get('/colaboradores', ifUser, (req, res) => {
    Colaborador.find().lean().populate('departamento').sort({date: 'desc'}).then((colaboradores) => {
        res.render('colaboradores/index', {colaboradores: colaboradores})
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao listar os departamentos')
        req.redirect('/user')
    })
})

router.get('/colaboradores/:slug', ifUser, (req, res) => {
    Departamento.findOne({slug: req.params.slug}).lean().then((departamento) => {
        if(departamento){  
            
            Colaborador.find({departamento: departamento._id}).lean().then((colaboradores) => {

                res.render('departamentos/colaboradores', {colaboradores: colaboradores, departamento: departamento})

            }).catch((erro) => {
                req.flash('error_msg', 'Houve um erro interno ao listar os colaboradores deste departamento')
                res.redirect('/')
            })

        }else{
            req.flash('error_msg', 'Este departamento não existe')
            res.redirect('/user')
        }
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro interno ao carregar a pagina deste departamento')
        res.redirect('/user')
})
})

module.exports = router