import { sendEmail } from "./sendEmail";

export const sendEmailWithRetry = async (
  to: string,
  subject: string,
  html: string,
  retries = 3
) => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      await sendEmail(to, subject, html);
      return;
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      await new Promise(r => setTimeout(r, 1500));
    }
  }
};