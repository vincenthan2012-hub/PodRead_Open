
import { Chapter, AppSettings } from "../types";

/**
 * Generates EPUB content as text/markdown
 */
function generateEpubContent(chapters: Chapter[]): string {
  const title = `PodRead Collection - ${new Date().toLocaleDateString()}`;
  const header = `# ${title}\n\nGenerated on ${new Date().toLocaleString()}\n\n---\n\n`;
  const content = chapters.map((chapter, index) => 
    `## Chapter ${index + 1}: ${chapter.title}\n\n${chapter.content}\n\n---\n\n`
  ).join('');
  return header + content;
}

/**
 * Sends email via backend API
 */
async function sendEmailViaAPI(
  emailContent: string,
  recipient: string,
  settings: AppSettings,
  chapters: Chapter[]
): Promise<void> {
  // Use relative path if VITE_EMAIL_API_URL is not set or is a relative path
  // This allows the same code to work with both single-service and dual-service setups
  let apiUrl = import.meta.env.VITE_EMAIL_API_URL;
  
  // If not configured or is a placeholder, use relative path (works with single-service setup)
  // Note: If a full URL with localhost is provided (e.g., http://localhost:3001/api/send-email),
  // we should use it directly, not convert to relative path
  if (!apiUrl || apiUrl.includes('your-backend-api.com')) {
    apiUrl = '/api/send-email';
  }
  
  // If it's already a relative path, use it as-is
  // If it's an absolute URL, use it (for dual-service setup or development with separate backend)
  const finalUrl = apiUrl.startsWith('/') ? apiUrl : apiUrl;

  const response = await fetch(finalUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: recipient,
      subject: `PodRead Collection - ${new Date().toLocaleDateString()}`,
      content: emailContent,
      chapters: chapters, // Send full chapter data for EPUB generation
      smtpConfig: settings.useCustomSmtp ? {
        host: settings.smtpHost,
        port: parseInt(settings.smtpPort) || 465,
        user: settings.smtpUser,
        pass: settings.smtpPass,
      } : undefined,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Email API error: ${response.status} - ${errorText}`);
  }
}

/**
 * Sends email via EmailJS
 */
async function sendEmailViaEmailJS(
  emailContent: string,
  recipient: string
): Promise<void> {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error("EmailJS not configured. Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY environment variables.");
  }

  // Dynamically load EmailJS library from CDN
  if (!(window as any).emailjs) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      script.onload = () => {
        // Wait a bit for emailjs to be available
        setTimeout(resolve, 100);
      };
      script.onerror = () => reject(new Error("Failed to load EmailJS library from CDN"));
      document.head.appendChild(script);
    });
  }

  const emailjs = (window as any).emailjs;
  if (!emailjs) {
    throw new Error("Failed to load EmailJS library.");
  }

  // Initialize EmailJS with public key
  emailjs.init(publicKey);

  // Send email
  const result = await emailjs.send(serviceId, templateId, {
    to_email: recipient,
    subject: `PodRead Collection - ${new Date().toLocaleDateString()}`,
    message: emailContent,
  });

  if (result.status !== 200) {
    throw new Error(`EmailJS returned status ${result.status}`);
  }
}

/**
 * Sends email using configured method
 */
export async function generateEpubAndEmail(chapters: Chapter[], settings: AppSettings): Promise<void> {
  if (!settings.smtpUser) {
    throw new Error("Email address not configured. Please set your email address in Settings.");
  }

  console.log(`[PodRead] Preparing email for ${chapters.length} chapters...`);
  
  // Generate EPUB content
  const emailContent = generateEpubContent(chapters);
  const recipient = settings.smtpUser;

  // Try to send via configured method
  const emailApiUrl = import.meta.env.VITE_EMAIL_API_URL;
  const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;

  try {
    // Priority: Backend API > EmailJS
    // If VITE_EMAIL_API_URL is not set, try using relative path (for single-service setup)
    if (emailApiUrl || emailjsServiceId === undefined) {
      // Use backend API (either configured URL or relative path)
      console.log(`[PodRead] Sending email via backend API...`);
      await sendEmailViaAPI(emailContent, recipient, settings, chapters);
      console.log(`[PodRead] Email sent successfully via API to ${recipient}`);
    } else if (emailjsServiceId) {
      // Use EmailJS (only if API is not available and EmailJS is configured)
      console.log(`[PodRead] Sending email via EmailJS...`);
      await sendEmailViaEmailJS(emailContent, recipient);
      console.log(`[PodRead] Email sent successfully via EmailJS to ${recipient}`);
    } else {
      // No email service configured
      throw new Error(
        "No email service configured. Please configure one of the following:\n" +
        "1. Set VITE_EMAIL_API_URL for backend API (or use relative path /api/send-email for single-service setup)\n" +
        "2. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY for EmailJS\n\n" +
        "Alternatively, you can download the file directly using the Download button."
      );
    }
  } catch (error: any) {
    console.error('[PodRead] Email sending failed:', error);
    throw error;
  }
}

/**
 * Downloads EPUB file by calling backend API
 */
export async function downloadEpub(chapters: Chapter[]): Promise<void> {
  // Use relative path if VITE_EMAIL_API_URL is not set or is a relative path
  let apiUrl = import.meta.env.VITE_EMAIL_API_URL;
  
  // If not configured or is a placeholder, use relative path (works with single-service setup)
  if (!apiUrl || apiUrl.includes('your-backend-api.com')) {
    apiUrl = '/api/download-epub';
  } else {
    // Extract base URL and use it for download endpoint
    const baseUrl = apiUrl.replace('/api/send-email', '');
    apiUrl = `${baseUrl}/api/download-epub`;
  }
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chapters: chapters,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`EPUB download error: ${response.status} - ${errorText}`);
  }

  // Get the EPUB file as blob
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PodRead_Collection_${new Date().toISOString().slice(0, 10)}.epub`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadAsTxt(chapter: Chapter) {
  const blob = new Blob([chapter.content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${chapter.title.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
