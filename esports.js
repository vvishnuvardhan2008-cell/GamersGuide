// backend/routes/esports.js
const express = require('express');
const router = express.Router();

// Temporary demo data for esports suggestions
const esportsSuggestions = [
  {
    gameId: 'mp-1',
    gameTitle: 'Valorant',
    tips: [
      "Communicate enemy positions using short, clear callouts.",
      "Don’t full-sprint around corners—always counter-strafe before shooting.",
      "Use your ult economy wisely — avoid wasting ults in lost rounds."
    ]
  },
  {
    gameId: 'mp-2',
    gameTitle: 'Fortnite',
    tips: [
      "Always maintain high ground — it wins the majority of fights.",
      "Farm early so you never run out of mats in late game.",
      "Third-party fights to pick up easy eliminations safely."
    ]
  },
  {
    gameId: 'mp-3',
    gameTitle: 'Apex Legends',
    tips: [
      "Use movement tech (bunny hop, wall bounce) to avoid being an easy target.",
      "Stick with your squad — isolated players get wiped instantly.",
      "Pick a balanced comp: mobility legend + support legend + recon legend."
    ]
  }
];

// Route: /esports/suggest?game=Valorant
router.get('/suggest', (req, res) => {
  const { game } = req.query;
  const q = (game || '').toLowerCase();

  // Find the game
  const result = esportsSuggestions.find(item =>
    item.gameTitle.toLowerCase().includes(q)
  );

  if (!result) {
    return res.json({
      message: "No suggestions found for that game.",
      tips: []
    });
  }

  res.json({
    game: result.gameTitle,
    tips: result.tips
  });
});

module.exports = router;
