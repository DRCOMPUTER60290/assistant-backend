require('dotenv').config(); // doit être tout en haut

console.log('⛳ DEBUG .env ->', process.env.OPENAI_API_KEY ? '✅ Clé trouvée' : '❌ Clé MANQUANTE');

console.log('Clé API chargée :', process.env.OPENAI_API_KEY ? '✅ OK' : '❌ Manquante');

const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config(); // ✅ charger les variables d'abord

const app = express();
//  pour test local const port = 3001;
// test render
const port = process.env.PORT || 3001;

// ✅ Ces deux middlewares doivent venir avant les routes
app.use(cors());
app.use(express.json());


app.post('/api/generate-letter', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt manquant' });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("❌ Clé API non définie dans .env");
      return res.status(500).json({ error: 'Clé API manquante' });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant qui rédige des lettres administratives formelles en français."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erreur OpenAI :", data);
      return res.status(500).json({ error: data.error?.message || 'Erreur OpenAI' });
    }

    res.json({ content: data.choices[0].message.content });
  } catch (error) {
    console.error('❌ Erreur serveur Express :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
// test local
/* app.listen(port, () => {
  console.log(`✅ Serveur lancé sur http://192.168.1.51:${port}`);
});
*/
//test render 
app.listen(port, () => {
  console.log(`✅ Serveur lancé sur le port ${port}`);
});
