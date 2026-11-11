import {
    Injectable,
    ServiceUnavailableException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly transporter: nodemailer.Transporter | null;
    private readonly remetente: string | null;

    constructor(
        private readonly configService: ConfigService,
    ) {
        const host = this.configService.get<string>('SMTP_HOST');
        const port = Number(
            this.configService.get<string>('SMTP_PORT') || 587,
        );

        const usuario = this.configService.get<string>('SMTP_USER');
        const senha = this.configService.get<string>('SMTP_PASS');

        this.remetente =
            this.configService.get<string>('SMTP_FROM') || null;

        if (host && usuario && senha && this.remetente) {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: {
                    user: usuario,
                    pass: senha,
                },
            });
        } else {
            this.transporter = null;
        }
    }

    estaConfigurado(): boolean {
        return this.transporter !== null && this.remetente !== null;
    }

    async enviarEmailRecuperacao(
        destinatario: string,
        nome: string,
        linkRecuperacao: string,
    ): Promise<void> {
        if (!this.estaConfigurado()) {
            throw new ServiceUnavailableException(
                'O serviço de envio de e-mails não está configurado.',
            );
        }

        const nomeSeguro = nome.replace(
            /[&<>"']/g,
            (caractere) => {
                const entidades: Record<string, string> = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;',
                };

                return entidades[caractere];
            },
        );

        const linkSeguro = linkRecuperacao.replace(
            /[&<>"']/g,
            (caractere) => {
                const entidades: Record<string, string> = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;',
                };

                return entidades[caractere];
            },
        );

        await this.transporter!.sendMail({
            from: this.remetente!,
            to: destinatario,
            subject: 'Recuperação de senha - Guia Cidadão',

            text: `
Olá, ${nome}!

Recebemos uma solicitação para redefinir a senha da sua conta no Guia Cidadão.

Para criar uma nova senha, acesse o link abaixo:

${linkRecuperacao}

Este link é temporário e ficará disponível por 30 minutos.

Caso você não tenha solicitado a recuperação, ignore este e-mail. Sua senha continuará a mesma.

Atenciosamente,
Equipe Guia Cidadão.
            `.trim(),

            html: `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Recuperação de senha</title>
                </head>

                <body style="margin:0;padding:30px;background:#f1f5f9;font-family:Arial,sans-serif;">
                    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;padding:32px;">

                        <h1 style="color:#0f172a;font-size:24px;">
                            Guia Cidadão
                        </h1>

                        <h2 style="color:#1e293b;font-size:20px;">
                            Recuperação de senha
                        </h2>

                        <p style="color:#475569;font-size:15px;line-height:1.7;">
                            Olá, <strong>${nomeSeguro}</strong>!
                        </p>

                        <p style="color:#475569;font-size:15px;line-height:1.7;">
                            Recebemos uma solicitação para redefinir a senha
                            da sua conta no Guia Cidadão.
                        </p>

                        <p style="color:#475569;font-size:15px;line-height:1.7;">
                            Clique no botão abaixo para cadastrar uma nova senha:
                        </p>

                        <div style="margin:28px 0;text-align:center;">
                            <a
                                href="${linkSeguro}"
                                style="
                                    display:inline-block;
                                    padding:14px 24px;
                                    background:#2563eb;
                                    color:#ffffff;
                                    text-decoration:none;
                                    border-radius:8px;
                                    font-weight:bold;
                                "
                            >
                                Redefinir minha senha
                            </a>
                        </div>

                        <p style="color:#64748b;font-size:13px;line-height:1.6;">
                            Este link é temporário e ficará disponível por
                            <strong>30 minutos</strong>.
                        </p>

                        <p style="color:#64748b;font-size:13px;line-height:1.6;">
                            Caso você não tenha solicitado a recuperação,
                            ignore este e-mail. Sua senha continuará a mesma.
                        </p>

                        <hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0;">

                        <p style="color:#94a3b8;font-size:12px;">
                            Equipe Guia Cidadão
                        </p>
                    </div>
                </body>
                </html>
            `,
        });
    }
}