import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile, unlink } from 'fs/promises';
import Epub from 'epub-gen';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes (must be before static file serving)
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, content, chapters, smtpConfig } = req.body;

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

    // Generate EPUB if chapters are provided
    let epubBuffer = null;
    if (chapters && Array.isArray(chapters) && chapters.length > 0) {
      try {
        const epubTitle = subject || `PodRead Collection - ${new Date().toLocaleDateString()}`;
        const tempEpubPath = path.join(__dirname, `temp_${Date.now()}.epub`);
        
        const epubOptions = {
          title: epubTitle,
          author: 'PodRead',
          publisher: 'PodRead',
          lang: 'en',
          css: `
            body {
              font-family: 'Georgia', 'Times New Roman', serif;
              line-height: 1.8;
              color: #333;
              max-width: 65ch;
              margin: 0 auto;
              padding: 2em;
            }
            h1 {
              font-size: 2em;
              font-weight: bold;
              color: #2d3748;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 0.3em;
            }
            h2 {
              font-size: 1.5em;
              font-weight: 600;
              color: #2d3748;
              margin-top: 1.2em;
              margin-bottom: 0.4em;
            }
            h3 {
              font-size: 1.2em;
              font-weight: 500;
              color: #4a5568;
              margin-top: 1em;
              margin-bottom: 0.3em;
              font-style: italic;
            }
            p {
              margin-bottom: 1em;
              text-indent: 0;
              line-height: 1.8;
            }
            p:first-of-type::first-letter {
              font-size: 3em;
              font-weight: bold;
              float: left;
              line-height: 1;
              margin-right: 0.1em;
              margin-top: 0.1em;
              color: #2d3748;
            }
          `,
          content: chapters.map((chapter, index) => ({
            title: chapter.title || `Chapter ${index + 1}`,
            data: formatChapterForEpub(chapter.content)
          }))
        };

        await new Epub(epubOptions, tempEpubPath).promise;
        
        // Read the generated EPUB file
        epubBuffer = await readFile(tempEpubPath);
        
        // Clean up temp file
        await unlink(tempEpubPath).catch(() => {});
        
        console.log('EPUB generated successfully');
      } catch (epubError) {
        console.error('EPUB generation error:', epubError);
        // Continue without EPUB attachment if generation fails
      }
    }

    // Prepare email attachments
    const attachments = [];
    if (epubBuffer) {
      attachments.push({
        filename: `${subject.replace(/[^a-z0-9]/gi, '_')}.epub`,
        content: epubBuffer,
        contentType: 'application/epub+zip'
      });
    }

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
            ${epubBuffer ? '<p style="margin-top: 2em; padding-top: 1em; border-top: 1px solid #e2e8f0;"><strong>📎 EPUB附件已包含在邮件中</strong></p>' : ''}
          </div>
        </body>
        </html>
      `,
      attachments: attachments.length > 0 ? attachments : undefined,
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

// Helper function to format chapter content for EPUB (preserve formatting)
function formatChapterForEpub(content) {
  if (!content) return '';
  
  const lines = content.split('\n');
  let html = '';
  let inParagraph = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      if (inParagraph) {
        html += '</p>\n';
        inParagraph = false;
      }
      html += '<br/>\n';
      continue;
    }
    
    // Handle headings
    if (line.startsWith('# ')) {
      if (inParagraph) {
        html += '</p>\n';
        inParagraph = false;
      }
      html += `<h1>${escapeHtml(line.substring(2))}</h1>\n`;
    } else if (line.startsWith('## ')) {
      if (inParagraph) {
        html += '</p>\n';
        inParagraph = false;
      }
      html += `<h2>${escapeHtml(line.substring(3))}</h2>\n`;
    } else if (line.startsWith('### ')) {
      if (inParagraph) {
        html += '</p>\n';
        inParagraph = false;
      }
      html += `<h3>${escapeHtml(line.substring(4))}</h3>\n`;
    } else {
      // Regular paragraph
      if (!inParagraph) {
        html += '<p>';
        inParagraph = true;
      }
      html += escapeHtml(line) + ' ';
    }
  }
  
  if (inParagraph) {
    html += '</p>\n';
  }
  
  return html;
}

// Serve static files from dist directory (frontend build)
// This must be after API routes
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });
  }
  
  // Serve index.html for all other routes (React Router)
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Unified server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/send-email`);
  console.log(`Health: http://localhost:${PORT}/health`);
});

