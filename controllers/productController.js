const Product = require('./../models/productModel');
const catchAsync = require('../utilits/catchAsync');
const AppError = require('./../utilits/appError');

sendResponce = (res, product , statusCode)=>{
res.status(statusCode).json({
    status:'success',
    product 
});
}

exports.addProduct = catchAsync(async(req,res,next)=>{
    const {pTitle , pCetegory, pPrice, pImagePath, pDescription, pStock, pEdible , pOnSale} = req.body;
    if(!pTitle || !pCetegory || !pPrice || !pImagePath || !pStock ){
        return next(new AppError('please fill all required fields' , 400))
    }
    const product = await Product.create({
        pPrice:pPrice,
        pTitle :pTitle,
        pCetegory :pCetegory,
        pImagePath : pImagePath,
        pDescription :pDescription,
        pStock :pStock,
        pEdible: pEdible,
        pOnSale :pOnSale
    });
    
    sendResponce(res,product, 201);
})
exports.showProducts = catchAsync(async(req,res,next)=>{
    console.log(req.body)
    let products = await Product.find(req.body).sort([['pTitle',1]]);
    if(!products){
        return (new AppError('can not get the products ' , 500))
    }

     
    sendResponce(res,products,200)
});

exports.editProducts = catchAsync(async(req,res,next)=>{
    const requestBody ={...req.body} // hard copy of req.body
    console.log(requestBody);
    const keys = Object.keys(requestBody) // getting out all property names as keys  of object request object
    // We already filtered out those properties from object to be send here from front End that have empty data "" 
    keys.forEach((key,index)=>{ // looping out object by its property keys
       if(requestBody[key] === '' || requestBody[key] === null){// important '' != ' '
           delete requestBody[key]; // deleting property as well as its value which should be either null  or 'withoutSpace' means data that is empty
        } // 'withSpace' or "withSpace" means it is string data not empty
    })
    console.log(requestBody);
    let products = await Product.findByIdAndUpdate(req.body._id, requestBody , {useFindAndModify: false } );
    if(!products){
        return (new AppError('can not get the products ' , 500))
    }
    sendResponce(res,products,200)
});

    exports.getProducts = catchAsync(async(req,res,next)=>{
        const products = await Product.find()
        sendResponce(res,products,200)
    });
    exports.getSaleProducts = catchAsync(async(req,res,next)=>{
        const products = await Product.find({pOnSale : 'onSale'})
        sendResponce(res,products,200)
    })
     
   

