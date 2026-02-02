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
4. **actionType**: Eine von: "email", "call", "chat", "document", "research", "check"
   - "E-Mail", "schreiben", "senden" → "email"
   - "anrufen", "telefonieren" → "call"
   - "besprechen", "Meeting", "Gespräch" → "chat"
   - "Dokument", "Bericht", "erstellen" → "document"
   - "recherchieren", "suchen", "herausfinden" → "research"
   - Standard: "check"
5. **date**: Datum als Text: "Heute", "Morgen", "Diese Woche", "Nächste Woche" oder spezifisches Datum
   - "heute", "jetzt", "sofort" → "Heute"
   - "morgen" → "Morgen"
   - "diese Woche", "bald" → "Diese Woche"
   - "nächste Woche" → "Nächste Woche"
   - Spezifische Tage: "Montag", "Freitag" → entsprechender Tag
   - Standard: "Heute"

WICHTIG: Gib KEINE Kategorie zurück! Die Kategorie wird vom Benutzer im Frontend ausgewählt.
WICHTIG: Gib KEINE Personen oder Meetings zurück, es sei denn sie werden EXPLIZIT mit Namen genannt!

Antworte NUR mit einem validen JSON-Objekt, ohne zusätzlichen Text oder Markdown:

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
          content: `Analysiere diesen gesprochenen Aufgaben-Befehl und extrahiere die strukturierten Daten:\n\n"${text}"`,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    // Extract text content from response
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Parse JSON response
    let parsedData;
    try {
      // Remove potential markdown code blocks
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsedData
