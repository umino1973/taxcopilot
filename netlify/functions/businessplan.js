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
Sei un FUNDING ENGINE per startup.

Il tuo compito è trasformare una idea in:

1. Business plan sintetico
2. Ricerca opportunità di finanziamento REALI
3. Matching con bandi pubblici e privati
4. Ranking opportunità

IMPORTANTE:
- NON inventare bandi inesistenti
- Usa solo programmi realmente esistenti in Italia/UE
- Se non sei sicuro, segnala incertezza

========================
INPUT
========================

Idea:
${idea}

Settore:
${sector}

Stage:
${stage}

Budget:
${budget}

Regione:
${region}

========================
OUTPUT OBBLIGATORIO
========================

## 1. BUSINESS SNAPSHOT
Sintesi idea + valore

## 2. PROFILO STARTUP
- tipo (innovativa / digitale / sociale)
- livello maturità
- scalabilità

## 3. BANDI E FINANZIAMENTI (TOP 3-5)

Per ogni bando:

- Nome bando
- Ente (Invitalia / UE / Regione / altro)
- Link ufficiale
- Compatibilità (0–100)
- Perché è adatto
- Requisiti principali
- Difficoltà (bassa/media/alta)

## 4. RANKING OPPORTUNITÀ

Ordina per probabilità di successo.

## 5. STRATEGIA DI ACCESSO

- cosa fare per primo
- documenti necessari
- errori da evitare
- tempistiche realistiche

## 6. PROSSIMO PASSO IMMEDIATO

Una sola azione concreta da fare ORA.
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
              content: "Sei un incubatore di startup specializzato in finanziamenti pubblici UE e italiani."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.5
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
