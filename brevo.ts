
import nodemailer from 'nodemailer';

async function testBrevo() {
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });

  try {
    console.log('Testing Brevo SMTP connection...');
    console.log('User:', process.env.BREVO_SMTP_USER);
    console.log('Key:', process.env.BREVO_SMTP_KEY ? 'Set ✓' : 'Missing ✗');
    
    const info = await transporter.sendMail({
      from: process.env.BREVO_SMTP_USER,
      to: process.env.BREVO_SMTP_USER, // Send to yourself
      subject: 'Brevo SMTP Test',
      text: 'If you receive this, Brevo is configured correctly!',
      html: '<b>If you receive this, Brevo is configured correctly!</b>',
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Check your inbox for the test email.');
  } catch (error: any) {
    console.error('❌ Failed to send email:');
    console.error(error.message);
  }
}

testBrevo();
