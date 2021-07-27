module.exports = {
    ifUser: (req, res, next) => {

        if(req.isAuthenticated()){
            return next()
        }else{
            req.flash('error_msg', 'Você não está logado')
            res.redirect('/')
        }

    }
}