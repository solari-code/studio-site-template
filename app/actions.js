"use server";

import { Resend } from 'resend';
import { siteConfig } from '@/config/site';

const RESEND_API_KEY = process?.env?.RESEND_API_KEY || "EXAMPLE_KEY"

const resend = new Resend(RESEND_API_KEY);
const notificationEmail = process?.env?.NOTIFICATION_EMAIL || "example@example.com";

export async function sendContactEmail(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Basic validation
    if (!name || !email || !message) {
        return { error: "Please fill out all fields." };
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
                <p><strong>Message:</strong></p>
                <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; background-color: #f4f4f4; padding: 15px; border-radius: 5px;">${message}</pre>
            </div>
        `,
        });

        return { success: "Message sent successfully! We'll get back to you soon." };
    } catch (error) {
        console.error("Error sending email:", error);
        return { error: "Sorry, something went wrong. Please try again." };
    }
}

export async function sendStarterContactEmail(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    if (!name || !email || !message) {
        return { error: "Please fill out all fields." };
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
                <p><strong>Message:</strong></p>
                <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; background-color: #f4f4f4; padding: 15px; border-radius: 5px;">${message}</pre>
            </div>
        `,
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending starter email:", error);
        return { error: "Sorry, something went wrong. Please try again." };
    }
}
