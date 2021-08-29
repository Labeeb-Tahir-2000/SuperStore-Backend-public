module.exports = (err,req,res,next) =>{
    err.status = err.statuse  || 'error';
    err.statusCode = err.statuseCode || 500;
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message
    })
}