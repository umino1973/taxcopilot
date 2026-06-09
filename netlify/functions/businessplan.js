exports.handler = async (event) => {
  try {

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" })
      };
    }

    const body = JSON.parse(event.body || "{}");

    const {
      projectName = "",
      idea = "",
      sector = "",
      stage = "",
      budget = "",
      region = ""
    } = body;

    if (!idea) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing idea" })
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing API key" })
      };
    }

    const prompt = `
Sei un INCUBATORE DI STARTUP E FUNDING ADVISOR.

Devi produrre 2 cose:

========================
PARTE 1 - BUSINESS PLAN
========================

(usa struttura già nota: executive, mercato, business model, ecc.)

========================
PARTE 2 - BANDI E FINANZIAMENTI REALI
========================

Devi cercare e suggerire SOLO opportunità realistiche come:

- Invitalia (Smart&Start, ON)
- Bandi Regione Lombardia
- Programmi UE (EIC Accelerator, Horizon Europe)
- Incentivi startup innovative Italia

Per OGNI bando devi dare:

- Nome bando
- Ente
- Link ufficiale (obbligatorio)
- Perché è compatibile con l’idea
- Requisiti principali
- Scadenza se nota (altrimenti "aperta")

========================
PARTE 3 - MATCH SCORE
========================

Assegna punteggio 0–100:

- compatibilità idea/bando
- probabilità di accesso

Spiega in 3 righe

========================
PARTE 4 - ROADMAP CANDIDATURA

Step operativi:

- documenti necessari
- cosa fare oggi
- cosa fare in 7 giorni
- cosa fare in 30 giorni
- errori da evitare

========================

IDEA:
${idea}

SETTORE:
${sector}

STAGE:
${stage}

BUDGET:
${budget}

REGIONE:
${region}

IMPORTANTE:
- Non inventare bandi falsi
- Se non sei sicuro, scrivi "nessun bando certo trovato"
- Usa linguaggio operativo, non teorico
`;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
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
              content: "Sei un incubatore startup specializzato in finanziamenti pubblici e privati."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.6
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify(data)
      };
    }

    const result = data?.choices?.[0]?.message?.content;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ result })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: err.message })
    };
  }
};
