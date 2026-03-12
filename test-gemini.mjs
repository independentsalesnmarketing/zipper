/**
 * Gemini API test — simulates realistic user messages for the Internet Advisor
 * Run: node test-gemini.mjs
 */

const KEY = 'AIzaSyAaa7GXk5eW4jBfvmqCCnMUzn5uQTz_q4E';
const CHAT_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEY}`;
const TTS_URL  = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${KEY}`;

const SYSTEM = `You are a friendly internet broadband advisor for Internet4All.com. 
Available partners: Spectrum (from $30/mo, up to 2Gbps), AT&T Fiber (from $35/mo, fiber), 
Verizon Fios (from $35/mo, fiber), Altafiber (from $30/mo, fiber, serves Cincinnati OH area).
STRICT RULE: Only recommend providers listed above. Never recommend others.
Keep responses concise (2-4 sentences). Include [[ORDER:slug:Plan Name]] when recommending a plan.`;

const questions = [
  "hi what can you help me with",
  "what internet is available in zip 45240",
  "i just want basic internet nothing fancy, cheapest option",
  "is fiber available near me? zip is 45240",
  "how fast do i need for netflix and gaming",
  "ok im ready to sign up for spectrum internet premier",
  "whats the difference between cable and fiber",
];

async function chatTest(q, history) {
  history.push({ role: 'user', parts: [{ text: q }] });

  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM }] },
      contents: history,
      generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
    }),
    signal: AbortSignal.timeout(20000),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data.error));

  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (reply) history.push({ role: 'model', parts: [{ text: reply }] });
  return { reply, usage: data.usageMetadata };
}

async function ttsTest(text) {
  const res = await fetch(TTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `Say warmly and conversationally: ${text}` }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Sulafat' } }
        }
      }
    }),
    signal: AbortSignal.timeout(20000),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data.error));

  const part = data?.candidates?.[0]?.content?.parts?.[0];
  const audio = part?.inlineData?.data || part?.inline_data?.data;
  return audio ? `✅ Audio received (${Math.round(audio.length * 0.75 / 1024)}KB decoded)` : '❌ No audio in response';
}

async function run() {
  console.log('═════════════════════════════════════════════════');
  console.log(' GEMINI API TEST — Internet Advisor Simulation');
  console.log('═════════════════════════════════════════════════\n');

  // 1. Test chat with a flowing conversation
  const history = [];
  let chatOk = true;

  for (const q of questions) {
    const t0 = Date.now();
    try {
      const { reply, usage } = await chatTest(q, history);
      const ms = Date.now() - t0;
      console.log(`USER: ${q}`);
      console.log(`BOT (${ms}ms): ${reply.substring(0, 400)}`);
      if (reply.length > 400) console.log(`     [... ${reply.length} chars total]`);
      console.log(`TOKENS: in=${usage?.promptTokenCount} out=${usage?.candidatesTokenCount}`);
      console.log('─────────────────────────────────────────────────');
    } catch(e) {
      chatOk = false;
      console.log(`USER: ${q}`);
      console.log(`❌ CHAT ERROR: ${e.message}`);
      console.log('─────────────────────────────────────────────────');
    }
    // Small delay between requests
    await new Promise(r => setTimeout(r, 500));
  }

  // 2. Test TTS
  console.log('\n══ TTS TEST ══════════════════════════════════════');
  const ttsText = "Great news! Altafiber has fiber internet in your area starting at just $30 a month. Want me to set you up?";
  console.log(`Testing TTS with: "${ttsText}"`);
  const t1 = Date.now();
  try {
    const result = await ttsTest(ttsText);
    console.log(`TTS result (${Date.now()-t1}ms): ${result}`);
  } catch(e) {
    console.log(`❌ TTS ERROR: ${e.message}`);
  }

  console.log('\n══ SUMMARY ═══════════════════════════════════════');
  console.log(`Chat API: ${chatOk ? '✅ Working' : '❌ Errors detected'}`);
  console.log('Key: AIzaSyAaa7GXk5eW4jBfvmqCCnMUzn5uQTz_q4E');
}

run().catch(e => console.error('Fatal:', e));
