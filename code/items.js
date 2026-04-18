api.giveItem(myId, "Wood Crossbow", 1, {
  customDisplayName: "Smoothbore Musket",
  customDescription: "Your standard issue musket",
  customAttributes: {
    "muskets/name": "smoothbore",
    enchantmentTier: "Tier 3",
    enchantments: {
      Damage: 10,
      "Horizontal Knockback": 3,
    },
  },
});

api.giveItem(myId, "Stone Crossbow", 1, {
  customDisplayName: "Rifled Musket",
  customDescription: "Deals more ranged damage than smoothbores",
  customAttributes: {
    "muskets/name": "rifle",
    enchantmentTier: "Tier 4",
    enchantments: {
      Damage: 5,
      "Horizontal Knockback": 2,
    },
  },
});

api.giveItem(myId, "Gold Sword", 1, {
  customDisplayName: "Infantry Sabre",
  customDescription: "Main weapon of officers",
  customAttributes: {
    "muskets/name": "inf_sabre",
    enchantmentTier: "Tier 4",
  },
});

api.giveItem(myId, "Iron Sword", 1, {
  customDisplayName: "Cavalry Sabre",
  customDescription: "Main weapon of cavalry",
  customAttributes: {
    "muskets/name": "cav_sabre",
    enchantmentTier: "Tier 3",
    enchantments: {
      "Attack Speed": 2,
      "Horizontal Knockback": 4,
    },
  },
});

api.giveItem(myId, "Gray Paintball", 1, {
  customDisplayName: "Handgrenade",
  customDescription: "Throwable bombs that can disorient the enemy",
  customAttributes: {
    "muskets/name": "grenade",
  },
});

api.giveItem(myId, "Diamond Crossbow", 1, {
  customDisplayName: "4-lb Field Cannon",
  customDescription: "An excellent lightweight artillery gun that shoots roundshot along with smaller projectiles",
  customAttributes: {
    "muskets/name": "arty",
    enchantmentTier: "Tier 3",
  },
});

api.giveItem(myId, "Iron Crossbow", 1, {
  customDisplayName: "Flintlock Pistol",
  customDescription: "A very gentlemanly firearm",
  customAttributes: {
    "muskets/name": "pistol",
    enchantmentTier: "Tier 4",
  },
});
