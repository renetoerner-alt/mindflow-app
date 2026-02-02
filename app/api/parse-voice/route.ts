import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Du bist ein Assistent der Aufgaben-Befehle analysiert. Extrahiere: title, description, priority (1-5), actionType (email/call/chat/document/research/check), date (Heute/Morgen/Diese Woche/Nächste Woche). Antworte NUR mit JSON.`;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text fehlt' }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    let parsedData;
    try {
      parsedData = JSON.parse(responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch {
      return NextResponse.json({ error: 'Parse error' }, { status: 500 });
    }

    return NextResponse.json({
      title: parsedData.title || text.substring(0, 50),
      description: parsedData.description || '',
      priority: Number(parsedData.priority) || 3,
      actionType: parsedData.actionType || 'check',
      date: parsedData.date || 'Heute',
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
