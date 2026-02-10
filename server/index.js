import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, content, smtpConfig } = req.body;

    // Validate required fields
    if (!to || !subject || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, and content are required'
      });
    }

    // Determine SMTP configuration
    // Priority: request smtpConfig > environment variables > default
    const smtpHost = smtpConfig?.host || process.env.SMTP_HOST;
    const smtpPort = smtpConfig?.port || parseInt(process.env.SMTP_PORT) || 465;
    const smtpUser = smtpConfig?.user || process.env.SMTP_USER;
    const smtpPass = smtpConfig?.pass || process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return res.status(400).json({
        success: false,
        error: 'SMTP configuration is incomplete. Please provide smtpConfig in request or set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.'
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      // Add timeout and connection options
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify connection
    try {
      await transporter.verify();
      console.log('SMTP server connection verified');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return res.status(500).json({
        success: false,
        error: `SMTP connection failed: ${verifyError.message}`
      });
    }

    // Convert content to HTML (preserve line breaks)
    const htmlContent = content
      .split('\n')
      .map(line => line.trim() ? `<p>${escapeHtml(line)}</p>` : '<br>')
      .join('');

    // Send email
    const mailOptions = {
      from: `"PodRead" <${smtpUser}>`,
      to: to,
      subject: subject,
      text: content, // Plain text version
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Georgia', 'Times New Roman', serif;
              line-height: 1.8;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f7f2;
            }
            .container {
              background-color: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
              color: #2d3748;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 10px;
            }
            pre {
              white-space: pre-wrap;
              font-family: 'Georgia', serif;
              line-height: 1.8;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${escapeHtml(subject)}</h1>
            <div>${htmlContent}</div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: to,
      subject: subject
    });

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email'
    });
  }
});

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Email API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Email endpoint: http://localhost:${PORT}/api/send-email`);
});

