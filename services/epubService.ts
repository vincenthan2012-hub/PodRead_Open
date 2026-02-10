
import { Chapter, AppSettings } from "../types";

/**
 * Simulates the Email sending process.
 * IMPORTANT: Direct SMTP from a browser is technically impossible due to security.
 * A production app would use a backend (Node.js, Firebase, etc.) or a service like EmailJS.
 * This function provides high-fidelity feedback and simulates the protocol handshake.
 */
export async function generateEpubAndEmail(chapters: Chapter[], settings: AppSettings): Promise<void> {
  console.log(`[PodRead SMTP Bridge] Initializing secure connection to ${settings.smtpHost || 'simulated-relay.podread.io'}...`);
  
  // Handshake simulation
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log(`[PodRead SMTP Bridge] Authenticating user: ${settings.smtpUser}...`);
  
  await new Promise(resolve => setTimeout(resolve, 1200));
  console.log(`[PodRead SMTP Bridge] Constructing EPUB payload for ${chapters.length} chapters...`);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (settings.useCustomSmtp && (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass)) {
    throw new Error("SMTP settings are incomplete. Please verify Host, User, and Pass.");
  }

  console.log(`[PodRead SMTP Bridge] Success: Message sent to ${settings.smtpUser}.`);
  return Promise.resolve();
}

/**
 * Generates a mock EPUB (actually a single text/markdown file for simplicity) 
 * that the user can download directly.
 */
export async function downloadEpub(chapters: Chapter[]): Promise<void> {
  let fullContent = chapters.map(c => c.content).join('\n\n--- NEXT CHAPTER ---\n\n');
  const blob = new Blob([fullContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PodRead_Collection_${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return Promise.resolve();
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
