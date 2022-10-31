import nodemailer from 'nodemailer';
import 'dotenv/config';


export default class Mailer {
    // -----[PUBLIC STATIC METHODS]-----

    public static async sendMail(subject: string, text: string): Promise<void> {
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.mail.ru',
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env['MAIL_USER'],
                    pass: process.env['MAIL_PASS']
                },
                logger: true
            });

            const info = await transporter.sendMail({
                from: process.env['MAIL_USER'],
                to: process.env['MAIL_USER'],
                subject: subject,
                text: text,
                html: `<b>${text}</b>`
            });
            console.log(info.response);
            return;
        } catch (error) {
            console.log(error);
        }
    }
}
