const nodemailer = require('nodemailer');

const sendEmail = async options =>{
    const Transporter = nodemailer.createTransport({
         service :'gmail',
         auth:{ 
             user:'labeeb2385@gmail.com',
             pass: 'lat712000'
         }
    })
    const mailOptions={
        from :'labeeb2385@gmail.com',
        to: 'lat712000@gmail.com',
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
