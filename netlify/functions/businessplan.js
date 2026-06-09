exports.handler = async (event) => {
  try {

    console.log("V9 REAL INCUBATOR STARTED");

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" })
      };
    }

    const { idea, sector, stage, region, capital } =
      JSON.parse(event.body || "{}");

    const cap = Number(capital || 0);
    const text = `${idea} ${sector}`.toLowerCase();

    // =========================
    // 📦 BANDI V9 (REAL STRUCTURE)
    // =========================

    const BANDI_DB = [
      {
        name: "Smart&Start Italia",
        entity: "Invitalia",
        link: "https://www.invitalia.it",
        sectors: ["ai", "tech", "digital", "servizi"],
        stages: ["idea", "mvp", "startup"],
        regions: ["italy"],
        min_capital: 0,
        max_capital: 1500000,
        coverage: 0.8
      },
      {
        name: "Horizon Europe - EIC Accelerator",
        entity: "European Commission",
        link: "https://eic.ec.europa.eu",
        sectors: ["ai", "deeptech", "innovation"],
        stages: ["startup"],
        regions: ["eu"],
        min_capital: 0,
        max_capital: 9999999,
        coverage: 0.7
      },
      {
        name: "Fondo Lombardia Start",
        entity: "Regione Lombardia",
        link: "https://www.bandi.regione.lombardia.it",
        sectors: ["servizi", "innovazione"],
        stages: ["idea", "mvp"],
        regions: ["lombardia"],
        min_capital: 5000,
        max_capital: 100000,
        coverage: 0.5
      }
    ];

    // =========================
    // 🎯 ENGINE V9 (REAL DECISION LOGIC)
    // =========================

    const results = [];

    for (const b of BANDI_DB) {

      const checks = {
        sector: b.sectors.some(s => text.includes(s)),
        stage: b.stages.includes(stage),
        region: b.regions.includes(region.toLowerCase()),
        capital: cap >= b.min_capital && cap <= b.max_capital
      };

      const passed = Object.values(checks).filter(Boolean).length;

      // score realistico (NON lineare perfetto)
      let score =
        (checks.sector ? 30 : 0) +
        (checks.stage ? 25 : 0) +
        (checks.region ? 25 : 0) +
        (checks.capital ? 20 : 0);

      // penalità realismo
      if (!checks.sector) score -= 15;
      if (!checks.capital) score -= 10;

      score = Math.max(0, Math.min(100, score));

      // classificazione V9
      let status =
        passed === 4 ? "ELIGIBLE" :
        passed >= 2 ? "PARTIAL_MATCH" :
        "EXCLUDED";

      // probabilità REALISTICA
      let probability =
        score >= 75 ? "high" :
        score >= 50 ? "medium" :
        "low";

      // motivazioni vere
      const reasons = [];

      if (!checks.sector) reasons.push("settore non perfettamente coerente");
      if (!checks.stage) reasons.push("fase aziendale non idonea");
      if (!checks.region) reasons.push("regione non compatibile");
      if (!checks.capital) reasons.push("capitale fuori range richiesto");

      results.push({
        name: b.name,
        entity: b.entity,
        link: b.link,
        score,
        status,
        probability,
        checks,
        reasons: reasons.length ? reasons : ["Tutti i requisiti rispettati"],
        coverage: b.coverage
      });
    }

    // separazione V9 reale
    const eligible = results.filter(r => r.status === "ELIGIBLE");
    const partial = results.filter(r => r.status === "PARTIAL_MATCH");
    const excluded = results.filter(r => r.status === "EXCLUDED");

    eligible.sort((a, b) => b.score - a.score);

    const top = eligible.slice(0, 5);

    // =========================
    // 💰 FUNDING ESTIMATE V9
    // =========================

    const maxFund = top.length
      ? Math.max(...top.map(b => b.coverage * 500000))
      : 25000;

    const conservative = Math.round(maxFund * 0.25);
    const realistic = Math.round(maxFund * 0.45);
    const optimistic = Math.round(maxFund * 0.7);

    // =========================
    // 🚀 RESPONSE V9
    // =========================

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        business_summary: `Analisi V9 incubatore per ${sector}`,

        eligible,
        partial,
        excluded,

        funding_opportunities: top,

        funding_estimate: {
          conservative,
          realistic,
          optimistic
        },

        overall_score: top.length ? top[0].score : 10,

        next_action: top.length
          ? `Procedi con candidatura a ${top[0].name}`
          : "Nessun bando idoneo: modifica regione o fase startup"
      })
    };

  } catch (err) {
    console.log("V9 ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
