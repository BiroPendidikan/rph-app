module.exports = async (req, res) => {
  // Hanya benarkan POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { type, context } = req.body;

    let promptText = "";
    if (type === 'objectives') promptText = `Konteks: ${context}. Hasilkan 2 objektif. Kunci: "objectives" (array of strings).`;
    else if (type === 'activities') promptText = `Konteks: ${context}. Hasilkan 5 langkah PAK21. Kunci: "activities" (array of strings).`;
    else if (type === 'success') promptText = `Konteks: ${context}. Hasilkan 2 kriteria kejayaan. Kunci: "successCriteria" (array of strings).`;
    else if (type === 'reflection') promptText = `Konteks: ${context}. Hasilkan 1 ayat refleksi. Kunci: "reflection" (string).`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` // Diambil terus dari Vercel
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Keluarkan JSON sahaja, tiada markdown." },
          { role: "user", content: promptText }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    // Bersihkan respons jika ada backticks
    let cleanJson = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Gagal menjana.' });
  }
};
