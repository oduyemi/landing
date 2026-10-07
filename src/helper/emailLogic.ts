import { sendEmail } from "./sendEmail";

export const sendEmailWithRetry = async (
  to: string,
  subject: string,
  html: string,
  retries = 2
) => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      await sendEmail(to, subject, html);
      return;
    } catch (error) {
      attempt++;

      if (attempt >= retries) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );
    }
  }
};