/// <reference types="node" />

// notification_dispatcher.ts

const EMAIL_SMTP_SERVER = "smtp.mailtrap.io";
const EMAIL_PORT = 2525;
const EMAIL_USER = "user_12345";
const EMAIL_PASS = "pass_abcde";

const SMS_API_URL = "https://api.twilio.com/2010-04-01/Accounts/AC_xyz/Messages.json";
const SMS_API_KEY = "sk_test_1234567890";

const PUSH_FCM_URL = "https://fcm.googleapis.com/fcm/send";
const PUSH_SERVER_KEY = "AAAA_test_key_xyz";

export async function sendNotification(
    type: "email" | "sms" | "push" | string,
    recipient: string,
    message: string
): Promise<boolean> {
    console.log(`[SYSTEM] Starting processing notification of type: ${type} to ${recipient}`);

    if (type === "email") {
        console.log(`[EMAIL] Connecting to SMTP server: ${EMAIL_SMTP_SERVER}:${EMAIL_PORT}...`);
        console.log(`[EMAIL] Authorizing user: ${EMAIL_USER}...`);
        
        const formattedMessage = `
            <html>
            <body>
                <h1>You have a new notification!</h1>
                <p>${message}</p>
                <br/>
                <small>Sent from the test system</small>
            </body>
            </html>
        `;

        try {
            console.log(`[EMAIL] Sending to address ${recipient}...`);
            await new Promise(resolve => setTimeout(resolve, 500)); 
            console.log("[EMAIL] Success: Email sent successfully.");
            return true;
        } catch (error) {
            console.error("[EMAIL] Critical error:", error);
            return false;
        }

    } else if (type === "sms") {
        console.log(`[SMS] Preparing POST request to: ${SMS_API_URL}`);
        
        let attempts = 0;
        const maxRetries = 3;
        let success = false;

        while (attempts < maxRetries && !success) {
            attempts++;
            console.log(`[SMS] Attempting send (${attempts}/${maxRetries}) to ${recipient}...`);
            
            try {
                if (attempts < 2) throw new Error("Connection timeout to SMS gateway"); 
                
                console.log(`[SMS] Authorizing with key: ${SMS_API_KEY.substring(0, 5)}...`);
                console.log(`[SMS] Payload: [Notification] ${message}`);
                console.log("[SMS] Success: Message delivered.");
                success = true;
            } catch (error) {
                console.error(`[SMS] Error on attempt ${attempts}:`, (error as Error).message);
                if (attempts === maxRetries) {
                    console.error("[SMS] Max retries exhausted. Sending failed.");
                    return false;
                }
            }
        }
        return success;

    } else if (type === "push") {
        console.log(`[PUSH] Composing Firebase notification: ${PUSH_FCM_URL}`);
        
        try {
            console.log(`[PUSH] Using Server Key: ${PUSH_SERVER_KEY.substring(0, 5)}...`);
            console.log(`[PUSH] Payload: { "to": "${recipient}", "notification": { "body": "${message}" } }`);
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log("[PUSH] Success: Push sent to device.");
            return true;
        } catch (error) {
            console.error("[PUSH] Error during communication with FCM:", error);
            return false;
        }

    } else {
        console.warn(`[SYSTEM] Warning: Unknown notification type '${type}'. Ignoring.`);
        return false; 
    }
}

// ==========================================
// TEST
// ==========================================
async function runDemo() {
    console.log("--- START DEMO ---");
    await sendNotification("email", "john.doe@example.com", "Electricity invoice has been generated.");
    console.log("------------------");
    await sendNotification("sms", "+48111222333", "Your login code is: 9942");
    console.log("------------------");
    await sendNotification("slack", "#dev-team", "Server outage!");
    console.log("--- END DEMO ---");
}

if (require.main === module) {
    runDemo();
}