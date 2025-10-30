import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  WhatsAppMessage,
  WhatsAppIncomingMessage,
  WhatsAppStatus,
  SendMessageDto,
} from './interfaces/whatsapp.interface';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly apiUrl: string;
  private readonly phoneNumberId: string;
  private readonly apiToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const apiVersion = this.configService.get<string>(
      'WHATSAPP_API_VERSION',
      'v21.0',
    );
    this.phoneNumberId = this.configService.get<string>(
      'WHATSAPP_PHONE_NUMBER_ID',
      '',
    );
    this.apiToken = this.configService.get<string>('WHATSAPP_API_TOKEN', '');
    this.apiUrl = `https://graph.facebook.com/${apiVersion}/${this.phoneNumberId}/messages`;
  }

  /**
   * Verifica el webhook de WhatsApp
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = this.configService.get<string>(
      'WHATSAPP_VERIFY_TOKEN',
      '',
    );

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Webhook verificado correctamente');
      return challenge;
    }

    this.logger.error('Verificación de webhook fallida');
    return null;
  }

  /**
   * Procesa los mensajes entrantes de WhatsApp
   */
  async processIncomingMessage(body: WhatsAppMessage): Promise<void> {
    try {
      // Verificar que el objeto sea de WhatsApp
      if (body.object !== 'whatsapp_business_account') {
        this.logger.warn('Objeto no es de WhatsApp Business Account');
        return;
      }

      // Procesar cada entrada
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          const value = change.value;

          // Procesar mensajes
          if (value.messages && value.messages.length > 0) {
            for (const message of value.messages) {
              await this.handleMessage(message);
            }
          }

          // Procesar estados de mensajes (enviado, entregado, leído, etc.)
          if (value.statuses && value.statuses.length > 0) {
            for (const status of value.statuses) {
              this.handleMessageStatus(status);
            }
          }
        }
      }
    } catch (error) {
      const safeError = error as Error & { response?: { data?: unknown } };
      const details = safeError.response?.data ?? safeError.message;
      this.logger.error('Error procesando mensaje entrante:', details);
      throw safeError;
    }
  }

  /**
   * Maneja un mensaje individual
   */
  private async handleMessage(message: WhatsAppIncomingMessage): Promise<void> {
    this.logger.log(`Mensaje recibido de: ${message.from}`);
    this.logger.log(`Tipo de mensaje: ${message.type}`);

    // Marcar el mensaje como leído
    await this.markAsRead(message.id);

    switch (message.type) {
      case 'text':
        if (message.text) {
          this.logger.log(`Texto: ${message.text.body}`);
          // Aquí puedes implementar tu lógica para responder al mensaje
          await this.handleTextMessage(message);
        }
        break;

      case 'image':
        this.logger.log('Imagen recibida:', message.image);
        break;

      case 'video':
        this.logger.log('Video recibido:', message.video);
        break;

      case 'audio':
        this.logger.log('Audio recibido:', message.audio);
        break;

      case 'document':
        this.logger.log('Documento recibido:', message.document);
        break;

      case 'location':
        this.logger.log('Ubicación recibida:', message.location);
        break;

      case 'interactive':
        this.logger.log('Interacción recibida:', message.interactive);
        break;

      default:
        this.logger.warn(`Tipo de mensaje no manejado: ${message.type}`);
    }
  }

  /**
   * Maneja mensajes de texto con lógica de respuesta automática
   */
  private async handleTextMessage(
    message: WhatsAppIncomingMessage,
  ): Promise<void> {
    if (!message.text) return;

    const messageText = message.text.body.toLowerCase();

    // Ejemplo de respuesta automática
    if (messageText.includes('hola') || messageText.includes('hi')) {
      await this.sendTextMessage(
        message.from,
        '¡Hola! 👋 Bienvenido a nuestro servicio de WhatsApp.',
      );
    } else if (messageText.includes('ayuda') || messageText.includes('help')) {
      await this.sendTextMessage(
        message.from,
        'Puedo ayudarte con:\n1. Información general\n2. Soporte técnico\n3. Contacto con un agente\n\nEscribe el número de la opción que necesites.',
      );
    } else {
      // Respuesta por defecto
      await this.sendTextMessage(
        message.from,
        'Gracias por tu mensaje. Un agente te responderá pronto.',
      );
    }
  }

  /**
   * Maneja los estados de los mensajes
   */
  private handleMessageStatus(status: WhatsAppStatus): void {
    this.logger.log(
      `Estado del mensaje ${status.id}: ${status.status} - Destinatario: ${status.recipient_id}`,
    );
  }

  /**
   * Envía un mensaje de texto
   */
  async sendTextMessage(to: string, text: string): Promise<any> {
    const messageData: SendMessageDto = {
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    };

    return this.sendMessage(messageData);
  }

  /**
   * Envía un mensaje con imagen
   */
  async sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string,
  ): Promise<any> {
    const messageData: SendMessageDto = {
      to,
      type: 'image',
      image: {
        link: imageUrl,
        caption,
      },
    };

    return this.sendMessage(messageData);
  }

  /**
   * Envía un mensaje con video
   */
  async sendVideoMessage(
    to: string,
    videoUrl: string,
    caption?: string,
  ): Promise<any> {
    const messageData: SendMessageDto = {
      to,
      type: 'video',
      video: {
        link: videoUrl,
        caption,
      },
    };

    return this.sendMessage(messageData);
  }

  /**
   * Envía un mensaje con documento
   */
  async sendDocumentMessage(
    to: string,
    documentUrl: string,
    filename: string,
    caption?: string,
  ): Promise<any> {
    const messageData: SendMessageDto = {
      to,
      type: 'document',
      document: {
        link: documentUrl,
        filename,
        caption,
      },
    };

    return this.sendMessage(messageData);
  }

  /**
   * Envía un mensaje usando plantilla
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = 'es',
    components?: any[],
  ): Promise<any> {
    const messageData: SendMessageDto = {
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        components,
      },
    };

    return this.sendMessage(messageData);
  }

  /**
   * Método genérico para enviar mensajes
   */
  private async sendMessage(messageData: SendMessageDto): Promise<any> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        ...messageData,
      };

      const response = await firstValueFrom(
        this.httpService.post(this.apiUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiToken}`,
          },
        }),
      );

      this.logger.log(`Mensaje enviado correctamente a ${messageData.to}`);
      return response.data;
    } catch (error) {
      const safeError = error as Error & { response?: { data?: unknown } };
      const details = safeError.response?.data ?? safeError.message;
      this.logger.error('Error enviando mensaje:', details);
      throw safeError;
    }
  }

  /**
   * Marca un mensaje como leído
   */
  private async markAsRead(messageId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        ),
      );

      this.logger.log(`Mensaje ${messageId} marcado como leído`);
    } catch (error) {
      const safeError = error as Error & { response?: { data?: unknown } };
      const details = safeError.response?.data ?? safeError.message;
      this.logger.error('Error marcando mensaje como leído:', details);
    }
  }

  /**
   * Descarga un medio (imagen, video, audio, documento)
   */
  async downloadMedia(mediaId: string): Promise<Buffer> {
    try {
      const apiVersion = this.configService.get<string>(
        'WHATSAPP_API_VERSION',
        'v21.0',
      );

      // Primero obtener la URL del medio
      const mediaUrlResponse = await firstValueFrom(
        this.httpService.get(
          `https://graph.facebook.com/${apiVersion}/${mediaId}`,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          },
        ),
      );
      const mediaUrl = (mediaUrlResponse.data as { url?: string })?.url;
      if (!mediaUrl) {
        throw new Error('No se pudo obtener la URL del recurso solicitado');
      }

      // Descargar el medio
      const mediaResponse = await firstValueFrom(
        this.httpService.get<ArrayBuffer>(mediaUrl, {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
          responseType: 'arraybuffer',
        }),
      );

      return Buffer.from(mediaResponse.data);
    } catch (error) {
      const safeError = error as Error & { response?: { data?: unknown } };
      const details = safeError.response?.data ?? safeError.message;
      this.logger.error('Error descargando medio:', details);
      throw safeError;
    }
  }
}
