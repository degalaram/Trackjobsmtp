import nodemailer from 'nodemailer';

async function sendViaBrevoSMTP(
  to: string,
  username: string,
  otp: string,
  subject: string
): Promise<boolean> {
  try {
    console.log('📧 Creating Brevo SMTP transporter...');
    console.log('📧 BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER);
    console.log('📧 Sending to:', to);

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY
      },
      connectionTimeout: 60000,
      greetingTimeout: 60000,
      socketTimeout: 60000,
      debug: true,
      logger: true
    });

    const mailOptions = {
      from: `"Daily Tracker" <${process.env.BREVO_SMTP_USER}>`,
      to,
      subject,
      html: getEmailHTML(username, otp),
      text: `Hello ${username},\n\nYour OTP code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nBest regards,\nDaily Tracker Team`,
    };

    console.log(`📧 Sending email via Brevo SMTP to ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully via Brevo SMTP`);
    console.log(`✅ Message ID: ${info.messageId}`);
    console.log(`✅ Response: ${info.response}`);
    
    transporter.close();
    return true;
  } catch (error: any) {
    console.error(`❌ Brevo SMTP send failed:`, error.message);
    console.error(`❌ Full error:`, error);
    
    if (error.code) {
      console.error(`❌ Error code: ${error.code}`);
    }
    if (error.response) {
      console.error(`❌ Server response: ${error.response}`);
    }

    if (error.code === 'EAUTH') {
      console.error('\n⚠️  BREVO SMTP AUTHENTICATION FAILED');
      console.error('   Verify in Brevo dashboard:');
      console.error('   1. Login email matches BREVO_SMTP_USER');
      console.error('   2. SMTP key is active and correct');
      console.error('   3. Sender email is verified in Brevo\n');
    }

    return false;
  }
}

function getEmailHTML(username: string, otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Daily Tracker</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${username}</strong>,</p>
          <p>You requested a One-Time Password (OTP) for your account. Please use the code below to continue:</p>

          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>

          <p><strong>Important:</strong> This code will expire in 5 minutes for security purposes.</p>
          <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>

          <p>Best regards,<br><strong>Daily Tracker Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendOTPEmail(
  to: string,
  username: string,
  otp: string,
  subject: string = 'Your OTP Code'
): Promise<boolean> {
  const hasBrevo = !!(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_KEY);

  if (!hasBrevo) {
    console.error('❌ Brevo SMTP not configured');
    console.error('Add these to Secrets:');
    console.error('  BREVO_SMTP_USER=9aac1a007@smtp-brevo.com');
    console.error('  BREVO_SMTP_KEY=xsmtpsib-9e87dd461684fdc890a05a66f0172ea81a25de4a');
    return false;
  }

  console.log(`\n📧 Attempting to send OTP to ${to} using Brevo SMTP`);
  return await sendViaBrevoSMTP(to, username, otp, subject);
}

export async function verifyEmailConfig(): Promise<void> {
  const hasBrevo = !!(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_KEY);

  console.log('\n=== Email Configuration Status ===');
  
  if (hasBrevo) {
    console.log('✅ Brevo SMTP: CONFIGURED');
    console.log('📧 Login (BREVO_SMTP_USER):', process.env.BREVO_SMTP_USER);
    console.log('🔑 SMTP Key: ' + (process.env.BREVO_SMTP_KEY ? '✅ Set' : '❌ Missing'));
    console.log('💰 Free tier: 300 emails/day');
  } else {
    console.error('❌ Brevo SMTP: NOT CONFIGURED');
    console.error('\nAdd these to Secrets:');
    console.error('  BREVO_SMTP_USER=9aac1a007@smtp-brevo.com');
    console.error('  BREVO_SMTP_KEY=xsmtpsib-9e87dd461684fdc890a05a66f0172ea81a25de4a');
  }
  
  console.log('=================================\n');
}
