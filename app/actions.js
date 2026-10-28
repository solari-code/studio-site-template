"use server";

import { Resend } from 'resend';
import { siteConfig } from '@/config/site';

const RESEND_API_KEY = process?.env?.RESEND_API_KEY || "EXAMPLE_KEY"

const resend = new Resend(RESEND_API_KEY);
const notificationEmail = process?.env?.NOTIFICATION_EMAIL || "example@example.com";

// Both actions return error *codes* (MISSING_FIELDS, SEND_FAILED); the forms translate them.
// The notification mails go to the site owner and are intentionally not translated.

export async function sendContactEmail(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    const locale = formData.get('locale') || '';

    // Basic validation
    if (!name || !email || !message) {
        return { error: "MISSING_FIELDS" };
    }

    try {
        await resend.emails.send({
            from: `${siteConfig.name} Contact <${siteConfig.contact.formSender}>`,
            to: notificationEmail,
            reply_to: email,
            subject: `New message via ${new URL(siteConfig.url).host}`,
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
                <h2 style="color: #000;">New Contact Message</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${locale ? `<p><strong>Language:</strong> ${locale}</p>` : ''}
                <p><strong>Message:</strong></p>
                <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; background-color: #f4f4f4; padding: 15px; border-radius: 5px;">${message}</pre>
            </div>
        `,
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending email:", error);
        return { error: "SEND_FAILED" };
    }
}

export async function sendStarterContactEmail(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    const locale = formData.get('locale') || '';

    if (!name || !email || !message) {
        return { error: "MISSING_FIELDS" };
    }

    try {
        await resend.emails.send({
            from: `${siteConfig.name} Contact <${siteConfig.contact.formSender}>`,
            to: notificationEmail,
            reply_to: email,
            subject: `New Starter Package Request from ${name}`,
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
                <h2 style="color: #000;">New Starter Package Request</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${locale ? `<p><strong>Language:</strong> ${locale}</p>` : ''}
                <p><strong>Message:</strong></p>
                <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; background-color: #f4f4f4; padding: 15px; border-radius: 5px;">${message}</pre>
            </div>
        `,
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending starter email:", error);
        return { error: "SEND_FAILED" };
    }
}
