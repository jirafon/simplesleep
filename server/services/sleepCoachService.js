/**
 * Ask SiempreSleep — coach chat.
 * Deterministic fallback always available; LLM only with minimal normalized context.
 * Flag: AI_SLEEP_COACH
 */

const OpenAI = require('openai');
const { buildCoachContext, SYSTEM_PROMPT } = require('./sleepCoachContextBuilder');

let openai = null;
function getClient() {
  const key = (process.env.OPEN_API_KEY || '').trim();
  if (!key || !key.startsWith('sk-')) return null;
  if (!openai) openai = new OpenAI({ apiKey: key });
  return openai;
}

function deterministicReply(message, ctx, locale = 'en') {
  const es = locale === 'es';
  const q = (message || '').toLowerCase();
  const move = ctx.tonightMove?.title;
  const last = ctx.lastNight || {};
  const base = ctx.baseline || {};

  if (/tonight|esta noche|what should|qué debería|que deberia/.test(q) && move) {
    return es
      ? `Para esta noche, una sola acción: ${move}. ${ctx.tonightMove?.reason || ''}`.trim()
      : `For tonight, one move: ${move}. ${ctx.tonightMove?.reason || ''}`.trim();
  }

  if (/tired|cansad|why am i|por qué|porque/.test(q)) {
    const dur = last.totalMinutes;
    const avg = base.avgSleepMinutes;
    if (typeof dur === 'number' && typeof avg === 'number') {
      const d = Math.round(dur - avg);
      if (d < -20) {
        return es
          ? `Anoche dormiste unos ${Math.abs(d)} minutos menos que tu promedio reciente. Eso puede asociarse a sentirte más cansado hoy. Prueba la recomendación de esta noche y evita sacar conclusiones médicas.`
          : `Last night you slept about ${Math.abs(d)} minutes less than your recent average. That may be associated with feeling more tired today. Try tonight's move — this is not a medical conclusion.`;
      }
    }
    return es
      ? 'Todavía no hay suficientes datos personales para explicar el cansancio con confianza. Completa check-ins y sync de la pulsera unos días más.'
      : "There isn't enough personal data yet to explain tiredness with confidence. Keep syncing your band and check-ins for a few more nights.";
  }

  if (/screen|pantalla|phone|teléfono|telefono/.test(q)) {
    const factor = (ctx.factors || []).find((f) => /screen|phone|pantalla/i.test(f.id + f.label));
    if (factor) {
      return es
        ? `Observamos un factor relacionado con pantallas: ${factor.label} (${factor.value || ''}). Suele asociarse con noches distintas en tu historial, sin probar causa.`
        : `We noticed a screen-related factor: ${factor.label} (${factor.value || ''}). It tends to show up with different nights in your history — association, not proof of cause.`;
    }
    return es
      ? 'Aún no tenemos suficientes noches con contexto de teléfono para responder con confianza.'
      : "We don't have enough nights with phone context yet to answer confidently.";
  }

  if (/better|mejor|month|mes|week|semana/.test(q)) {
    const trend = ctx.recentTrend;
    if (trend?.avgSleepMinutes && base.avgSleepMinutes) {
      const d = Math.round(trend.avgSleepMinutes - base.avgSleepMinutes);
      return es
        ? `En tus últimas ${trend.nights} noches, el promedio fue ${trend.avgSleepMinutes} min (${d >= 0 ? '+' : ''}${d} vs tu línea base). Seguimos comparándote contigo, no con la población.`
        : `Across your last ${trend.nights} nights, average sleep was ${trend.avgSleepMinutes} min (${d >= 0 ? '+' : ''}${d} vs your baseline). We compare you to yourself, not the crowd.`;
    }
  }

  if (/experiment|hábito|habit|works|funciona/.test(q)) {
    const exp = (ctx.experiments || [])[0];
    if (exp?.resultSummary) {
      return es
        ? `Tu experimento "${exp.title}" sugiere: ${exp.resultSummary}. Es un resultado personal, no causalidad absoluta.`
        : `Your experiment "${exp.title}" suggests: ${exp.resultSummary}. That's a personal result, not absolute causation.`;
    }
    if (exp?.status === 'active') {
      return es
        ? `Tienes un experimento activo: ${exp.title}. Completa los días restantes para comparar con tu línea base.`
        : `You have an active experiment: ${exp.title}. Finish the remaining days to compare against your baseline.`;
    }
    return es
      ? 'Puedes probar un experimento personal de 7 días desde Coach — un cambio a la vez.'
      : 'You can start a 7-day personal experiment from Coach — one change at a time.';
  }

  // Default
  if (move) {
    return es
      ? `Con los datos actuales, lo más útil esta noche es: ${move}. Pregúntame también por pantallas, tendencia o experimentos.`
      : `With your current data, the most useful move tonight is: ${move}. You can also ask about screens, trends, or experiments.`;
  }

  return es
    ? 'Estamos aprendiendo tus patrones. Sync tu pulsera, activa Sleep Context si quieres, y vuelve a preguntar tras unas noches más.'
    : "We're still learning your patterns. Sync your band, enable Sleep Context if you like, and ask again after a few more nights.";
}

async function coachChat({ message, coachContext, locale = 'en' }) {
  const ctx = coachContext || buildCoachContext({});
  const client = getClient();

  if (!client) {
    return {
      reply: deterministicReply(message, ctx, locale),
      source: 'deterministic',
      contextUsed: summarizeContextMeta(ctx)
    };
  }

  try {
    const completion = await client.chat.completions.create({
      model: process.env.SLEEP_COACH_MODEL || 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 350,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'system',
          content: `User locale: ${locale}. Normalized personal context JSON:\n${JSON.stringify(ctx)}`
        },
        { role: 'user', content: String(message || '').slice(0, 500) }
      ]
    });
    const reply = completion.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error('empty_llm');
    return {
      reply,
      source: 'llm',
      contextUsed: summarizeContextMeta(ctx)
    };
  } catch (err) {
    return {
      reply: deterministicReply(message, ctx, locale),
      source: 'deterministic_fallback',
      contextUsed: summarizeContextMeta(ctx),
      warning: err.message
    };
  }
}

function summarizeContextMeta(ctx) {
  return {
    hasBaseline: Boolean(ctx?.baseline?.avgSleepMinutes),
    factorCount: ctx?.factors?.length || 0,
    hasTonightMove: Boolean(ctx?.tonightMove?.title),
    experimentCount: ctx?.experiments?.length || 0
  };
}

module.exports = {
  coachChat,
  deterministicReply,
  buildCoachContext
};
