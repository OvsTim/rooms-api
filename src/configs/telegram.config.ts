import { ConfigService } from '@nestjs/config';
import { ITelegramOptions } from '../telegram/telegram.interface';

export const getTelegramConfig = (
  configService: ConfigService,
): ITelegramOptions => {
  const token = configService.get<string>('TELEGRAM_TOKEN');
  if (!token) {
    throw new Error('Telegram token missing');
  }
  return {
    token,
    chatId: configService.get('CHAT_ID') ?? '',
  };
};
