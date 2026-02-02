import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Du bist ein Assistent der gesprochene Aufgaben-Befehle in strukturierte Daten umwandelt.

Analysiere den gesprochenen Text und extrahiere folgende Informationen:

1. title: Der Haupttitel der Aufgabe (kurz, max 50 Zeichen)
2. description: Zusätzliche Details (kann leer sein)
3. priority: 1-5 (1=Kritisch, 2=Hoch, 3=Mittel, 4=Niedrig, 5=Minimal)
4. actionType: email, call, chat, document, research, oder check
5. date: Heute, Morgen, Diese Woche, Nächste Woche

WICHTIG: Gib KEINE Kategorie zurück!

Antworte NUR mit JSON:
{"title":"...","description":"...","priority":3,"actionType":"check","date":"Heute"}`;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text ist erforderlich' },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Analysiere diesen Aufgaben-Befehl:\n\n"${text}"`,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    let parsedData;
    try {
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { error: 'Konnte Antwort nicht verarbeiten' },
        { status: 500 }
      );
    }

    const result = {
      title: parsedData.title || text.substring(0, 50),
      description: parsedData.description || '',
      priority: Number(parsedData.priority) || 3,
      actionType: parsedData.actionType || 'check',
      date: parsedData.date || 'Heute',
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
