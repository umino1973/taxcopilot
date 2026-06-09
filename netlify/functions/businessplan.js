import { BANDI_DB } from "./bandiDB.js";

exports.handler = async (event) => {
  try {

    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { idea, sector, stage, region, capital } = JSON.parse(event.body || "{}");

    const text = `${idea} ${sector}`.toLowerCase();

    // =========================
    // 🔎 MATCHING ENGINE
    // =========================

    let matches = [];

    for (const b of BANDI_DB) {

      let score = 0;

      // settore match
      if (b.sectors.some(s => text.includes(s))) score += 40;

      // stage match
      if (b.stage === stage) score += 30;

      // region match
      if (b.region === region.toLowerCase() || b.region === "italy") score += 20;

      // AI bonus (semplice keyword AI)
      if (text.includes("ai") || text.includes("intelligenza")) score += 10;

      if (score > 20) {
        matches.push({
          ...b,
          compatibility_score: score,
          success_probability:
            score > 70 ? "high" : score > 40 ? "medium" : "low"
        });
      }
    }

    // ordina
    matches.sort((a, b) => b.compatibility_score - a.compatibility_score);

    const top = matches.slice(0, 5);

    // =========================
    // 💰 FUNDING ESTIMATE REALISTICO
    // =========================

    let max = top.length > 0
      ? Math.max(...top.map(m => m.max_amount))
      : 30000;

    let multiplier = stage === "idea" ? 0.3 : stage === "mvp" ? 0.6 : 1;

    let conservative = Math.round(max * 0.1 * multiplier);
    let realistic = Math.round(max * 0.25 * multiplier);
    let optimistic = Math.round(max * 0.5 * multiplier);

    // fallback
    let fallback = {
      bootstrap: Math.round(capital * 2),
      bank_loans: Math.round(capital * 5),
      microcredit: Math.round(capital * 3)
    };

    // =========================
    // BUSINESS SUMMARY (AI SOLO QUI)
    // =========================

    const apiKey = process.env.OPENAI_API_KEY;

    const ai = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Sei un incubatore startup sintetico e pragmatico."
          },
          {
            role: "user",
            content: `Riassumi questa idea: ${idea}`
          }
        ]
      })
    });

    const aiData = await ai.json();
    const summary = aiData?.choices?.[0]?.message?.content;

    // =========================
    // OUTPUT
    // =========================

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        business_summary: summary,
        funding_opportunities: top,
        funding_estimate: {
          conservative,
          realistic,
          optimistic
        },
        fallback_financing: fallback,
        overall_score: top.length
          ? Math.round(top[0].compatibility_score)
          : 10,
        next_action: top.length
          ? `Candidati a: ${top[0].name}`
          : "Valida meglio il settore e ripeti analisi"
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
