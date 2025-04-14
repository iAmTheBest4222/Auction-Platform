const fallbackResponses = {
  keywords: {
    "bidding strategy": [
      "Consider these bidding strategies:\n1. Set a maximum budget beforehand\n2. Wait until near the auction end to bid\n3. Research item market value\n4. Watch similar items' final prices",
      "Tips for successful bidding:\n1. Start with a reasonable opening bid\n2. Don't get caught in bidding wars\n3. Use automatic bidding features wisely\n4. Keep track of multiple similar items",
    ],
    "item value": [
      "To determine item value:\n1. Check recent sale prices\n2. Consider item condition\n3. Research market demand\n4. Look for similar items currently listed",
      "Factors affecting item value:\n1. Brand and authenticity\n2. Condition and age\n3. Rarity and demand\n4. Historical sale data",
    ],
    "auction tips": [
      "General auction tips:\n1. Read item descriptions carefully\n2. Check seller ratings and reviews\n3. Understand shipping costs\n4. Know the platform's policies",
      "Success in auctions requires:\n1. Patience and research\n2. Setting clear budget limits\n3. Understanding timing strategy\n4. Knowing when to walk away",
    ],
    payment: [
      "Payment best practices:\n1. Use secure payment methods\n2. Keep payment receipts\n3. Understand refund policies\n4. Verify payment details",
      "Payment security tips:\n1. Use platform-approved methods\n2. Never share payment info directly\n3. Document all transactions\n4. Check for secure payment icons",
    ],
  },

  findBestMatch(message) {
    message = message.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    for (const [keyword, responses] of Object.entries(this.keywords)) {
      const score = this.calculateRelevance(message, keyword);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = responses;
      }
    }

    // Return a response if we have a decent match (threshold: 0.3)
    if (highestScore > 0.3 && bestMatch) {
      return bestMatch[Math.floor(Math.random() * bestMatch.length)];
    }

    // Default response if no good match found
    return "I apologize, but I can only provide basic assistance right now as the AI service is temporarily unavailable. I can help with general questions about bidding strategies, item values, auction tips, and payment methods. Please try again with a question about one of these topics.";
  },

  calculateRelevance(message, keyword) {
    // Simple relevance calculation based on keyword presence
    const words = message.split(" ");
    let score = 0;

    // Check for exact keyword match
    if (message.includes(keyword)) {
      score += 0.5;
    }

    // Check for individual word matches
    const keywordWords = keyword.split(" ");
    for (const word of words) {
      if (keywordWords.includes(word)) {
        score += 0.25;
      }
    }

    // Check for related terms
    const relatedTerms = {
      bidding: ["bid", "offer", "price", "amount"],
      value: ["worth", "price", "cost", "expensive", "cheap"],
      auction: ["bid", "sale", "selling", "buying"],
      payment: ["pay", "money", "transaction", "purchase"],
    };

    for (const [category, terms] of Object.entries(relatedTerms)) {
      if (keyword.includes(category)) {
        for (const term of terms) {
          if (message.includes(term)) {
            score += 0.15;
          }
        }
      }
    }

    return score;
  },
};

module.exports = fallbackResponses;
