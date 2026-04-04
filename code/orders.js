api.giveItem(myId, "Blue Paintball", 1, {
  customDisplayName: "Advance Order",
  customDescription: "Order your troops to advance",
  customAttributes: {
    "muskets/name": "order/advance",
  },
});

api.giveItem(myId, "Red Paintball", 1, {
  customDisplayName: "Charge Order",
  customDescription: "Order your troops to charge",
  customAttributes: {
    "muskets/name": "order/charge",
  },
});

api.giveItem(myId, "Yellow Paintball", 1, {
  customDisplayName: "Hold Order",
  customDescription: "Order your troops to hold their position and shoot",
  customAttributes: {
    "muskets/name": "order/hold",
  },
});

api.giveItem(myId, "White Paintball", 1, {
  customDisplayName: "Fallback Order",
  customDescription: "Order your troops to fallback (retreat)",
  customAttributes: {
    "muskets/name": "order/fallback",
  },
});
