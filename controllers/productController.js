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

    let {pTitle , pCetegory, pPrice, pImagePath, pDescription, pStock, pEdible , pOnSale, pOldPrice} = req.body;
    if(pOldPrice === '' || pOldPrice === null ){
        pOldPrice = ' '
    }

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
        pOnSale :pOnSale,
        pOldPrice:pOldPrice
    });
 
    sendResponce(res,product, 201);
})
exports.showProducts = catchAsync(async(req,res,next)=>{

    let products = await Product.find(req.body).sort([['pTitle',1]]);
    if(!products){
        return (new AppError('can not get the products ' , 500))
    }

   
    sendResponce(res,products,200)
});

exports.editProducts = catchAsync(async(req,res,next)=>{
    const requestBody ={...req.body} // hard copy of req.body
    if(requestBody.pOldPrice === ''){
        requestBody.pOldPrice = ' '
    }
    const keys = Object.keys(requestBody) // getting out all property names as keys  of object request object
    // We already filtered out those properties from object to be send here from front End that have empty data "" 
    keys.forEach((key,index)=>{ // looping out object by its property keys
       if(requestBody[key] === '' || requestBody[key] === null){// important '' != ' '
           delete requestBody[key]; // deleting property as well as its value which should be either null  or 'withoutSpace' means data that is empty
        } // 'withSpace' or "withSpace" means it is string data not empty
    })

    let products = await Product.findByIdAndUpdate(req.body._id, requestBody , {useFindAndModify: false } );
    if(!products){
        return (new AppError('can not get the products ' , 500))
    }
    sendResponce(res,products,200)
});

    exports.getProducts = catchAsync(async(req,res,next)=>{
        let products ;
        if(req.body) {
            console.log(req.body)
            let variable = req.body;
            let limit = variable.limit ? parseInt(variable.limit) : 100;
            let skip = parseInt(variable.skip);
            let term = variable.searchTerms;

            if (term) {
            products = await Product.find({ pStock: { $gt: 0 } })
                    .find({ $text: { $search: term } })   
                    .sort({pTitle:1}) 
                    
            } else {
            products = await  Product.find({ pStock: { $gt: 0 } })
                    .sort({pTitle:1})
                    .skip(skip)
                    .limit(limit)       
            }
        }else{
            products = await Product.find({ pStock: { $gt: 0 } })
        }
        console.log(products)
        sendResponce(res,products,200)
    });

    exports.getSaleProducts = catchAsync(async(req,res,next)=>{
        const products = await Product.find({pStock: { $gt: 0 }}).where('pOnSale').in('onSale')
        if(!products){
            return (new AppError('no product on sale ' , 204))
        }
        sendResponce(res,products,200)
    })
     
    exports.getCetegoryProducts = catchAsync(async(req,res,next)=>{
      
    
        const [cetegory1 , cetegory2] = req.body.cetegory.split(',');

        const cetegory =[
            cetegory1,
            cetegory2
        ]

        if (!cetegory){
            return new AppError('please select cetegory', 400)
        }
        const products = await Product.find({pStock: { $gt: 0 }}).where('pCetegory').in(cetegory)
        
      
        if (!products){
            return new AppError(`no product for ${cetegory} cetegory`, 204)
            
        }
        sendResponce(res,products,200)
    })
    exports.getCartProducts = catchAsync(async(req,res,next)=>{
      
        if (!req.body.id){
            return new AppError('please select cetegory', 400)
        }
        const products = await Product.find().where('_id').in(req.body.id)
 
        if (!products){
            return new AppError(`no product found of given id`, 204)
            
        }
        sendResponce(res,products,200)
    })
   
 exports.editProductsCount = catchAsync(async(req,res,next)=>{
 
   let productIDs= [...req.body.products]
   console.log(productIDs)

     let products = await Product.find().where('_id').in(productIDs);
   
     await products.map(async(product)=>{
        //  let count = productIDs.filter((item) => item === product._id).length
        //  console.log(count)
         count = product.pStock - productIDs.filter((item) => item == product._id).length;
         console.log(count)
       return await Product.findByIdAndUpdate(product._id ,{pStock : count}, {useFindAndModify: false })
     })
     res.status(200).json({
         status:'success',
     })
 })

