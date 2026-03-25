const i = info.players[myId];

if (i.role === "regular") {
  api.setItemSlot(myId, 46, "Gray Wood Helmet", 1);
} else if (i.role === "captain") {
  api.setItemSlot(myId, 46, "Gold Helmet", 1);
} else if (i.role === "sharpshooter") {
  api.setItemSlot(myId, 46, "Green Wood Helmet", 1);
}

if (i.team === "british") {
  api.setItemSlot(myId, 47, "Red Wood Chestplate", 1);
  api.setItemSlot(myId, 48, "Light Gray Wood Leggings", 1);
} else {
  api.setItemSlot(myId, 47, "Blue Wood Chestplate", 1);
  api.setItemSlot(myId, 49, "White Wood Leggings", 1);
}

api.setItemSlot(myId, 50, "Black Wood Boots", 1);
