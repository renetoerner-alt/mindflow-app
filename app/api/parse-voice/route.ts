// app/api/parse-voice/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Du bist ein Assistent der gesprochene Aufgaben-Befehle in strukturierte Daten umwandelt.

Analysiere den gesprochenen Text und extrahiere folgende Informationen für eine Todo-App:

1. **title**: Der Haupttitel/Betreff der Aufgabe (kurz und prägnant, max 50 Zeichen)
2. **description**: Zusätzliche Details oder Beschreibung (kann leer sein)
3. **priority**: Priorität 1-5 (1=Kritisch, 2=Hoch, 3=Mittel, 4=Niedrig, 5=Minimal)
   - Erkenne Wörter wie "dringend", "wichtig", "kritisch" → 1 oder 2
   - Erkenne "unwichtig", "irgendwann", "wenn Zeit" → 4 oder 5
   - Standard: 3
4. **category**: Eine von: "arbeit", "privat", "finanzen", "gesundheit"
   - Erkenne Kontext: Chef, Meeting, Projekt → "arbeit"
   - Erkenne: Familie, Freunde, Hobby → "privat"
   - Erkenne: Rechnung, Budget, Geld → "finanzen"
   - Erkenne: Arzt, Sport, Medikamente → "gesundheit"
   - Standard: "arbeit"
5. **actionType**: Eine von: "email", "call", "chat", "document", "research", "check"
   - "E-Mail", "schreiben", "senden" → "email"
   - "anrufen", "telefonieren" → "call"
   - "besprechen", "Meeting", "Gespräch" → "chat"
   - "Dokument", "Bericht", "erstellen" → "document"
   - "recherchieren", "suchen", "herausfinden" → "research"
   - Standard: "check"
6. **date**: Datum als Text: "Heute", "Morgen", "Diese Woche", "Nächste Woche" oder spezifisches Datum
   - "heute", "jetzt", "sofort" → "Heute"
   - "morgen" → "Morgen"
   - "diese Woche", "bald" → "Diese Woche"
   - "nächste Woche" → "Nächste Woche"
   - Spezifische Tage: "Montag", "Freitag" → entsprechender Tag
   - Standard: "Heute"
7. **persons**: Array von Personennamen die erwähnt werden (ohne @)
8. **meetings**: Array von Meeting-Namen die erwähnt werden (ohne #)

Antworte NUR mit einem validen JSON-Objekt, ohne zusätzlichen Text oder Markdown:

{"title":"...","description":"...","priority":3,"category":"arbeit","actionType":"check","date":"Heute","persons":[],"meetings":[]}`;

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
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Analysiere diesen gesprochenen Aufgaben-Befehl und extrahiere die strukturierten Daten:\n\n"${text}"`,
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
        { error: 'Konnte Antwort nicht verarbeiten', raw: responseText },
        { status: 500 }
      );
    }

    const result = {
      title: parsedData.title || text.substring(0, 50),
      description: parsedData.description || '',
      priority: Number(parsedData.priority) || 3,
      category: parsedData.category || 'arbeit',
      actionType: parsedData.actionType || 'check',
      date: parsedData.date || 'Heute',
      persons: Array.isArray(parsedData.persons) ? parsedData.persons : [],
      meetings: Array.isArray(parsedData.meetings) ? parsedData.meetings : [],
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
