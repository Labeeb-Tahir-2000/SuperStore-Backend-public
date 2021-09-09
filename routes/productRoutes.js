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
        return next(new AppError('Access denied! You are not Admin',401))
    }
},
productController.addProduct
);

router.post('/showProducts',authController.protect , 
(req,res,next)=>{
    if(req.user.role === 'admin'){
        next();
    }else {
        return next(new AppError('Access denied! You are not Admin',401))
    }
}, 
productController.showProducts
)

router.patch('/editProducts',authController.protect , 
(req,res,next)=>{
    if(req.user.role === 'admin'){
        next();
    }else {
        return next(new AppError('Access denied! You are not Admin',401))
    }
}, 
productController.editProducts
)

router.post('/getProducts',authController.protect , productController.getProducts)
router.post('/getSaleProducts', productController.getSaleProducts)


module.exports = router;