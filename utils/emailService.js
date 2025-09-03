const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendOTP(email, otp, userName) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'TaskOverflow - Email Verification Code',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 30px 25px; border-radius: 16px 16px 0 0; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px;">
              <div style="width: 32px; height: 32px; background: rgba(255, 255, 255, 0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold;">T</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.02em;">TaskOverflow</h1>
            </div>
            <p style="margin: 0; opacity: 0.9; font-size: 16px;">Streamline Your Workflow</p>
          </div>
          
          <!-- Main Content -->
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-left: 4px solid #0ea5e9;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 28px;">🔐</span>
              </div>
              <h2 style="color: #1e293b; margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">Hello ${userName}!</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px;">Verify your email to get started</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #cbd5e1; border-radius: 12px; padding: 30px; text-align: center; margin: 25px 0;">
              <p style="color: #475569; margin-bottom: 20px; font-size: 16px; line-height: 1.5;">
                Welcome to TaskOverflow! Please use this verification code to complete your registration:
              </p>
              
              <!-- OTP Display -->
              <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; font-size: 36px; font-weight: 800; text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 12px; margin: 25px 0; box-shadow: 0 8px 25px -5px rgba(14, 165, 233, 0.4); font-family: 'Courier New', monospace;">
                ${otp}
              </div>
              
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 500;">
                  ⏱️ This code expires in 10 minutes
                </p>
              </div>
            </div>
            
            <!-- Security Notice -->
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-top: 25px;">
              <p style="color: #166534; margin: 0; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">🛡️</span>
                <strong>Security Note:</strong> If you didn't request this code, please ignore this email.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 20px; padding: 20px;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.4;">
              This email was sent by TaskOverflow<br>
              © 2024 TaskOverflow. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  }

  async sendWelcomeEmail(email, userName) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to TaskOverflow! 🎉',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 25px; border-radius: 16px 16px 0 0; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px;">
              <div style="width: 32px; height: 32px; background: rgba(255, 255, 255, 0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold;">T</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.02em;">TaskOverflow</h1>
            </div>
            <p style="margin: 0; opacity: 0.9; font-size: 18px;">🎉 Welcome Aboard!</p>
          </div>
          
          <!-- Main Content -->
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-left: 4px solid #10b981;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 36px;">🚀</span>
              </div>
              <h2 style="color: #1e293b; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">Hello ${userName}!</h2>
              <p style="color: #64748b; margin: 0; font-size: 18px; font-weight: 500;">Your journey begins now</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #bbf7d0; border-radius: 12px; padding: 30px; margin: 25px 0;">
              <div style="text-align: center; margin-bottom: 25px;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; border-radius: 50px; display: inline-block; margin-bottom: 20px;">
                  <span style="font-size: 16px; font-weight: 600;">✅ Email Verified Successfully!</span>
                </div>
                <p style="color: #166534; margin: 0; font-size: 16px; line-height: 1.6; font-weight: 500;">
                  Congratulations! You're now ready to supercharge your productivity with TaskOverflow.
                </p>
              </div>
            </div>
            
            <!-- Features Section -->
            <div style="margin: 30px 0;">
              <h3 style="color: #059669; margin-bottom: 20px; font-size: 20px; font-weight: 600; text-align: center;">🌟 What you can do now:</h3>
              
              <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
                <!-- Feature 1 -->
                <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border: 1px solid #c4b5fd; border-radius: 12px; padding: 20px; flex: 1; min-width: 250px; text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 10px;">📋</div>
                  <h4 style="color: #7c3aed; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Project Management</h4>
                  <p style="color: #6b46c1; margin: 0; font-size: 14px;">Create and manage multiple projects with ease</p>
                </div>
                
                <!-- Feature 2 -->
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fbbf24; border-radius: 12px; padding: 20px; flex: 1; min-width: 250px; text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 10px;">✅</div>
                  <h4 style="color: #d97706; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Task Tracking</h4>
                  <p style="color: #b45309; margin: 0; font-size: 14px;">Add tasks and monitor progress in real-time</p>
                </div>
              </div>
              
              <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; margin-top: 15px;">
                <!-- Feature 3 -->
                <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); border: 1px solid #f9a8d4; border-radius: 12px; padding: 20px; flex: 1; min-width: 250px; text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 10px;">📈</div>
                  <h4 style="color: #be185d; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Activity Feed</h4>
                  <p style="color: #9d174d; margin: 0; font-size: 14px;">Stay updated with your project activities</p>
                </div>
                
                <!-- Feature 4 -->
                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 1px solid #93c5fd; border-radius: 12px; padding: 20px; flex: 1; min-width: 250px; text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 10px;">👥</div>
                  <h4 style="color: #1d4ed8; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Team Collaboration</h4>
                  <p style="color: #1e40af; margin: 0; font-size: 14px;">Work seamlessly with your team members</p>
                </div>
              </div>
            </div>
            
            <!-- CTA Section -->
            <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
              <h4 style="color: white; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Ready to get started?</h4>
              <p style="color: #cbd5e1; margin: 0 0 20px 0; font-size: 14px;">Log in to your account and create your first project!</p>
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; border-radius: 25px; display: inline-block; font-weight: 600; text-decoration: none;">
                🚀 Start Building
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 20px; padding: 20px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">
              Happy project managing! 🌟
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.4;">
              This email was sent by TaskOverflow<br>
              © 2024 TaskOverflow. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Welcome email sent successfully' };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, message: 'Failed to send welcome email' };
    }
  }
}

module.exports = new EmailService();