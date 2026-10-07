export const sendNewMessageMail = ({
    recipientName,
    senderName,
    projectTitle,
    messagePreview,
  }: {
    recipientName: string;
    senderName: string;
    projectTitle: string;
    messagePreview: string;
  }) => {
    const portalUrl =
      process.env.NEXT_PUBLIC_PORTAL_URL ||
      "https://portal.oduyemi.dev";
  
    const safePreview =
      messagePreview.length > 180
        ? `${messagePreview.slice(0, 177)}...`
        : messagePreview;
  
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>New message</title>
        </head>
  
        <body
          style="
            margin:0;
            padding:0;
            background:#f5f5f5;
            font-family:Arial,Helvetica,sans-serif;
            color:#171717;
          "
        >
          <div
            style="
              max-width:600px;
              margin:0 auto;
              padding:40px 20px;
            "
          >
            <div
              style="
                background:#ffffff;
                border:1px solid #e5e5e5;
                border-radius:12px;
                overflow:hidden;
              "
            >
              <div
                style="
                  padding:28px 32px;
                  border-bottom:1px solid #eeeeee;
                "
              >
                <div
                  style="
                    font-size:12px;
                    font-weight:700;
                    letter-spacing:0.08em;
                    text-transform:uppercase;
                    color:#737373;
                  "
                >
                  Yẹmí | Artisanery Tech
                </div>
  
                <h1
                  style="
                    margin:16px 0 0;
                    font-size:24px;
                    line-height:1.25;
                    color:#111111;
                  "
                >
                  You have a new message
                </h1>
              </div>
  
              <div style="padding:32px;">
                <p
                  style="
                    margin:0 0 18px;
                    font-size:15px;
                    line-height:1.6;
                  "
                >
                  Hello ${recipientName},
                </p>
  
                <p
                  style="
                    margin:0 0 24px;
                    font-size:15px;
                    line-height:1.6;
                    color:#404040;
                  "
                >
                  <strong>${senderName}</strong>
                  has just sent you a message on the Oduyemi Portal.
                </p>
  
                <div
                  style="
                    margin:0 0 24px;
                    padding:18px;
                    background:#fafafa;
                    border:1px solid #eeeeee;
                    border-radius:8px;
                  "
                >
                  <div
                    style="
                      margin-bottom:8px;
                      font-size:11px;
                      font-weight:700;
                      letter-spacing:0.06em;
                      text-transform:uppercase;
                      color:#737373;
                    "
                  >
                    ${projectTitle}
                  </div>
  
                  <div
                    style="
                      font-size:14px;
                      line-height:1.6;
                      color:#404040;
                    "
                  >
                    ${safePreview}
                  </div>
                </div>
  
                <p
                  style="
                    margin:0 0 24px;
                    font-size:14px;
                    line-height:1.6;
                    color:#525252;
                  "
                >
                  Please log in to the portal to view the full message
                  and engage with the conversation.
                </p>
  
                <a
                  href="${portalUrl}"
                  style="
                    display:inline-block;
                    padding:12px 20px;
                    background:#111111;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:6px;
                    font-size:13px;
                    font-weight:600;
                  "
                >
                  Login to the Portal
                </a>
              </div>
  
              <div
                style="
                  padding:20px 32px;
                  border-top:1px solid #eeeeee;
                  color:#a3a3a3;
                  font-size:11px;
                  line-height:1.5;
                "
              >
                This is an automated notification from the Oduyemi Portal.
                Please do not reply directly to this email.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };