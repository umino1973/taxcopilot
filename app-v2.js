async function generate(){

    const payload = {
        projectName: document.getElementById("projectName").value,
        idea: document.getElementById("idea").value,
        sector: document.getElementById("sector").value,
        stage: document.getElementById("stage").value,
        budget: document.getElementById("budget").value,
        region: document.getElementById("region").value
    };

    const resultDiv = document.getElementById("result");

    resultDiv.innerHTML = "⏳ Generazione business plan in corso...";

    try{

        const response = await fetch(
            "/.netlify/functions/businessplan",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        if(data.result){
            resultDiv.innerHTML = data.result;
        } else {
            resultDiv.innerHTML = "Errore: " + JSON.stringify(data);
        }

    } catch(err){
        resultDiv.innerHTML = "Errore: " + err.message;
    }
}