import { escapeHtml } from "@/utils/escapeHtml";
import { sendEmailWithRetry } from "./emailLogic";

type UserRole = "user" | "admin";

const PORTAL_URL = "https://portal.oduyemi.dev";
const LOGIN_URL = "https://portal.oduyemi.dev/login";

export const sendOnboardingMail = async (
  recipient: string,
  code: string,
  role: UserRole,
  fname: string
) => {
  const safeName = escapeHtml(fname);
  const safeCode = escapeHtml(code);

  const roleLabel = role === "admin" ? "Administrator" : "Client";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>Your Òduyémi Portal Access</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
          font-family: Arial, Helvetica, sans-serif;
          color: #222222;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width: 100%;
            background-color: #f7f7f7;
            padding: 40px 16px;
          "
        >
          <tr>
            <td align="center">

              <!-- Main Container -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  max-width: 600px;
                  width: 100%;
                  background-color: #ffffff;
                  border: 1px solid #e5e5e5;
                "
              >

                <!-- Header -->
                <tr>
                  <td
                    style="
                      padding: 28px 32px;
                      border-bottom: 1px solid #eeeeee;
                    "
                  >
                    <div
                      style="
                        font-size: 17px;
                        font-weight: 700;
                        letter-spacing: -0.5px;
                        color: #111111;
                      "
                    >
                      òduyémi/
                    </div>

                    <div
                      style="
                        margin-top: 5px;
                        font-size: 9px;
                        color: #999999;
                        letter-spacing: 0.08em;
                        text-transform: uppercase;
                      "
                    >
                      Artisanery Tech Studio
                    </div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td
                    style="
                      padding: 40px 32px 36px;
                    "
                  >

                    <!-- Eyebrow -->
                    <div
                      style="
                        margin-bottom: 12px;
                        font-size: 9px;
                        font-weight: 600;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                        color: #999999;
                      "
                    >
                      Portal invitation
                    </div>

                    <!-- Heading -->
                    <h1
                      style="
                        margin: 0;
                        font-size: 28px;
                        line-height: 1.15;
                        letter-spacing: -0.04em;
                        font-weight: 600;
                        color: #111111;
                      "
                    >
                      Welcome, ${safeName}.
                    </h1>

                    <p
                      style="
                        margin: 16px 0 0;
                        font-size: 13px;
                        line-height: 1.7;
                        color: #666666;
                      "
                    >
                      Your Òduyémi project portal account has been
                      created. You can use the portal to stay connected
                      with your projects, tasks, files, messages and
                      project updates.
                    </p>

                    <!-- Account Details -->
                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        margin-top: 28px;
                        background-color: #fafafa;
                        border: 1px solid #eeeeee;
                      "
                    >
                      <tr>
                        <td
                          style="
                            padding: 18px 20px;
                          "
                        >
                          <div
                            style="
                              font-size: 8px;
                              font-weight: 600;
                              letter-spacing: 0.12em;
                              text-transform: uppercase;
                              color: #999999;
                            "
                          >
                            Account type
                          </div>

                          <div
                            style="
                              margin-top: 5px;
                              font-size: 12px;
                              font-weight: 600;
                              color: #222222;
                            "
                          >
                            ${roleLabel}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Access Code -->
                    <div
                      style="
                        margin-top: 30px;
                      "
                    >
                      <div
                        style="
                          font-size: 10px;
                          font-weight: 600;
                          color: #333333;
                        "
                      >
                        Your temporary access code
                      </div>

                      <div
                        style="
                          margin-top: 10px;
                          padding: 18px;
                          background-color: #f5f5f5;
                          border: 1px solid #dedede;
                          text-align: center;
                        "
                      >
                        <span
                          style="
                            font-family: Arial, Helvetica, sans-serif;
                            font-size: 25px;
                            font-weight: 700;
                            letter-spacing: 4px;
                            color: #111111;
                          "
                        >
                          ${safeCode}
                        </span>
                      </div>

                      <p
                        style="
                          margin: 10px 0 0;
                          font-size: 9px;
                          line-height: 1.6;
                          color: #999999;
                        "
                      >
                        This is a temporary access code. Please change
                        your password after signing in.
                      </p>
                    </div>

                    <!-- CTA -->
                    <table
                      role="presentation"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        margin-top: 30px;
                      "
                    >
                      <tr>
                        <td
                          align="center"
                          style="
                            background-color: #111111;
                          "
                        >
                          <a
                            href="${LOGIN_URL}"
                            target="_blank"
                            style="
                              display: inline-block;
                              padding: 13px 24px;
                              font-size: 10px;
                              font-weight: 600;
                              color: #ffffff;
                              text-decoration: none;
                            "
                          >
                            Sign in to your portal →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Portal URL -->
                    <p
                      style="
                        margin: 16px 0 0;
                        font-size: 9px;
                        line-height: 1.6;
                        color: #999999;
                      "
                    >
                      Or visit
                      <a
                        href="${PORTAL_URL}"
                        target="_blank"
                        style="
                          color: #555555;
                          text-decoration: underline;
                        "
                      >
                        portal.oduyemi.dev
                      </a>
                    </p>

                    <!-- What happens next -->
                    <div
                      style="
                        margin-top: 34px;
                        padding-top: 25px;
                        border-top: 1px solid #eeeeee;
                      "
                    >
                      <div
                        style="
                          font-size: 10px;
                          font-weight: 600;
                          color: #222222;
                        "
                      >
                        What you can do in the portal
                      </div>

                      <p
                        style="
                          margin: 10px 0 0;
                          font-size: 10px;
                          line-height: 1.8;
                          color: #777777;
                        "
                      >
                        Track your projects, review tasks, access project
                        files, exchange messages, receive notifications
                        and stay up to date with your project's progress.
                      </p>
                    </div>

                    ${
                      role === "admin"
                        ? `
                          <div
                            style="
                              margin-top: 24px;
                              padding: 14px 16px;
                              background-color: #fafafa;
                              border-left: 2px solid #111111;
                            "
                          >
                            <p
                              style="
                                margin: 0;
                                font-size: 10px;
                                line-height: 1.7;
                                color: #666666;
                              "
                            >
                              Your account has been granted
                              <strong style="color: #222222;">
                                administrator access
                              </strong>.
                              Please keep your credentials secure.
                            </p>
                          </div>
                        `
                        : ""
                    }

                    <!-- Closing -->
                    <p
                      style="
                        margin: 32px 0 0;
                        font-size: 11px;
                        line-height: 1.7;
                        color: #555555;
                      "
                    >
                      I look forward to working with you.
                    </p>

                    <p
                      style="
                        margin: 18px 0 0;
                        font-size: 11px;
                        line-height: 1.6;
                        color: #555555;
                      "
                    >
                      Best regards,<br />
                      <strong style="color: #222222;">
                        Kofoworola
                      </strong>
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td
                    style="
                      padding: 20px 32px;
                      border-top: 1px solid #eeeeee;
                      background-color: #fafafa;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        font-size: 8px;
                        line-height: 1.6;
                        color: #999999;
                        text-align: center;
                      "
                    >
                      Secure · Private · Professional
                    </p>

                    <p
                      style="
                        margin: 6px 0 0;
                        font-size: 8px;
                        color: #b0b0b0;
                        text-align: center;
                      "
                    >
                      © ${new Date().getFullYear()} Òduyémi ·
                      Artisanery Tech Studio
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendEmailWithRetry(
    recipient,
    "Your Òduyémi / Artisanery Tech Project Portal Access",
    htmlContent
  );
};