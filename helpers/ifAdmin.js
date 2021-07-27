module.exports = {
    ifAdmin: (req, res, next) => {

        if(req.isAuthenticated() && req.user.ifAdmin == 1){
            return next()
        }else{
            req.flash('error_msg', 'Você não tem permissão de administrador')
            res.redirect('/user')
        }

    }
}