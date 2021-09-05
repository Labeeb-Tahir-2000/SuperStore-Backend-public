const Product = require('./../models/productModel');
const catchAsync = require('../utilits/catchAsync');
const AppError = require('./../utilits/appError');

sendResponce = (res, product , statusCode)=>{
res.status(statusCode).json({
    status:'success',
    data:{
        product : product
    }
});
}

exports.addProduct = catchAsync(async(req,res,next)=>{
    // const {pTitle , pCetegory, pPrice, pImagePath, pDescription, pStock, pEdible , pOnSale} = req.body;
    // if(!pTitle || !pCetegory || !pPrice || !pImagePath || !pStock ){
    //     return next(new AppError('please fill all required fields' , 400))
    // }
    const product = await Product.create({
        pPrice:req.body.pPrice,
        pTitle :req.body.pTitle,
        pCetegory :req.body.pCetegory,
        pImagePath : req.body.pImagePath,
        pDescription :req.body.pDescription,
        pStock :req.body.pStock,
        pEdible: req.body.pEdible,
        pOnSale : req.body.pOnSale
    });
    
    sendResponce(res,product, 201);
})
