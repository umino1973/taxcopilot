exports.handler = async (event) => {

  console.log("BUSINESSPLAN START");

  try {

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" })
      };
    }

    const body = JSON.parse(event.body || "{}");

    const idea = (body.idea || "").toLowerCase();
    const sector = (body.sector || "").toLowerCase();
    const stage = body.stage || "idea";
    const region = (body.region || "").toLowerCase();
    const capital = Number(body.capital || 0);

    // =========================
    // 🧠 BANDI FALLBACK (SE JSON FALLISCE)
    // =========================

    let BANDI = [];

    try {
      const fs = require("fs");
      const path = require("path");

      const dbPath = path.join(process.cwd(), "data", "bandi.json");

      console.log("DB PATH:", dbPath);

      BANDI = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    } catch (err) {

      console.log("FALLBACK MODE ATTIVO:", err.message);

      // fallback minimo per NON bloccare tutto
      BANDI = [
        {
          name: "Smart&Start Italia",
          entity: "Invitalia",
          regions: ["italy", "lombardia"],
          signals: ["ai", "startup", "innovazione", "servizi", "badanti"],
          stages: ["idea", "mvp", "startup"],
          min_capital: 0,
          max_capital: 1500000
        }
      ];
    }
    
    const text = `${idea} ${sector}`;

    function score(b) {

      let s = 0;

      if (b.regions.includes(region)) s += 30;
      if (b.stages.includes(stage)) s += 20;
      if (capital >= b.min_capital && capital <= b.max_capital) s += 20;

      const hits = (b.sectors || []).filter(x => text.includes(x));
    if (hits.length === 0) {
  s -= 20;
} else if (hits.length === 1) {
  s += 15;
} else if (hits.length === 2) {
  s += 25;
} else {
  s += 35;
}

      return Math.min(100, s);
    }

    const results = BANDI.map(b => ({
      name: b.name,
      entity: b.entity,
      score: score(b)
    }));

    const sorted = results.sort((a,b) => b.score - a.score);
    const best = sorted[0];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        best_match: best,
        all_results: sorted,
        debug: "OK"
      })
    };

  } catch (err) {

    console.log("FATAL ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    };
  }
};
