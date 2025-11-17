// backend/routes/library.js
const express = require('express');
const router = express.Router();

// TEMP demo data – strategy guides
const demoData = [
  {
    guideId: 'demo-1',
    gameTitle: 'Elden Ring',
    title: 'How to beat Malenia',
    content: "Beating Malenia, Blade of Miquella, in *Elden Ring* is one of the toughest challenges in the game, requiring patience, skill, and a solid strategy. Her attacks are fast, powerful, and she has the ability to heal with every hit she lands, making every mistake costly. The key to success lies in managing her aggressive phases while dealing enough damage to stagger her. It's essential to dodge her attacks with precision, especially during her second phase when she gains access to more deadly moves. Using weapons with high poise damage or summons to distract her can make a significant difference, allowing you to land critical hits. Be sure to exploit her weaknesses—she’s particularly vulnerable to rot-based status effects, so using items like Scarlet Rot-inflicted weapons or incantations can turn the tide in your favor. Patience is the real weapon, though—taking your time and waiting for the right openings is often the best way to wear her down.",
    ratingCount: 0,
    ratingSum: 0,
    approved: true,
  },
  {
    guideId: 'demo-2',
    gameTitle: 'League of Legends',
    title: 'Beginner Midlane Tips',
    content: "Controlling the mid lane in *League of Legends* is all about map presence, wave management, and vision control. As the most central lane, mid has the most impact on the map, and a good mid laner can influence all areas of the game. First, you need to prioritize wave control: either push the wave to force the enemy mid laner to farm under tower or freeze the wave near your own turret for safe farming. Constantly monitor the enemy jungler’s position, as mid lane is often a prime target for ganks. Vision is crucial—always keep the river and jungle entrances warded to avoid surprise attacks, and try to clear enemy wards when possible. Roaming is also a key part of mid lane control; if you push the wave early, look for opportunities to roam to other lanes or secure objectives like Dragon or Rift Herald. Finally, knowing when to be aggressive and when to play safe can make or break a game—timing your engages, using your abilities efficiently, and securing objectives around the mid lane can quickly snowball your advantage and give your team a massive boost.",
    ratingCount: 0,
    ratingSum: 0,
    approved: false,
  },

  {
    guideId: '2',
    title: 'How to Make Strength Builds',
    gameTitle: 'Elden Ring',
    content: "In *Elden Ring*, strength builds are all about raw power, heavy weapons, and overwhelming foes with devastating attacks. One of the best strength builds revolves around using colossal weapons like the **Giant-Crusher** or the **Ruins Greatsword**, which pack massive damage potential and can stagger even the toughest enemies. Pairing these weapons with a high vigor stat to withstand hits and endurance to manage your heavy gear load is key. Strength builds also benefit from the **Lion's Claw** or **Flame, Grant Me Strength** incantation to further boost damage output. Additionally, a great strategy is to combine heavy armor, such as the **Bull-Goat Set**, for maximum poise, allowing you to tank through attacks while delivering punishing blows. With proper stat distribution, focusing on Strength (around 50-60), Endurance, and Vigor, you can take down bosses and enemies with ease, turning yourself into an unstoppable force on the battlefield.",
    ratingSum: 0,
    ratingCount: 0,
    approved: true,
  },

  {
    guideId: '3',
    title: 'Renger Guide',
    gameTitle: 'League of Legends',
    content: "Rengar, the Pridestalker, is a high-mobility assassin jungler with incredible burst damage, perfect for players who love to leap onto enemies and take them out in an instant. His playstyle revolves around quickly clearing camps, getting fed, and then roaming to lanes to execute devastating ganks. For runes, **Conqueror** is the keystone of choice, providing sustained damage in extended fights, while **Triumph** and **Coup de Grace** help with healing and finishing off low-health targets. **Sudden Impact** synergizes well with his gap-closing abilities, and **Ravenous Hunter** gives him sustain from kills. Starting with **Emberknife** for extra burn damage and **Refillable Potion**, Rengar focuses on building core items like **Duskblade of Draktharr** for lethality and burst, **The Collector** for extra execution potential, and **Black Cleaver** for armor shredding. Boots can be **Mercury's Treads** or **Plated Steelcaps**, depending on the enemy team’s comp. In the jungle, start with **Red Buff**, then move to **Raptors** or **Krugs**, and aim to hit level 6 quickly to unlock his ultimate, **Thrill of the Hunt**, which grants invisibility and makes him a deadly ganker. His combo revolves around using his empowered **Q** after leaping in with **E** to root and burst the enemy. Timing your ultimate and managing your **Ferocity** are key to maximizing his damage. As the game progresses, items like **Lord Dominik’s Regards** and **Guardian Angel** help you shred through tanky enemies and stay alive for more resets. Rengar’s power lies in his ability to pick off isolated enemies, so focus on roaming and using **R** to ambush opponents when they’re overextended. With precise mechanics and good map awareness, Rengar can snowball into a terrifying late-game assassin, capable of wiping out key targets before they even know what hit them.",
    ratingCount: 0,
    ratingSum: 0,
    approved: true,
  },

  { 
    guideId: '4',
    title: 'Tank Rundown',
    gameTitle: 'Overwatch 2',
    content: "In *Overwatch 2*, tanks play a crucial role in controlling the battlefield, protecting teammates, and creating space for damage dealers. A solid tank player understands positioning, timing, and the unique abilities of each tank hero. For beginners, starting with heroes like **Reinhardt** or **Winston** is recommended due to their straightforward mechanics and strong presence. Reinhardt's barrier shield is essential for blocking incoming damage and allowing your team to push forward, while Winston's mobility lets you dive into enemy lines and disrupt their formation. Communication with your team is vital; coordinating ultimates and positioning can turn the tide of battle. Understanding when to engage or retreat based on your team's status and the enemy's composition is key to effective tank play. As you gain experience, experimenting with other tank heroes like **D.Va**, **Roadhog**, or **Sigma** will help you adapt to different team strategies and counter various threats. Remember, a great tank not only soaks up damage but also creates opportunities for their team to secure objectives and win fights.",
    ratingCount: 0,
    ratingSum: 0,
    approved: true,
  }

];

router.get('/search', (req, res) => {
  const { title } = req.query;
  const q = (title || '').toLowerCase();

  const filtered = demoData.filter((item) =>
    item.gameTitle.toLowerCase().includes(q)
  );

  res.json({ data: filtered });
});

module.exports = router;
