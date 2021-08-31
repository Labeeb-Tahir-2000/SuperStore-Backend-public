const express = require('express');
const cors = require('cors')
const userRoutes = require('./routes/userRoutes');
const AppError = require('./utilits/appError');
const globalErrorHandler = require('./controllers/errorController')
const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/v1/users',userRoutes); 

app.all('*',(req,res,next)=>{
    next(new AppError(`Can not find route ${req.URL}` , 404))
})
app.use(globalErrorHandler);

module.exports= app;