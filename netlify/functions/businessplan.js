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
        body: JSON.stringify({
          error: "Descrizione progetto mancante"
        })
      };
    }

    // API Key
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "OPENAI_API_KEY non trovata"
        })
      };
    }

    const prompt = `
Genera un BUSINESS PLAN PROFESSIONALE COMPLETO in italiano.

DATI DEL PROGETTO

Nome progetto:
${projectName}

Descrizione idea:
${idea}

Settore:
${sector}

Fase progetto:
${stage}

Budget indicativo:
${budget}

Regione:
${region}

IMPORTANTE:

Non limitarti a descrivere l'idea.

Comportati come:
- incubatore startup
- advisor per finanziamenti
- consulente business plan

Genera SEMPRE le seguenti sezioni.

# 1. EXECUTIVE SUMMARY
Sintesi professionale del progetto.

# 2. PROBLEMA
Quale problema risolve e perché è rilevante.

# 3. SOLUZIONE
Descrizione dettagliata della soluzione proposta.

# 4. ANALISI DEL MERCATO
- clienti target
- dimensione potenziale
- trend di mercato
- opportunità

# 5. ANALISI COMPETITIVA
- competitor diretti
- competitor indiretti
- vantaggi competitivi

# 6. MODELLO DI BUSINESS
- come genera ricavi
- flussi di entrata
- strategia prezzi

# 7. TEAM IDEALE
Indica le figure professionali necessarie.

# 8. PIANO OPERATIVO
Piano dei primi 12 mesi.

# 9. BUDGET DI AVVIO
Fornisci una tabella con stime realistiche.

Includi:
- sviluppo
- marketing
- amministrazione
- legale
- personale
- altri costi

e totale finale.

# 10. FABBISOGNO FINANZIARIO
Indica:
- capitale minimo
- capitale consigliato
- liquidità iniziale

# 11. FONTI DI FINANZIAMENTO POTENZIALI

Valuta:
- contributi pubblici
- finanziamenti agevolati
- investitori
- crowdfunding
- incubatori

Per ogni fonte spiega perché potrebbe essere adatta.

# 12. VALUTAZIONE DELLA FINANZIABILITÀ

Assegna un punteggio da 0 a 100 a:

- innovazione
- scalabilità
- sostenibilità economica
- finanziabilità

Spiega il motivo.

# 13. ROADMAP 12 MESI

Dividi in:
- mesi 1-3
- mesi 4-6
- mesi 7-9
- mesi 10-12

# 14. RISCHI PRINCIPALI

Elenca i principali rischi e come ridurli.

# 15. PROSSIMA AZIONE

Concludi SEMPRE con:

"AZIONE IMMEDIATA CONSIGLIATA"

e indica la singola azione più importante da fare subito.
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
              content:
                "Sei TaxCopilot Business Planner. Sei un incubatore startup, advisor strategico e consulente per la pianificazione imprenditoriale."
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
        statusCode: response.status,
        body: JSON.stringify({
          error: "OpenAI API error",
          details: data
        })
      };
    }

    const result =
      data?.choices?.[0]?.message?.content ||
      "Nessun risultato generato";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        result
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