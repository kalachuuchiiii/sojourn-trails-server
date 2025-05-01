const nodemailer = require("nodemailer"); 

const host = "liammagat8@gmail.com";
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: host,
    pass: process.env.GMAIL_APP_PASS
  }
})

const sendEmail = async({to, subject, html}) => {
  const mailOptions = {
    from: host, 
    to, 
    subject, 
    html
  }
  try{
    const res = await transporter.sendMail(mailOptions);
  console.log('email',res);
  }catch(e){
    console.log('email', e)
    throw new Error(e.message);
  }
}

module.exports = {sendEmail}