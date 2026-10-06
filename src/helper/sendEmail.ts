import { transporter } from "./tansporter";

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  await transporter.sendMail({
    from: `"Yẹmí | Artisanery Tech" <info@oduyemi.dev>`,
    to,
    subject,
    html,
  });
};