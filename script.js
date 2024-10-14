let deck = [];
let playerCards = [];
let communityBox1 = [];
let communityBox2 = [];
let anteBet = 0;
let playBet = 0;
let hasChosenCommunityBox = false;
let playerBalance = 10000; // Start with 10,000
 
// Update the player balance display
function updateBalanceDisplay() {
  document.getElementById(
    "balance"
  ).innerText = `$${playerBalance.toLocaleString()}`;
}
 
// Initialize the deck
function initializeDeck() {
  deck = [];
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push(`${rank}${suit}`);
    });
  });
}
 
// Shuffle the deck
function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}
 
// Deal the cards
function dealCards() {
  initializeDeck();
  shuffleDeck();
 
  playerCards = deck.splice(0, 3);
  communityBox1 = deck.splice(0, 2);
  communityBox2 = deck.splice(0, 2);
 
  displayPlayerCards();
  hideCommunityCards();
}
 
// Display the player’s cards
function displayPlayerCards() {
  const playerHandDiv = document.getElementById("player-hand");
  playerHandDiv.innerHTML = "";
 
  playerCards.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.innerText = card;
    playerHandDiv.appendChild(cardDiv);
  });
}
 
// Hide the community cards
function hideCommunityCards() {
  const box1Div = document.getElementById("community-box1");
  const box2Div = document.getElementById("community-box2");
  box1Div.innerHTML = '<div class="card">?</div><div class="card">?</div>';
  box2Div.innerHTML = '<div class="card">?</div><div class="card">?</div>';
}
 
// Reveal the community cards
function revealCommunityCards() {
  const box1Div = document.getElementById("community-box1");
  const box2Div = document.getElementById("community-box2");
 
  box1Div.innerHTML = "";
  box2Div.innerHTML = "";
 
  communityBox1.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.innerText = card;
    box1Div.appendChild(cardDiv);
  });
 
  communityBox2.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.innerText = card;
    box2Div.appendChild(cardDiv);
  });
 
  // Show instruction to select a community box
  document.getElementById("result").innerHTML = "Select a community box!";
 
  // Add click events to the entire community box container
  document.getElementById("box1-container").onclick = function () {
    if (!hasChosenCommunityBox) {
      evaluateHand(communityBox1);
      hasChosenCommunityBox = true;
    }
  };
  document.getElementById("box2-container").onclick = function () {
    if (!hasChosenCommunityBox) {
      evaluateHand(communityBox2);
      hasChosenCommunityBox = true;
    }
  };
}
 
// Place the ante bet
function placeAnte() {
  anteBet = parseInt(document.getElementById("ante-bet").value);
  if (anteBet > 0 && anteBet <= playerBalance) {
    playerBalance -= anteBet; // Deduct ante bet
    updateBalanceDisplay();
    document.getElementById("play-bet-section").style.display = "block";
    dealCards();
  } else {
    alert("Please place a valid Ante Bet (within your balance).");
  }
}
 
// Place the play bet
function placePlayBet() {
  playBet = parseInt(document.getElementById("play-bet").value);
  if (
    playBet >= anteBet &&
    playBet <= 5 * anteBet &&
    playBet <= playerBalance
  ) {
    playerBalance -= playBet; // Deduct play bet
    updateBalanceDisplay();
    hasChosenCommunityBox = false; // Reset for a new round
    revealCommunityCards(); // Reveal community cards and allow selection
  } else {
    alert(
      "Play bet must be between 1x and 5x your ante bet, and within your balance."
    );
  }
}
 
// Handle folding
function fold() {
  // The player folds and forfeits their ante bet
  document.getElementById("result").innerHTML =
    "You folded. Ante bet forfeited.";
  setTimeout(resetGame, 3000); // Reset game after 3 seconds
}
 
// Evaluate the player’s hand
function evaluateHand(selectedCommunityCards) {
  const hand = [...playerCards, ...selectedCommunityCards];
  const result = checkHand(hand);
  calculatePayout(result);
}
 
// Check the hand and return the result based on poker hand rankings
function checkHand(hand) {
  hand.sort((a, b) => getCardRankValue(b) - getCardRankValue(a));
  const flush = isFlush(hand);
  const straight = isStraight(hand);
  const rankCounts = getRankCounts(hand);
 
  if (flush && straight && hand[0][0] === "A")
    return { handName: "Royal Flush", payout: 500 };
  if (flush && straight) return { handName: "Straight Flush", payout: 150 };
  if (rankCounts.maxCount === 4)
    return { handName: "Four of a Kind", payout: 45 };
  if (rankCounts.maxCount === 3 && rankCounts.secondMaxCount === 2)
    return { handName: "Full House", payout: 15 };
  if (flush) return { handName: "Flush", payout: 10 };
  if (straight) return { handName: "Straight", payout: 8 };
  if (rankCounts.maxCount === 3)
    return { handName: "Three of a Kind", payout: 4 };
  if (rankCounts.maxCount === 2 && rankCounts.secondMaxCount === 2)
    return { handName: "Two Pairs", payout: 2 };
  if (rankCounts.maxCount === 2 && rankCounts.highPairRank >= 11)
    return { handName: "Pair of Jacks or Better", payout: 1 };
  if (
    rankCounts.maxCount === 2 &&
    rankCounts.highPairRank >= 6 &&
    rankCounts.highPairRank <= 10
  )
    return { handName: "Push", payout: 0 };
 
  return { handName: "No Qualifying Hand", payout: -1 };
}
 
// Get the rank value of a card
function getCardRankValue(card) {
  const rank = card.slice(0, -1); // Fixed rank extraction error
  const values = {
    A: 14,
    K: 13,
    Q: 12,
    J: 11,
    10: 10,
    9: 9,
    8: 8,
    7: 7,
    6: 6,
    5: 5,
    4: 4,
    3: 3,
    2: 2,
  };
  return values[rank] || 0;
}
 
// Check if all cards in the hand have the same suit (Flush)
function isFlush(hand) {
  const suit = hand[0].slice(-1);
  return hand.every((card) => card.slice(-1) === suit);
}
 
// Check if the hand is a Straight
function isStraight(hand) {
  const sortedValues = hand.map(getCardRankValue).sort((a, b) => b - a);
  for (let i = 0; i < sortedValues.length - 1; i++) {
    if (sortedValues[i] - sortedValues[i + 1] !== 1) {
      return false;
    }
  }
  return true;
}
 
// Get the counts of each rank in the hand
function getRankCounts(hand) {
  const counts = {};
  hand.forEach((card) => {
    const rank = getCardRankValue(card);
    counts[rank] = (counts[rank] || 0) + 1;
  });
 
  const sortedCounts = Object.values(counts).sort((a, b) => b - a);
  const maxCount = sortedCounts[0];
  const secondMaxCount = sortedCounts[1] || 0;
 
  const highPairRank = Object.keys(counts).reduce(
    (acc, rank) =>
      counts[rank] === 2 && parseInt(rank) > acc ? parseInt(rank) : acc,
    0
  );
 
  return { maxCount, secondMaxCount, highPairRank };
}
 
// Calculate and display the payout
function calculatePayout(result) {
  const resultDiv = document.getElementById("result");
  if (result.payout > 0) {
    const antePayout = anteBet * result.payout;
    const playPayout = playBet; // Play bet is always 1:1
 
    // Payouts are added back to the balance
    playerBalance += anteBet + antePayout + playBet + playPayout;
 
    resultDiv.innerHTML = `You won with a ${result.handName}! Ante Bet Payout: ${result.payout}:1. Play Bet Payout: 1:1.`;
  } else if (result.handName === "Push") {
    playerBalance += anteBet + playBet; // Push: return ante and play bets
    resultDiv.innerHTML = `It's a push. You get your Ante Bet and Play Bet back.`;
  } else {
    resultDiv.innerHTML = `You lost. No payout.`;
  }
 
  updateBalanceDisplay(); // Update the balance display
 
  // Wait for a few seconds before resetting the game to allow the player to see the result
  setTimeout(resetGame, 5000);
}
 
// Reset the game
function resetGame() {
  playerCards = [];
  communityBox1 = [];
  communityBox2 = [];
  hasChosenCommunityBox = false;
 
  document.getElementById("player-hand").innerHTML = "";
  document.getElementById("community-box1").innerHTML =
    '<div class="card">?</div><div class="card">?</div>';
  document.getElementById("community-box2").innerHTML =
    '<div class="card">?</div><div class="card">?</div>';
 
  document.getElementById("ante-bet").value = "";
  document.getElementById("play-bet").value = "";
 
  document.getElementById("play-bet-section").style.display = "none";
 
  document.getElementById("result").innerHTML = "";
}
