const nodemailer = require('nodemailer');

const sendEmail = async options =>{
    const Transporter = nodemailer.createTransport({
         service :'gmail',
         auth:{ 
             user:process.env.EMAIL.USERNAME,
             password : process.env.EMAIL_PASSWORD
         }
    })
    const mailOptions={
        from :process.env.EMAIL.USERNAME,
        to: options.email,
        subject : options.subject,
        text : options.text
    }
     await Transporter.sendMail(mailOptions,(err)=>{
         if(err){
             console.log(err)
         }else{
            console.log('email sended without any error')
         }
     });

};
module.exports = sendEmail;
