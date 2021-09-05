const express = require('express');
const AppError = require('../utilits/appError');
const authController = require('./../controllers/authController');
const productController = require('./../controllers/productController');
const router = express.Router();

router.post('/addProduct',authController.protect , 
(req,res,next)=>{
    if(req.user.role === 'admin'){
        next();
    }else {
        return next(new AppError('Access denied!',401))
    }
},
productController.addProduct
)
module.exports = router;