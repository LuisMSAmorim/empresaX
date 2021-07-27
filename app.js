// modules
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const mongoose = require('mongoose')
const path =  require('path')
const admin = require('./routes/admin')
const user = require('./routes/user')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Colaborador')
const Colaborador = mongoose.model('colaboradores')
require('./models/Departamento')
const Departamento = mongoose.model('departamentos')
const passport = require('passport')
require('./config/auth')(passport)
const ifAdmin = require('./helpers/ifAdmin')
const ifUser = require('./helpers/isUser')


// configs

    // session
    app.use(session({
        secret: 'empresax',
        resave: true,
        saveUninitialized: true
    }))    
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    // middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null
        res.locals.admin = admin|| null
        next()
    })

    // body parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

    // handlebarss
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')

    // mongoose
    mongoose.Promise = global.Promise
    mongoose.connect('mongodb://localhost/empresax', {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }).then(() => console.log('Conectado ao banco de dados')).catch((erro) => console.log('[ERRO] '+erro))

    // public
    app.use(express.static(path.join(__dirname, 'public')))

    app.use((req, res, next) => {
        console.log('middleware')
        next()
    })

    // routes
    app.get('/', (req, res) => {
        res.render('index')
    })

    app.get('/404', (req, res) => res.send('ERRO 404: NOT FOUND'))

    app.use('/user', user)

    app.use('/admin', admin)

    // others
const port = 5000
app.listen(port, () => console.log('Servidor rodando'))