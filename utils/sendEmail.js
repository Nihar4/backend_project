import { createTransport } from "nodemailer";

export const sendEmail = async (to, subject, text) => {
    const transporter = createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "stockportfoliox@gmail.com",
            pass: "mtjjyzpfeippifdp",
        },
    });

    // Check if 'to' is an array of email addresses
    if (Array.isArray(to)) {
        // Send the email to multiple recipients
        await transporter.sendMail({
            to: to.join(', '), // Join email addresses with a comma and space
            subject,
            text,
        });
    } else {
        // Send the email to a single recipient
        await transporter.sendMail({
            to,
            subject,
            text,
        });
    }
};
