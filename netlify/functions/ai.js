exports.handler = async (event) => {
  try {

    // Solo POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({
          error: "Method Not Allowed"
        })
      };
    }

    // Parse body
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid JSON"
        })
      };
    }

    const idea = body.idea;

    if (!idea) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing idea"
        })
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "OPENAI_API_KEY missing"
        })
      };
    }

    const prompt = `
Sei TaxCopilot, un incubatore digitale.

Analizza l'idea imprenditoriale e restituisci:

1. Analisi dell'idea
2. Punti di forza
3. Criticità
4. Opportunità di mercato
5. Tipologia di business
6. Prime possibili fonti di finanziamento
7. Suggerimento operativo concreto

Idea:
${idea}
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
              content: "Sei TaxCopilot, incubatore startup e business advisor."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "OpenAI error",
          details: data
        })
      };
    }

    const result = data?.choices?.[0]?.message?.content;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        result: result || "Nessuna risposta"
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: err.message
      })
    };
  }
};