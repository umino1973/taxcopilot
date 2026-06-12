const BANDI = [
  {
    name: "Smart&Start Italia",
    entity: "Invitalia",
    link: "https://www.invitalia.it",
    sectors: ["ai","tech","digital","servizi"],
    stages: ["idea","mvp","startup"],
    regions: ["italy"],
    min_capital: 0,
    max_capital: 1500000,
    coverage: 0.8,
    requirements: [
      "Startup innovativa",
      "Sede in Italia",
      "Progetto innovativo"
    ]
  },
  {
    name: "Fondo Lombardia Start",
    entity: "Regione Lombardia",
    link: "https://www.bandi.regione.lombardia.it",
    sectors: ["servizi","innovazione"],
    stages: ["idea","mvp"],
    regions: ["lombardia"],
    min_capital: 5000,
    max_capital: 100000,
    coverage: 0.5,
    requirements: [
      "Sede Lombardia",
      "Early stage",
      "PMI o startup"
    ]
  },
  {
    name: "Horizon Europe",
    entity: "European Commission",
    link: "https://eic.ec.europa.eu",
    sectors: ["ai","deeptech"],
    stages: ["startup"],
    regions: ["eu"],
    min_capital: 0,
    max_capital: 9999999,
    coverage: 0.7,
    requirements: [
      "Scalabilità UE",
      "Innovazione profonda",
      "Team strutturato"
    ]
  }
];

exports.handler = async (event) => {
console.log("V12 FUNCTION START");

try {

```
if (event.httpMethod !== "POST") {
  return {
    statusCode: 405,
    body: JSON.stringify({
      error: "Method Not Allowed"
    })
  };
}

const body = JSON.parse(event.body || "{}");

const idea = body.idea || "";
const sector = body.sector || "";
const stage = (body.stage || "").toLowerCase();
const region = (body.region || "").toLowerCase();
const capital = Number(body.capital || 0);

const text = (idea + " " + sector).toLowerCase();

// =========================
// 📦 LOAD BANDI DATABASE
// =========================

const BANDI = require("../../data/bandi.json");

console.log("BANDI LOADED:", BANDI.length);

// =========================
// 🎯 MATCHING ENGINE
// =========================

const results = [];

for (const b of BANDI) {

  const checks = {
    sector: b.sectors.some(s =>
      text.includes(String(s).toLowerCase())
    ),

    stage: b.stages.includes(stage),

    region:
      b.regions.includes(region) ||
      b.regions.includes("italy") ||
      b.regions.includes("eu"),

    capital:
      capital >= b.min_capital &&
      capital <= b.max_capital
  };

  const passed =
    Object.values(checks).filter(Boolean).length;

  let score =
    (checks.sector ? 30 : 0) +
    (checks.stage ? 25 : 0) +
    (checks.region ? 25 : 0) +
    (checks.capital ? 20 : 0);

  score = Math.max(
    0,
    Math.min(100, score)
  );

  let status =
    passed === 4
      ? "ELIGIBLE"
      : passed >= 2
      ? "PARTIAL"
      : "EXCLUDED";

  let probability =
    score >= 75
      ? "high"
      : score >= 50
      ? "medium"
      : "low";

  const missing = [];

  if (!checks.sector)
    missing.push("Settore non coerente");

  if (!checks.stage)
    missing.push("Fase non idonea");

  if (!checks.region)
    missing.push("Regione non valida");

  if (!checks.capital)
    missing.push("Capitale non compatibile");

  const upgrade_path =
    status === "ELIGIBLE"
      ? [
          "Preparare business plan",
          "Raccogliere documenti",
          "Inviare candidatura"
        ]
      : [
          "Adattare progetto al bando",
          "Colmare requisiti mancanti",
          "Rivalutare strategia"
        ];

  results.push({
    name: b.name,
    entity: b.entity,
    link: b.link,
    score,
    status,
    probability,
    requirements: b.requirements || [],
    missing,
    upgrade_path,
    coverage: b.coverage || 0
  });
}

// =========================
// CLASSIFICAZIONE
// =========================

const eligible =
  results.filter(
    r => r.status === "ELIGIBLE"
  );

const partial =
  results.filter(
    r => r.status === "PARTIAL"
  );

const excluded =
  results.filter(
    r => r.status === "EXCLUDED"
  );

eligible.sort(
  (a, b) => b.score - a.score
);

const top = eligible.slice(0, 5);

// =========================
// FINANCING ESTIMATE
// =========================

const maxFund = top.length
  ? Math.max(
      ...top.map(
        b => b.coverage * 500000
      )
    )
  : 20000;

const conservative =
  Math.round(maxFund * 0.30);

const realistic =
  Math.round(maxFund * 0.50);

const optimistic =
  Math.round(maxFund * 0.75);

// =========================
// RESPONSE
// =========================

return {
  statusCode: 200,

  headers: {
    "Content-Type":
      "application/json",
    "Access-Control-Allow-Origin":
      "*"
  },

  body: JSON.stringify({
    version: "V12",

    business_summary:
      `Analisi V12 per ${sector}`,

    eligible,
    partial,
    excluded,

    funding_opportunities: top,

    funding_estimate: {
      conservative,
      realistic,
      optimistic
    },

    overall_score:
      top.length
        ? top[0].score
        : 10,

    next_action:
      top.length
        ? `Procedi con ${top[0].name}`
        : "Nessun bando idoneo: rivedere strategia"
  })
};
```

} catch (err) {

```
console.log(
  "V12 ERROR:",
  err
);

return {
  statusCode: 500,

  body: JSON.stringify({
    error:
      err.message ||
      "Unknown error"
  })
};
```

}
};
