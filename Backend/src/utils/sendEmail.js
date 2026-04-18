import * as brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();

// Correct Authentication Setup
if (process.env.BREVO_API_KEY) {
    apiInstance.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;
} else {
    console.error("CRITICAL: BREVO_API_KEY is missing from .env");
}

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();

        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.sender = {
            name: "eScout",
            email: process.env.SMTP_EMAIL || "satyateja1707@gmail.com"
        };
        
        // Ensure 'to' is an array of objects
        sendSmtpEmail.to = [{ email: to }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        
        // Brevo returns a 201 Created on success
        console.log("Brevo API Response:", data.response.statusCode); 
        return { success: true, data: data.body };
    } catch (err) {
        // Log the actual error body from Brevo (important for debugging 401/403 errors)
        console.error("Brevo Error Detail:", err.response?.body || err.message);
        throw err;
    }
};