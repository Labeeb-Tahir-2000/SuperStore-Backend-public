const mongoose =require('mongoose');
const dotenv= require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
  });
dotenv.config({ path: './config.env' });
const app = require('./app.js');

// const DB = process.env.DATABASE.replace(
//     '<password>',
//     process.env.DATABASE_PASSWORD
//   );
const DB = 'mongodb+srv://labeeb2000:lat712000@cluster1.v8te1.mongodb.net/Super_store?retryWrites=true&w=majority';
mongoose.connect(DB,{
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(()=>{ 
    console.log('connected with DataBase')
}).catch(
console.log('cannot connected with database')
)


const port =4000;
app.listen(port , ()=>
{
    console.log(`listning at port number ${port}`);
});