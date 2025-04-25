const Mailjet = require('node-mailjet');

const mailjet = Mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY)


const sendEmail = async ({ subject, html, email }) => {

  const mailFormat = {
    Messages: [
      {
        From: { Email: 'parissrowlet@gmail.com' },
        To: [{ Email: email }],
        Subject: subject,
        HTMLPart: html
      }
    ]
  }

  try {

    const response = await mailjet.post('send', { version: 'v3.1' }).request(mailFormat);
    return response?.response?.statusText
  } catch (e) {
    console.log(e);
    throw new Error(`Error sending email: ${e.message}`)
  }
}

module.exports = { sendEmail }; 