const nodemailer = require("nodemailer");

const createTransporter = () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
    const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "UrbanNest <noreply@urbannest.com>";
    const subject = "UrbanNest - Reset Your Password";
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">UrbanNest Password Reset</h2>
            <p>Hi ${name || "there"},</p>
            <p>We received a request to reset your password. Click the button below to choose a new password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
                Reset Password
            </a>
            <p style="color: #64748b; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
            <p style="color: #64748b; font-size: 12px; word-break: break-all;">Or copy this link: ${resetUrl}</p>
        </div>
    `;

    const transporter = createTransporter();

    if (!transporter) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("SMTP is not configured");
        }
        console.log("[Password Reset] SMTP not configured. Reset link:", resetUrl);
        return { delivered: false, resetUrl };
    }

    await transporter.sendMail({ from, to, subject, html });
    return { delivered: true };
};

const sendPasswordResetOtpEmail = async ({ to, name, otp }) => {
    const transporter = createTransporter();

    if (!transporter) {
        throw new Error("SMTP is not configured");
    }

    const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "UrbanNest <noreply@urbannest.com>";
    await transporter.sendMail({
        from,
        to,
        subject: "UrbanNest - Your password reset code",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">UrbanNest Password Reset</h2>
                <p>Hi ${name || "there"},</p>
                <p>Use this verification code to reset your password:</p>
                <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #1e293b;">${otp}</p>
                <p>This code expires in 10 minutes. Do not share it with anyone.</p>
            </div>
        `
    });
};

module.exports = { sendPasswordResetEmail, sendPasswordResetOtpEmail };
