import { NextResponse } from 'next/server';
import { fetchUrlMetadata } from '@/lib/metadata/scraper';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Telegram webhook payload handling
    const message = body.message || body.channel_post;
    if (!message) {
      return NextResponse.json({ status: 'ignored' });
    }

    const chatId = message.chat?.id;
    const text = message.text || message.caption || '';

    if (text) {
      const meta = await fetchUrlMetadata(text);

      // Respond via Telegram Bot API if bot token exists
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken && chatId) {
        const replyText = `✅ **Saved to Link Vault!**\n\n📌 **Title:** ${meta.title}\n🏷️ **Category:** ${meta.category}\n🌐 **Platform:** ${meta.platform.toUpperCase()}\n\n💡 *AI Takeaway:* ${meta.ai_summary.slice(0, 100)}...`;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: replyText,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '📁 AI/ML Tools', callback_data: `cat_ai_${meta.url}` },
                  { text: '⭐ Open Source', callback_data: `cat_os_${meta.url}` },
                ],
                [
                  { text: '🔌 Embedded/IoT', callback_data: `cat_iot_${meta.url}` },
                  { text: '🎨 Design', callback_data: `cat_design_${meta.url}` },
                ],
              ],
            },
          }),
        });
      }

      return NextResponse.json({ status: 'success', saved: meta });
    }

    return NextResponse.json({ status: 'no_text' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
