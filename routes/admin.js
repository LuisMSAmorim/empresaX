const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Departamento')
const Departamento = mongoose.model('departamentos')
require('../models/Colaborador')
const Colaborador = mongoose.model('colaboradores')
require('../models/User')
const User = mongoose.model('users')
const bcrypt = require('bcryptjs')
const {ifAdmin} = require('../helpers/ifAdmin')
const {ifUser} = require('../helpers/isUser')

// principal do admin
router.get('/', ifAdmin, (req, res) => {
    res.render('admin/index')
})

// departamentos
router.get('/departamentos', ifAdmin, (req, res) => {
    Departamento.find().lean().sort({date: 'desc'}).then((departamentos) => {
        res.render('admin/departamentos', {departamentos: departamentos})
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao listar os departamentos')
        req.redirect('/admin')
    })
})

router.get('/departamentos/add', ifAdmin, (req, res) => {
    res.render('admin/adddepartamentos')
})

router.post('/departamentos/novo', ifAdmin, (req, res) => {

    let erros = []

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        erros.push({texto: 'Nome inválido, tente novamente'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido, tente novamente'})
    }

    if(req.body.name.length < 2){
        erros.push({texto: 'Nome muito pequeno, tente novamente'})
    }

    if(erros.length > 0){
        res.render('admin/adddepartamentos', {erros: erros})
    }else{
        const novoDepartamento = {
            nome: req.body.name,
            slug: req.body.slug
        }
        new Departamento(novoDepartamento).save().then(() => {
            req.flash('success_msg', 'Departamento criado com sucesso')
            res.redirect('/admin/departamentos')
        }).catch((erro) => {
            req.flash('error_msg', 'Houve um erro ao criar o departamento')
            res.redirect('/admin/departamentos')
        })
    }

})

router.get('/departamentos/edit/:id', ifAdmin, (req, res) => {
    Departamento.findOne({_id: req.params.id}).lean().then((departamento) => {
        res.render('admin/editdepartamentos', {departamento: departamento})
    }).catch((erro) => {
        req.flash('error_msg', 'Este departamento não existe')
        res.redirect('/admin/departamentos')
    })
})

router.post('/departamentos/edit', ifAdmin, (req, res) => {

    let erros = []

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        erros.push({texto: 'Nome inválido, tente novamente'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido, tente novamente'})
    }

    if(req.body.name.length < 2){
        erros.push({texto: 'Nome muito pequeno, tente novamente'})
    }

    if(erros.length > 0){
        res.render('admin/adddepartamentos', {erros: erros})
    }else{
        Departamento.findOne({_id: req.body.id}).then((departamento) => {

            departamento.nome = req.body.name
            departamento.slug = req.body.slug
    
            departamento.save().then(() => {
                req.flash('success_msg', 'Departamento editado com sucesso')
                res.redirect('/admin/departamentos')
            }).catch((erro) => {
                req.flash('error_msg', 'Erro ao salvar edição do departamento')
                res.redirect('/admin/departamentos')
            })
        
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao editar departamento')
            res.redirect('/admin/departamentos')
        })
    }
})

router.post('/departamentos/delete', ifAdmin, (req, res) => {
    Departamento.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Departamento excluído com sucesso')
        res.redirect('/admin/departamentos')
    }).catch(((erro) => {
        req.flash('error_msg', 'Erro ao excluir departamento')
        res.redirect('/admin/departamentos')
    }))
})

// colaboradores
router.get('/colaboradores', ifAdmin, (req, res) => {
    Colaborador.find().lean().populate('departamento').sort({date: 'desc'}).then((colaboradores) => {
        res.render('admin/colaboradores', {colaboradores: colaboradores})
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao listar os colaboradores')
        res.redirect('/admin')
    })
})

router.get('/colaboradores/add', ifAdmin, (req, res) => {
    Departamento.find().lean().then((departamentos) => {
        res.render('admin/addcolaboradores', {departamentos: departamentos})
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário')
        res.redirect('/admin/colaboradores')
    })
})

router.post('/colaboradores/novo', ifAdmin, (req, res) => {

    let erros = []

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        erros.push({texto: 'Nome inválido, tente novamente'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido, tente novamente'})
    }

    if(!req.body.cargo || typeof req.body.cargo == undefined || req.body.cargo == null){
        erros.push({texto: 'Cargo inválido, tente novamente'})
    }

    if(req.body.name.length < 2){
        erros.push({texto: 'Nome muito pequeno, tente novamente'})
    }

    if(req.body.cargo.length < 2){
        erros.push({texto: 'Nome do cargo muito pequeno, tente novamente'})
    }

    if(req.body.departamento == '0'){
        erros.push({texto: 'Departamento inválido, selecione um departamento'})
    }

    if(erros.length > 0){
        res.render('admin/adddepartamentos', {erros: erros})
    }else{

        const novoColaborador = {
            nome: req.body.name,
            slug: req.body.slug,
            cargo: req.body.cargo,
            departamento: req.body.departamento
        }

        new Colaborador(novoColaborador).save().then(() => {
            req.flash('success_msg', 'Colaborador cadastrado com sucesso')
            res.redirect('/admin/colaboradores')
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao cadastrar colaborador')
            res.redirect('/admin/colaboradores')
            console.log(erro)
        })
    }
})

router.get('/colaboradores/edit/:id', ifAdmin, (req, res) => {
    Colaborador.findOne({_id: req.params.id}).lean().then((colaborador) => {
        Departamento.find().lean().then((departamentos) => {
            res.render('admin/editcolaboradores', {departamentos: departamentos, colaborador: colaborador})
        }).catch((erro) => {
            req.flash('error_msg', 'Houve um erro ao listar os departamentos')
            res.redirect('admin/colaboradores')
        })
    }).catch((erro) => {
        req.flash('error_msg', 'Este colaborador não existe')
        res.render('/admin/colaboradores')
    })
})

router.post('/colaboradores/edit', ifAdmin, (req, res) => {

    let erros = []

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        erros.push({texto: 'Nome inválido, tente novamente'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido, tente novamente'})
    }

    if(!req.body.cargo || typeof req.body.cargo == undefined || req.body.cargo == null){
        erros.push({texto: 'Cargo inválido, tente novamente'})
    }

    if(req.body.name.length < 2){
        erros.push({texto: 'Nome muito pequeno, tente novamente'})
    }

    if(req.body.cargo.length < 2){
        erros.push({texto: 'Nome do cargo muito pequeno, tente novamente'})
    }

    if(req.body.departamento == '0'){
        erros.push({texto: 'Departamento inválido, selecione um departamento'})
    }

    if(erros.length > 0){
        res.render('admin/adddepartamentos', {erros: erros})
    }else{
        Colaborador.findOne({_id: req.body.id}).then((colaborador) => {

            colaborador.nome = req.body.name
            colaborador.slug = req.body.slug
            colaborador.cargo = req.body.cargo
            colaborador.departamento = req.body.departamento

            colaborador.save().then(() => {
                req.flash('success_msg', 'Colaborador editado com sucesso')
                res.redirect('/admin/colaboradores')
            }).catch((erro) => {
                req.flash('error_msg', 'Erro ao salvar edição do colaborador')
                res.redirect('/admin/colaboradores')
            })
        }).catch((erro) => {
            console.log(erro)
            req.flash('error_msg', 'Erro ao editar colaborador')
            res.redirect('/admin/colaboradores')
        })
    }
})

router.post('/colaboradores/delete', ifAdmin, (req, res) => {
    Colaborador.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Colaborador deletado com sucesso')
        res.redirect('/admin/colaboradores')
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao excluir este colaborador')
        res.redirect('/admin/colaboradores')
    })
})

// usuários
router.get('/userslist', ifAdmin, (req, res) => {
    User.find().lean().sort({date: 'desc'}).then((users) => {
        res.render('admin/userslist', {users: users})
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao listar os usuários')
        req.redirect('/admin')
    })
})

router.get('/register', ifAdmin, (req, res) => {
    res.render('admin/register')
})

router.post('/register', ifAdmin, (req, res) => {

    var erros = []

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        erros.push({texto: 'Nome inválido, tente novamente'})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: 'Email inválido, tente novamente'})
        console.log(req.body.email)
    }

    if(req.body.password.length < 5){
        erros.push({texto: 'A senha deve conter no mínimo 5 caracteres, tente novamente'})
    }

    if(req.body.password != req.body.password2){
        erros.push({texto: 'As senhas não coincidem, tente novamente'})
    }

    if(req.body.name.length < 2){
        erros.push({texto: 'Nome muito pequeno, tente novamente'})
    }

    if(erros.length > 0){
        res.render('admin/register', {erros: erros})
    }else{
        User.findOne({email: req.body.email}).lean().then((user) => {
            if(user){
                erros.push({texto: 'Email já cadastrado'})
                res.render('admin/register', {erros: erros}) 
            }else{

                const novoUser = new User({
                    nome: req.body.name,
                    email: req.body.email,
                    senha: req.body.password,
                    ifAdmin: req.body.ifadmin
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUser.senha, salt, (erro, hash) => {

                        if(erro){
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuário')
                            res.redirect('/admin')
                            console.log(erro)
                        }else{
    
                            novoUser.senha = hash
    
                            novoUser.save().then(() => {
                                req.flash('success_msg', 'Usuário criado com sucesso')
                                res.redirect('/admin/userslist')
                            }).catch((erro) => {
                                req.flash('error_msg', 'Erro ao criar o usuário')
                                res.redirect('/admin/register')
                                console.log(erro)
                            })
    
                        }
                    })
                })

            }
        }).catch((erro) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/admin')
            console.log(erro)
        })
    }
})

router.post('/userslist/delete', ifAdmin, (req, res) => {
    User.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Usuário deletado com sucesso')
        res.redirect('/admin/userslist')
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao excluir este usuário')
        res.redirect('/admin/userslist')
    })
})

router.get('/userslist/edit/:id', ifAdmin, (req, res) => {
    User.findOne({_id: req.params.id}).lean().then((user) => {
        res.render('admin/edituserslist', {user: user})
    }).catch((erro) => {
        req.flash('error_msg', 'Este usuário não existe')
        res.redirect('/admin/userslist')
    })
})

router.post('/userslist/edit', (req, res) => {

    var erros = []

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        erros.push({texto: 'Nome inválido, tente novamente'})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: 'Email inválido, tente novamente'})
        console.log(req.body.email)
    }

    if(req.body.name.length < 2){
        erros.push({texto: 'Nome muito pequeno, tente novamente'})
    }

    if(erros.length > 0){
        res.render('admin/userslist', {erros: erros})
    }else{
        User.findOne({_id: req.body.id}).then((user) => {

            user.nome = req.body.name
            user.email = req.body.email
            user.ifAdmin = req.body.ifadmin
    
            user.save().then(() => {
                req.flash('success_msg', 'Usuário editado com sucesso')
                res.redirect('/admin/userslist')
            }).catch((erro) => {
                req.flash('error_msg', 'Erro ao salvar edição do usuário')
                res.redirect('/admin/userslist')
                console.log(erro)
            })
        
        }).catch((erro) => {
            console.log(erro)
            req.flash('error_msg', 'Erro ao editar usuário')
            res.redirect('/admin/userslist')
        })
    }

})
module.exports = router