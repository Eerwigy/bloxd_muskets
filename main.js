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

const UNIFORMS = {
  helmet: {
    regular: "Gray Wood Helmet",
    sharpshooter: "Green Wood Helmet",
    captain: "Gold Helmet",
  },
  chestplate: {
    british: "Red Wood Chestplate",
    french: "Blue Wood Chestplate",
  },
  leggings: {
    british: "Light Gray Wood Leggings",
    french: "White Wood Leggings",
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

  if (succeed && player.weaponSlot !== null) {
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

  player.currentWeapon = weapon;
  player.weaponSlot = api.getSelectedInventorySlotI(id);
}

function equipUniform(id) {
  const player = gameState.players[id];

  api.setItemSlot(id, 46, UNIFORMS.helmet[player.role], 1);
  api.setItemSlot(id, 47, UNIFORMS.chestplate[player.team], 1);
  api.setItemSlot(id, 49, UNIFORMS.leggings[player.team], 1);

  api.setItemSlot(id, 50, "Black Wood Boots", 1);
}
