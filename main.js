const WEAPONS = {
  smoothbore: {
    speed: 1.5,
    damage: 2,
    reloadSpeed: 10,
    loadedItem: "Wood Crossbow Charged",
    unloadedItem: "Wood Crossbow",
  },

  rifle: {
    speed: 3,
    damage: 4,
    reloadSpeed: 8,
    loadedItem: "Stone Crossbow Charged",
    unloadedItem: "Stone Crossbow",
  },
};

const gameState = {
  gameStarted: false,
  players: {},
  teams: {
    british: [],
    french: [],
  },
};

function getPlayer(id) {
  return gameState.players[id];
}

onPlayerJoin = (id) => {
  gameState.players[id] = {
    role: "regular",
    team: "french",
    currentQteItem: null,
    currentWeapon: null,
    weaponSlot: null,
  };

  gameState.teams.french.push(id);
};

onPlayerAttemptAltAction = (id) => {
  if (api.hasActiveQTE(id)) return "preventAction";

  const player = getPlayer(id);
  if (!player) return "preventAction";

  const item = api.getHeldItem(id);
  const attrs = item?.attributes?.customAttributes;

  if (!attrs) return "preventAction";

  const weaponName = attrs["muskets/name"];
  const weapon = WEAPONS[weaponName];

  if (!weapon) return "preventAction";

  if (attrs["muskets/loaded"]) {
    fireWeapon(id, item, attrs, weapon);
  } else {
    startReloadQTE(id, item, weapon);
  }

  return "preventAction";
};

onPlayerFinishQTE = (id, qteId, succeed) => {
  const player = getPlayer(id);
  if (!player) return;

  if (succeed && player.currentQteItem) {
    const item = api.getItemSlot(id, player.weaponSlot);
    if (!item) return;

    const attrs = item.attributes?.customAttributes;
    if (!attrs) return;

    attrs["muskets/loaded"] = true;

    api.setItemSlot(
      id,
      player.weaponSlot,
      player.currentWeapon.loadedItem,
      1,
      item.attributes,
      true,
    );
  }

  player.currentQteItem = null;
  player.currentWeapon = null;
  player.weaponSlot = null;
};

function fireWeapon(id, item, attrs, weapon) {
  const slot = api.getSelectedInventorySlotI(id);

  attrs["muskets/loaded"] = false;

  api.setItemSlot(id, slot, weapon.unloadedItem, 1, item.attributes, true);

  const [x, y, z] = api.getPosition(id);
  const { dir } = api.getPlayerFacingInfo(id);

  api.attemptCreateThrowable(
    id,
    "Pebble",
    [x, y + 1.5, z],
    dir,
    weapon.speed,
    weapon.damage,
    0.5,
  );

  api.playParticleEffect({
    presetId: "lightGrayFirecrackerSmall",
    pos1: [x, y + 1, z],
    pos2: [x, y + 2, z],
  });
}

function startReloadQTE(id, item, weapon) {
  const player = getPlayer(id);

  const qteId = api.addQTE(id, {
    type: "progressBar",
    parameters: {
      progressStartValue: 10,
      progressDecreasePerTick: 0.5,
      progressPerClick: weapon.reloadSpeed,
      canFail: true,
      description: [{ str: "Load your musket!" }],
      clickIcon: "fa-solid fa-computer-mouse",
      scale: 1,
      rotation: 15,
    },
  });

  player.currentQteItem = item;
  player.currentWeapon = weapon;
  player.weaponSlot = api.getSelectedInventorySlotI(id);
}

function equipUniform(id) {
  const i = gameState.players[id];

  if (i.role === "regular") {
    api.setItemSlot(id, 46, "Gray Wood Helmet", 1);
  } else if (i.role === "captain") {
    api.setItemSlot(id, 46, "Gold Helmet", 1);
  } else if (i.role === "sharpshooter") {
    api.setItemSlot(id, 46, "Green Wood Helmet", 1);
  }

  if (i.team === "british") {
    api.setItemSlot(id, 47, "Red Wood Chestplate", 1);
    api.setItemSlot(id, 48, "Light Gray Wood Leggings", 1);
  } else if (i.team === "french") {
    api.setItemSlot(id, 47, "Blue Wood Chestplate", 1);
    api.setItemSlot(id, 49, "White Wood Leggings", 1);
  }

  api.setItemSlot(id, 50, "Black Wood Boots", 1);
}
