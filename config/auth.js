const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

require('../models/User')
const User = mongoose.model('users')

module.exports = (passport) => {

    passport.use(new localStrategy({usernameField: 'email', passwordField: 'password'}, (email, senha, done) => {

        User.findOne({email: email}).lean().then((user) => {
            if(!user){
                return done(null, false, {message: 'Esta conta não existe'})
            }else{
                bcrypt.compare(senha, user.senha, (erro, batem) => {
                    if(batem){
                        return done(null, user)
                    }else{
                        return done(null, false, {message: 'Senha incorreta'})
                    }
                })
            }
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user)
    })
    
    passport.deserializeUser((id, done) => {
        User.findById(id, (erro, user) => {
            done(erro, user)
        })
    })
}