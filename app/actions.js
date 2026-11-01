"use server";

import { Resend } from 'resend';
import { siteConfig } from '@/config/site';

const RESEND_API_KEY = process?.env?.RESEND_API_KEY || "EXAMPLE_KEY"

const resend = new Resend(RESEND_API_KEY);
const notificationEmail = process?.env?.NOTIFICATION_EMAIL || "example@example.com";

const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Sends the notification mail for a contact form to the site owner.
 * The hidden `form` field picks the subject/heading from `siteConfig.forms` ("contact" by default).
 * Returns error *codes* (MISSING_FIELDS, SEND_FAILED); the forms translate them.
 * The notification mails go to the site owner and are intentionally not translated.
 */
export async function sendContactEmail(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    const locale = formData.get('locale') || '';
    const form = siteConfig.forms[formData.get('form')] ?? siteConfig.forms.contact;

    // Basic validation
    if (!name || !email || !message) {
        return { error: "MISSING_FIELDS" };
    }

    const fill = (template) => template
        .replace('{name}', escapeHtml(name))
        .replace('{host}', new URL(siteConfig.url).host);

    try {
        // Resend reports API errors as a return value, not as an exception
        const { error } = await resend.emails.send({
            from: `${siteConfig.name} Contact <${siteConfig.contact.formSender}>`,
            to: notificationEmail,
            reply_to: email,
            subject: fill(form.subject),
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
                <h2 style="color: #000;">${escapeHtml(form.heading)}</h2>
                <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                ${locale ? `<p><strong>Language:</strong> ${escapeHtml(locale)}</p>` : ''}
                <p><strong>Message:</strong></p>
                <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; background-color: #f4f4f4; padding: 15px; border-radius: 5px;">${escapeHtml(message)}</pre>
            </div>
        `,
        });

        if (error) {
            console.error("Error sending email:", error);
            return { error: "SEND_FAILED" };
        }

        return { success: true };
    } catch (error) {
        console.error("Error sending email:", error);
        return { error: "SEND_FAILED" };
    }
}
