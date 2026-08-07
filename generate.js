module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const { type, context } = req.body;
        let userPrompt = "";
        if (type === 'objectives') userPrompt = `Konteks: ${context}. Hasilkan 2 objektif. Kunci: "objectives" (array).`;
        else if (type === 'activities') userPrompt = `Konteks: ${context}. Hasilkan 5 langkah aktiviti PAK21. Kunci: "activities" (array).`;
        else if (type === 'success') userPrompt = `Konteks: ${context}. Hasilkan 2 kriteria kejayaan. Kunci: "successCriteria" (array).`;
        else if (type === 'reflection') userPrompt = `Konteks: ${context}. Hasilkan 1 ayat refleksi. Kunci: "reflection" (string).`;

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` },
            body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: "JSON sahaja, tiada markdown." }, { role: "user", content: userPrompt }], temperature: 0.7 })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        let jsonStr = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
        res.status(200).json(JSON.parse(jsonStr));
    } catch (error) { res.status(500).json({ error: 'Gagal menjana AI.' }); }
};