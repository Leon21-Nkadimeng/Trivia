const transporter = require('../config/emailConfig');

async function sendEmail({ to, subject, text, html }) {

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent:', info.messageId);

        return info;

    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

async function test() {

  try {
    await sendEmail({ to: 'nkadimengleon@gmail.com', subject: 'test email', text: 'test email from triviahub', html: `
      <div>
        <h1>What up yo bald head</h1>
      </div>  
    `});
  } catch(err) {
    console.err(err);
  }
}

async function sendTriviaManagementLink({to, adminToken}) {

  const html = `
  Your trivia has been successfully created. You can manage it by following this link: <a>http://localhost:7676/trivias/manage/${adminToken}</a>
  `;

  try {
    await sendEmail({to: to, subject: "Trivia Management Link", text: "[TriviaHub]: Trivia Management Link", html});
  } catch (error) {
    console.err(error);
  }
  
}

module.exports = { sendEmail, test, sendTriviaManagementLink };