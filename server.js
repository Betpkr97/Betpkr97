import express from "express";
const app = express();
app.use(express.json());
app.use(express.static("."));

// ------------------- CHATBOT -------------------
function getBotReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes("hi") || m.includes("hello") || m.includes("salam") || m.includes("hey")) {
    return "Assalam-o-alaikum! 😊 Main BETPKR AI hoon. Pochiye: Dice, Slot, Crash, Deposit, Withdraw, Balance, Referral.";
  }
  if (m.includes("dice") || m.includes("pasa")) {
    return "🎲 Dice Game: 1 se 6 tak prediction lagayein. Agar sahi ho toh 5x payout milega! Bet 1 se 5000 tak laga sakte hain.";
  }
  if (m.includes("slot") || m.includes("jili") || m.includes("spin")) {
    return "🎰 Slot Machine: 3 reels spin hoti hain. Agar teeno same aayein toh 5x se 20x tak multiplier milta hai!";
  }
  if (m.includes("crash") || m.includes("aviator") || m.includes("multiplier")) {
    return "✈️ Crash Game: Multiplier barhta rehta hai. Target multiplier set karein (1.1 se 10). Cash out kar ke jeet gaye!";
  }
  if (m.includes("balance") || m.includes("coin") || m.includes("kitna") || m.includes("paisa")) {
    return "🪙 Aapka current balance header aur account page par dikhta hai. Starting bonus 1000 coins milte hain!";
  }
  if (m.includes("deposit") || m.includes("jazzcash") || m.includes("easypaisa")) {
    return "💰 Deposit page par JazzCash / EasyPaisa select karein, channel choose karein, amount daalein aur 'Deposit Coins' click karein. (Demo mode)";
  }
  if (m.includes("withdraw") || m.includes("nikal") || m.includes("nikalna")) {
    return "💳 Withdraw page par E-wallet ya Bank account link karein, amount daalein (min 100) aur withdraw karein. (Demo mode)";
  }
  if (m.includes("refer") || m.includes("invite") || m.includes("dawat") || m.includes("commission")) {
    return "📢 Referral System: Share page se apna referral code copy karein. Har dawat par Rs 448 bonus + 0.55% commission!";
  }
  if (m.includes("vip") || m.includes("level") || m.includes("reward")) {
    return "🏅 VIP Levels: Total wagered amount ke hisaab se VIP badhta hai. VIP0 (0), VIP1 (1k), VIP2 (5k), VIP3 (20k), VIP4 (100k), VIP5 (500k).";
  }
  if (m.includes("help") || m.includes("madad") || m.includes("kaise") || m.includes("how")) {
    return "🤖 Main topics: 'Dice', 'Slot', 'Crash', 'Deposit', 'Withdraw', 'Balance', 'Referral', 'VIP'. Koi bhi topic likh kar poochhein!";
  }
  return "🤔 Samajh nahi aaya. Topics: Dice, Slot, Crash, Deposit, Withdraw, Balance, Referral, VIP.";
}

// ------------------- USERS (Memory mein) -------------------
const users = {};
let sessions = {};

app.post("/api/register", (req, res) => {
  const { username, password, confirm } = req.body;
  if (!username || !password || password !== confirm) {
    return res.status(400).json({ success: false, message: "Invalid data or password mismatch" });
  }
  if (users[username]) {
    return res.status(400).json({ success: false, message: "Username already exists" });
  }
  users[username] = {
    password,
    balance: 1000,
    nickname: username,
    joined: new Date().toISOString().split("T")[0],
    vip: 0,
    totalWagered: 0,
    bets: [],
    deposits: [],
    withdraws: []
  };
  res.json({ success: true, message: "Registered successfully! Starting bonus 1000 coins." });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(400).json({ success: false, message: "Invalid credentials" });
  }
  const sessionId = Math.random().toString(36).substring(2, 15);
  sessions[sessionId] = username;
  res.json({
    success: true,
    sessionId,
    user: {
      username,
      balance: user.balance,
      nickname: user.nickname,
      joined: user.joined,
      vip: user.vip,
      totalWagered: user.totalWagered
    }
  });
});

app.post("/api/me", (req, res) => {
  const { sessionId } = req.body;
  const username = sessions[sessionId];
  if (!username || !users[username]) {
    return res.status(401).json({ success: false });
  }
  const u = users[username];
  res.json({
    success: true,
    user: {
      username,
      balance: u.balance,
      nickname: u.nickname,
      joined: u.joined,
      vip: u.vip,
      totalWagered: u.totalWagered
    }
  });
});

app.post("/api/logout", (req, res) => {
  const { sessionId } = req.body;
  delete sessions[sessionId];
  res.json({ success: true });
});

// ------------------- VIP UPDATE -------------------
function updateVIP(user) {
  const w = user.totalWagered || 0;
  if (w >= 500000) user.vip = 5;
  else if (w >= 100000) user.vip = 4;
  else if (w >= 20000) user.vip = 3;
  else if (w >= 5000) user.vip = 2;
  else if (w >= 1000) user.vip = 1;
  else user.vip = 0;
}

// ------------------- DICE GAME -------------------
app.post("/api/game/dice", (req, res) => {
  const { sessionId, bet, prediction } = req.body;
  const username = sessions[sessionId];
  if (!username || !users[username]) {
    return res.status(401).json({ success: false, message: "Login required" });
  }
  if (bet < 1 || bet > 5000) {
    return res.status(400).json({ success: false, message: "Bet 1-5000" });
  }
  if (prediction < 1 || prediction > 6) {
    return res.status(400).json({ success: false, message: "Prediction 1-6" });
  }
  const user = users[username];
  if (bet > user.balance) {
    return res.status(400).json({ success: false, message: "Insufficient balance" });
  }

  const roll = Math.floor(Math.random() * 6) + 1;
  const win = roll === prediction;
  let payout = 0;
  if (win) {
    payout = bet * 5;
    user.balance += payout;
  } else {
    user.balance -= bet;
  }
  user.totalWagered += bet;
  updateVIP(user);
  user.bets.push({
    game: "dice",
    bet,
    roll,
    prediction,
    win,
    profit: win ? payout - bet : -bet,
    balance: user.balance,
    date: new Date().toISOString()
  });

  res.json({
    success: true,
    roll,
    win,
    payout: win ? payout : 0,
    newBalance: user.balance,
    message: win ? `🎉 Jeet gaye! ${payout} coins mile!` : `😞 Haar gaye. ${bet} coins gaye.`
  });
});

// ------------------- SLOT GAME -------------------
const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
app.post("/api/game/slot", (req, res) => {
  const { sessionId, bet } = req.body;
  const username = sessions[sessionId];
  if (!username || !users[username]) {
    return res.status(401).json({ success: false, message: "Login required" });
  }
  if (bet < 1 || bet > 10000) {
    return res.status(400).json({ success: false, message: "Bet 1-10000" });
  }
  const user = users[username];
  if (bet > user.balance) {
    return res.status(400).json({ success: false, message: "Insufficient balance" });
  }

  const reels = [
    SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
    SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
    SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
  ];
  let multiplier = 0;
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    if (reels[0] === '7️⃣') multiplier = 20;
    else if (reels[0] === '💎') multiplier = 15;
    else if (reels[0] === '🔔') multiplier = 10;
    else multiplier = 5;
  } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
    multiplier = 2;
  }
  const winAmount = bet * multiplier;
  if (multiplier > 0) {
    user.balance += winAmount;
  } else {
    user.balance -= bet;
  }
  user.totalWagered += bet;
  updateVIP(user);
  user.bets.push({
    game: "slot",
    bet,
    result: reels.join(" "),
    multiplier,
    profit: multiplier > 0 ? winAmount - bet : -bet,
    balance: user.balance,
    date: new Date().toISOString()
  });

  res.json({
    success: true,
    reels,
    multiplier,
    winAmount,
    newBalance: user.balance,
    profit: multiplier > 0 ? winAmount - bet : -bet
  });
});

// ------------------- CRASH GAME -------------------
app.post("/api/game/crash", (req, res) => {
  const { sessionId, bet, cashOutMultiplier } = req.body;
  const username = sessions[sessionId];
  if (!username || !users[username]) {
    return res.status(401).json({ success: false, message: "Login required" });
  }
  if (bet < 1 || bet > 5000) {
    return res.status(400).json({ success: false, message: "Bet 1-5000" });
  }
  const user = users[username];
  if (bet > user.balance) {
    return res.status(400).json({ success: false, message: "Insufficient balance" });
  }

  const crashPoint = Math.floor((Math.random() * 90 + 10)) / 10;
  let win = false;
  let profit = 0;
  if (cashOutMultiplier < crashPoint) {
    win = true;
    profit = bet * cashOutMultiplier - bet;
    user.balance += bet * cashOutMultiplier;
  } else {
    profit = -bet;
    user.balance -= bet;
  }
  user.totalWagered += bet;
  updateVIP(user);
  user.bets.push({
    game: "crash",
    bet,
    crashPoint,
    cashOut: cashOutMultiplier,
    win,
    profit,
    balance: user.balance,
    date: new Date().toISOString()
  });

  res.json({
    success: true,
    crashPoint,
    win,
    profit,
    newBalance: user.balance
  });
});

// ------------------- DEPOSIT -------------------
app.post("/api/deposit", (req, res) => {
  const { sessionId, amount, channel } = req.body;
  const username = sessions[sessionId];
  if (!username || !users[username]) {
    return res.status(401).json({ success: false });
  }
  const user = users[username];
  user.balance += amount;
  user.deposits.push({ amount, channel, date: new Date().toISOString() });
  res.json({ success: true, newBalance: user.balance, message: `${amount} coins added via ${channel || "Demo"}` });
});

// ------------------- WITHDRAW -------------------
app.post("/api/withdraw", (req, res) => {
  const { sessionId, amount, method } = req.body;
  const username = sessions[sessionId];
  if (!username || !users[username]) {
    return res.status(401).json({ success: false });
  }
  const user = users[username];
  if (amount > user.balance) {
    return res.status(400).json({ success: false, message: "Insufficient balance" });
  }
  user.balance -= amount;
  user.withdraws.push({ amount, method, date: new Date().toISOString() });
  res.json({ success: true, newBalance: user.balance, message: `${amount} withdrawn via ${method || "Demo"}` });
});

// ------------------- RECORDS -------------------
app.post("/api/records/bets", (req, res) => {
  const { sessionId } = req.body;
  const username = sessions[sessionId];
  if (!username || !users[username]) {
    return res.status(401).json({ success: false });
  }
  res.json({ success: true, records: users[username].bets });
});

app.post("/api/records/deposits", (req, res) => {
  const { sessionId } = req.body;
  const username = sessions[sessionId];
  if (!username || !users[username]) {
    return res.status(401).json({ success: false });
  }
  res.json({ success: true, records: users[username].deposits });
});

app.post("/api/records/withdraws", (req, res) => {
  const { sessionId } = req.body;
  const username = sessions[sessionId];
  if (!username || !users[username]) {
    return res.status(401).json({ success: false });
  }
  res.json({ success: true, records: users[username].withdraws });
});

// ------------------- CHAT ROUTE -------------------
app.post("/api/chat", (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) {
    return res.status(400).json({ reply: "Kuch likh kar poochhein 😊" });
  }
  const reply = getBotReply(message);
  res.json({ reply });
});

// ------------------- START SERVER -------------------
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 BETPKR running on port ${port}`));
