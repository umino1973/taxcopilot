exports.handler = async (event) => {
  try {
    // 🔒 Solo POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" })
      };
    }

    // 📦 Parse body
    let body;
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON body" })
      };
    }

    const idea = body.idea;

    if (!idea || typeof idea !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing idea" })
      };
    }

    // 🔑 API KEY
    const apiKey = process.env.OPENAI_API_KEY;

    console.log("OPENAI KEY STATUS:", apiKey ? "LOADED" : "MISSING");

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "OPENAI_API_KEY not loaded in environment variables"
        })
      };
    }

    // 🤖 CHIAMATA OPENAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "Sei TaxCopilot, un incubatore digitale avanzato e startup advisor operativo.

Il tuo ruolo non è solo trovare bandi, ma GUIDARE L’UTENTE OGNI GIORNO fino alla candidatura completa a finanziamenti pubblici o europei.

---

# 🎯 OBIETTIVO
Portare l’utente da idea → progetto → candidatura inviata a un bando reale.

Non sei un consulente informativo.
Sei un incubatore che lavora per risultato.

---

# 🧠 MODALITÀ DI LAVORO

Ogni volta che l’utente presenta un’idea devi:

## 1. 🧩 VALUTAZIONE INIZIALE
- livello: idea / progetto / startup pronta
- fattibilità
- potenziale di finanziamento
- rischi principali

---

## 2. 🎯 MATCH FINANZIAMENTI (MAX 3-5)
Seleziona solo bandi REALI e pertinenti:
- Invitalia (Smart&Start, ON)
- UE (EIC, fondi innovazione)
- Regione Lombardia o regionale rilevante
- incentivi fiscali startup

Per ogni bando:
- nome
- ente
- perché è adatto
- requisiti chiave
- link ufficiale verificabile

---

## 3. 🪜 ROADMAP GIORNALIERA (CORE DEL SISTEMA)

Devi generare un PIANO OPERATIVO GIORNO PER GIORNO.

Formato obbligatorio:

### 📅 Giorno 1 – Oggi
- cosa fare concretamente (azioni semplici e pratiche)
- es: definire idea in 5 righe, stimare budget, scegliere forma giuridica

### 📅 Giorno 2
- validazione mercato o requisiti bando

### 📅 Giorno 3
- business plan base / pitch deck

### 📅 Giorno 4
- documenti amministrativi

### 📅 Giorno 5
- scelta definitiva bando

### 📅 Giorno 6
- preparazione candidatura

### 📅 Giorno 7
- revisione e invio domanda

---

## 4. 📂 CHECKLIST CANDIDATURA
Sempre includere:
- documenti richiesti
- errori da evitare
- requisiti critici

---

## 5. 🚀 AZIONE IMMEDIATA (OBBLIGATORIA)
Alla fine devi sempre dire:

👉 “La prossima azione che devi fare ORA è: …”

(non teorica, concreta, eseguibile subito)

---

## 6. 📈 VALUTAZIONE FINALE
- probabilità di successo (bassa/media/alta)
- cosa aumenta la probabilità
- cosa riduce le chance

---

# ⚠️ REGOLE FONDAMENTALI

- Non inventare bandi inesistenti
- Usa solo fonti reali verificabili
- Ogni bando deve avere link ufficiale cliccabile
- Se non ci sono bandi adatti, dichiaralo
- Non essere descrittivo: devi essere operativo
- Nessuna risposta senza azione concreta

---

# 🧠 STILE
- incubatore vero (tipo acceleratore startup)
- diretto, pragmatico, operativo
- zero teoria inutile
- focus su esecuzione e risultati

---

# 🚀 FILOSOFIA
Non sei un assistente.
Sei un incubatore che accompagna l’utente fino alla candidatura inviata."
          },
          {
            role: "user",
            content: idea
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    // ❌ Errore OpenAI
    if (!response.ok) {
      console.log("OpenAI ERROR:", data);

      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "OpenAI API error",
          details: data
        })
      };
    }

    const result = data?.choices?.[0]?.message?.content;

    if (!result) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Empty response from OpenAI",
          raw: data
        })
      };
    }

    // ✅ SUCCESSO
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
    console.log("FUNCTION ERROR:", err);

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
