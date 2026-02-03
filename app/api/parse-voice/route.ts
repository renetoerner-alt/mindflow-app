import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Du extrahierst strukturierte Task-Daten aus deutschem Sprachtext.
Antworte AUSSCHLIESSLICH mit gültigem JSON - kein Text davor oder danach.

Schema:
{
  "title": string (nur die Aufgabe selbst, ohne Datum/Priorität/Zeitangaben),
  "description": string | null,
  "priority": 1 | 2 | 3 | 4 | 5 (1=kritisch, 5=niedrig, 3=normal),
  "actionType": "email" | "call" | "chat" | "document" | "research" | "check",
  "date": "YYYY-MM-DD" | "Heute" | "Morgen" | null
}

Regeln:
- Extrahiere Datum aus Text (z.B. "10. Juni" → "2025-06-10", "morgen" → "Morgen", "heute" → "Heute")
- Extrahiere Priorität aus Text ("dringend/wichtig/kritisch" → 1-2, "niedrig/unwichtig" → 4-5)
- Title enthält NUR die Aufgabenbeschreibung, NICHT Datum, Priorität oder Zeitangaben
- Wenn kein Datum erkannt wird, setze null
- Wenn keine Priorität erkannt wird, setze 3
- actionType: email=E-Mail, call=Anruf, chat=Besprechung/Meeting, document=Dokument, research=Recherche, check=Standard`;

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
      title: parsedData.title || 'Neue Aufgabe',
      description: parsedData.description || null,
      priority: Number(parsedData.priority) || 3,
      actionType: parsedData.actionType || 'check',
      date: parsedData.date || null,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
