async function run() {

  const output = document.getElementById("output");

  output.innerHTML = "<div class='card'>⏳ Analisi AI in corso...</div>";

  const res = await fetch("/.netlify/functions/businessplan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idea: idea.value,
      sector: sector.value,
      stage: stage.value,
      region: region.value,
      capital: capital.value
    })
  });

  const data = await res.json();

  let html = "";

  // =========================
  // 🧠 DIAGNOSI
  // =========================
  html += `<div class="card">
    <h2>🧠 Diagnosi</h2>
    <p>${data.diagnosis}</p>
  </div>`;

  // =========================
  // 🎯 STRATEGIA
  // =========================
  html += `<div class="card">
    <h2>🎯 Strategia</h2>
    <p>${data.strategy}</p>
  </div>`;

  // =========================
  // ⚠️ RISCHI
  // =========================
  html += `<div class="card">
    <h2>⚠️ Rischi</h2>
    <ul>
      ${data.risks.map(r => `<li>${r}</li>`).join("")}
    </ul>
  </div>`;

  // =========================
  // 🧭 PIANO
  // =========================
  html += `<div class="card">
    <h2>🧭 Piano operativo</h2>
    <ul>
      ${data.plan.map(p => `<li>${p}</li>`).join("")}
    </ul>
  </div>`;

  // =========================
  // 💣 DECISIONE FINALE
  // =========================
  html += `<div class="card">
    <h2>💣 Raccomandazione finale</h2>
    <p>${data.finalAdvice}</p>
  </div>`;

  // =========================
  // 🏆 BEST MATCH
  // =========================
  html += `<div class="card">
    <h2>🏆 Miglior bando</h2>
    <p>${data.best_match.name}</p>
    <p>Score: ${data.best_match.score}/100</p>
  </div>`;

  output.innerHTML = html;
}
