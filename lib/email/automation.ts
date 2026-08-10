import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email sender configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@legalagent.com';
const COMPANY_NAME = 'LegalAgent';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail(data: EmailData) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: data.subject,
      html: data.html,
      reply_to: data.replyTo,
    });

    console.log('Email sent successfully:', result);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

/**
 * 1. WELCOME EMAIL - When user signs up / starts trial
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  trialEndsAt: string
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 40px 20px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background: #111827; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; border-radius: 0 0 8px 8px; }
    .highlight { background: #dbeafe; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to ${COMPANY_NAME}!</h1>
      <p style="font-size: 18px; margin: 0;">Your 14-Day Free Trial Has Started</p>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Welcome aboard! We're excited to help you <strong>capture more leads, win more cases, and grow your practice</strong> with AI automation.</p>
      
      <div class="highlight">
        <strong>✅ Your trial includes:</strong>
        <ul>
          <li>24/7 AI Chatbot (captures leads while you sleep)</li>
          <li>Smart Lead Scoring (focus on high-value clients)</li>
          <li>Full CRM & Case Management</li>
          <li>Automated Time Tracking & Invoicing</li>
          <li>Real-time Analytics Dashboard</li>
        </ul>
      </div>
      
      <p><strong>Your trial ends on ${trialEndsAt}</strong>. No credit card required until you're ready to continue.</p>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
          Go to Dashboard →
        </a>
      </div>
      
      <p><strong>Quick Start Guide:</strong></p>
      <ol>
        <li>Customize your chatbot with your practice areas</li>
        <li>Add the chatbot widget to your website</li>
        <li>Watch leads come in automatically!</li>
      </ol>
      
      <p>Need help? Just reply to this email or check our <a href="${process.env.NEXT_PUBLIC_APP_URL}/help">Help Center</a>.</p>
      
      <p>Best regards,<br>The ${COMPANY_NAME} Team</p>
    </div>
    
    <div class="footer">
      <p>© 2024 ${COMPANY_NAME}. All rights reserved.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color: #9ca3af;">Unsubscribe</a> | 
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color: #9ca3af;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Welcome to ${COMPANY_NAME} - Your Trial Has Started! 🎉`,
    html,
  });
}

/**
 * 2. TRIAL ENDING SOON - 3 days before trial ends
 */
export async function sendTrialEndingEmail(
  userEmail: string,
  userName: string,
  daysLeft: number
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 40px 20px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background: #111827; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; border-radius: 0 0 8px 8px; }
    .warning-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Your Trial Ends in ${daysLeft} Days</h1>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Just a friendly reminder that your free trial ends in <strong>${daysLeft} days</strong>.</p>
      
      <div class="warning-box">
        <strong>⚠️ Don't lose access to:</strong>
        <ul>
          <li>Your captured leads and client data</li>
          <li>24/7 AI chatbot on your website</li>
          <li>Automated billing and time tracking</li>
          <li>Case management and analytics</li>
        </ul>
      </div>
      
      <div class="stats">
        <p><strong>Your Results So Far:</strong></p>
        <p>We'll show your actual stats here when implemented:</p>
        <ul>
          <li>Leads captured: [DYNAMIC]</li>
          <li>Time saved: [DYNAMIC] hours</li>
          <li>Cases created: [DYNAMIC]</li>
        </ul>
      </div>
      
      <p><strong>Continue getting more leads and winning more cases.</strong></p>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" class="button">
          Continue with ${COMPANY_NAME} →
        </a>
      </div>
      
      <p style="text-align: center; color: #6b7280; font-size: 14px;">
        Starting at just $299/month • Cancel anytime
      </p>
      
      <p>Questions? Reply to this email or <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact">contact our team</a>.</p>
      
      <p>Best regards,<br>The ${COMPANY_NAME} Team</p>
    </div>
    
    <div class="footer">
      <p>© 2024 ${COMPANY_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `⏰ Your ${COMPANY_NAME} Trial Ends in ${daysLeft} Days`,
    html,
  });
}

/**
 * 3. PAYMENT SUCCESS - Monthly subscription payment
 */
export async function sendPaymentSuccessEmail(
  userEmail: string,
  userName: string,
  amount: number,
  invoiceUrl: string
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 40px 20px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background: #111827; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; border-radius: 0 0 8px 8px; }
    .receipt { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Received</h1>
      <p style="font-size: 18px; margin: 0;">Thank you for your payment!</p>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Your payment has been processed successfully. Your subscription is active and ready to help you grow your practice.</p>
      
      <div class="receipt">
        <h3 style="margin-top: 0;">Payment Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">$${(amount / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Date:</td>
            <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Subscription:</td>
            <td style="padding: 8px 0; text-align: right;">${COMPANY_NAME} Professional</td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center;">
        <a href="${invoiceUrl}" class="button">
          Download Invoice →
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        This receipt is for your records. You can view all your invoices in your <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing">billing dashboard</a>.
      </p>
      
      <p>Thank you for being a valued customer!</p>
      
      <p>Best regards,<br>The ${COMPANY_NAME} Team</p>
    </div>
    
    <div class="footer">
      <p>© 2024 ${COMPANY_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `✅ Payment Received - $${(amount / 100).toFixed(2)} - ${COMPANY_NAME}`,
    html,
  });
}

/**
 * 4. PAYMENT FAILED - Retry payment notification
 */
export async function sendPaymentFailedEmail(
  userEmail: string,
  userName: string,
  retryDate: string
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 40px 20px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background: #111827; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; border-radius: 0 0 8px 8px; }
    .alert-box { background: #fee2e2; border: 2px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Payment Update Required</h1>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>We were unable to process your recent payment for ${COMPANY_NAME}.</p>
      
      <div class="alert-box">
        <strong>Action Required:</strong>
        <p>Please update your payment method to continue using ${COMPANY_NAME}. We'll automatically retry the payment on <strong>${retryDate}</strong>.</p>
      </div>
      
      <p><strong>Common reasons for failed payments:</strong></p>
      <ul>
        <li>Expired credit card</li>
        <li>Insufficient funds</li>
        <li>Card limit reached</li>
        <li>Incorrect billing information</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" class="button">
          Update Payment Method →
        </a>
      </div>
      
      <p>If you don't update your payment method by ${retryDate}, your account may be suspended.</p>
      
      <p>Need help? Reply to this email or <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact">contact support</a>.</p>
      
      <p>Best regards,<br>The ${COMPANY_NAME} Team</p>
    </div>
    
    <div class="footer">
      <p>© 2024 ${COMPANY_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `⚠️ Payment Failed - Action Required - ${COMPANY_NAME}`,
    html,
  });
}

/**
 * 5. NEW LEAD NOTIFICATION - When chatbot captures a lead
 */
export async function sendNewLeadNotification(
  attorneyEmail: string,
  leadData: {
    name: string;
    email: string;
    phone?: string;
    practiceArea: string;
    score: number;
    message: string;
  }
) {
  const scoreColor = leadData.score >= 80 ? '#10b981' : leadData.score >= 60 ? '#f59e0b' : '#ef4444';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 40px 20px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background: #111827; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; border-radius: 0 0 8px 8px; }
    .lead-card { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0; }
    .score-badge { display: inline-block; background: ${scoreColor}; color: white; padding: 6px 12px; border-radius: 20px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 New Lead Captured!</h1>
    </div>
    
    <div class="content">
      <p><strong>A potential client just contacted you through your AI chatbot!</strong></p>
      
      <div class="lead-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0;">${leadData.name}</h3>
          <span class="score-badge">Score: ${leadData.score}/100</span>
        </div>
        
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 40%;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${leadData.email}">${leadData.email}</a></td>
          </tr>
          ${leadData.phone ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Phone:</td>
            <td style="padding: 8px 0;"><a href="tel:${leadData.phone}">${leadData.phone}</a></td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Practice Area:</td>
            <td style="padding: 8px 0;"><strong>${leadData.practiceArea}</strong></td>
          </tr>
        </table>
        
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Message:</p>
          <p style="margin: 8px 0 0 0;">${leadData.message}</p>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads" class="button">
          View in Dashboard →
        </a>
      </div>
      
      <p style="background: #dbeafe; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <strong>💡 Tip:</strong> High-scoring leads (80+) have a ${leadData.score >= 80 ? '3x' : '2x'} higher conversion rate. 
        We recommend responding within 1 hour for best results!
      </p>
      
      <p>Best regards,<br>Your ${COMPANY_NAME} AI Assistant</p>
    </div>
    
    <div class="footer">
      <p>© 2024 ${COMPANY_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: attorneyEmail,
    subject: `🎯 New ${leadData.practiceArea} Lead - ${leadData.name} (Score: ${leadData.score}/100)`,
    html,
  });
}

/**
 * 6. SCHEDULED EMAIL CAMPAIGNS
 * These are triggered based on user behavior and lifecycle stage
 */
export const emailCampaigns = {
  // Day 3 of trial - Feature highlight
  trialDay3: (email: string, name: string) => sendEmail({
    to: email,
    subject: `💡 Quick Win: Set Up Your First Automated Email Campaign`,
    html: `<!-- Feature education email -->`,
  }),
  
  // Day 7 of trial - Success story
  trialDay7: (email: string, name: string) => sendEmail({
    to: email,
    subject: `📈 How Martinez Law Firm 3x'd Their Leads in 60 Days`,
    html: `<!-- Case study email -->`,
  }),
  
  // Day 10 of trial - Conversion push
  trialDay10: (email: string, name: string) => sendEmail({
    to: email,
    subject: `🎁 Special Offer: Save 20% When You Subscribe Today`,
    html: `<!-- Conversion email with discount -->`,
  }),
};
