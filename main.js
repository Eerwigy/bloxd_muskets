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
    soldier: "Gray Wood Helmet",
    grenadier: "Iron Helmet",
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
  morale: {
    british: 0,
    french: 0,
  },
};

function getPlayer(id) {
  return gameState.players[id];
}

onPlayerJoin = (id) => {
  api.clearInventory(id);

  gameState.players[id] = {
    role: "soldier",
    team: "french",
    morale: 100,
    currentWeapon: null,
    weaponSlot: null,
  };

  gameState.teams.french.push(id);
};

onPlayerLeave = (id) => {
  const player = gameState.players[id];
  if (!player) return;

  const teamArray = gameState.teams[player.team];
  if (teamArray) {
    const index = teamArray.indexOf(id);
    if (index !== -1) {
      teamArray.splice(index, 1);
    }
  }

  delete gameState.players[id];
};

tick = () => {
  const ids = api.getPlayerIds();

  let britishMorale = 0;
  let frenchMorale = 0;

  for (const id of ids) {
    const myPos = api.getPosition(id);
    const dists = [];

    for (const other of ids) {
      if (other === id) continue;

      const otherPos = api.getPosition(other);

      const distSq =
        (otherPos[0] - myPos[0]) ** 2 +
        (otherPos[1] - myPos[1]) ** 2 +
        (otherPos[2] - myPos[2]) ** 2;

      dists.push(distSq);
    }

    dists.sort((a, b) => a - b);

    const player = gameState.players[id];

    const d1 = dists[0] ?? Infinity;
    const d2 = dists[1] ?? Infinity;

    let proximity;

    if (d1 <= 9 && d2 <= 9) {
      proximity = 50;
    } else {
      const d = (d1 + d2) * 0.5;

      if (d >= 400) {
        proximity = 0;
      } else {
        proximity = ((Math.sqrt(d) - 3) / (20 - 3)) * 50;
      }
    }

    player.morale = proximity + api.getHealth(id) * 0.5;

    if (player.team === "french") {
      frenchMorale += player.morale;
    } else {
      britishMorale += player.morale;
    }

    api.setClientOption(
      id,
      "RightInfoText",
      `Bloxd Muskets🏹
      Made by Yervweigh

      Current Morale: ${Math.ceil(player.morale)}

      Teams Average Morale:
      🟦${gameState.morale.french} - ${gameState.morale.british}🟥

      Capture progress:
      🟦${0}% - ${0}%🟥
      `,
    );
  }

  gameState.morale.french = frenchMorale / gameState.teams.french.length || 0;
  gameState.morale.british =
    britishMorale / gameState.teams.british.length || 0;
};

onPlayerAttemptAltAction = (id) => {
  if (api.hasActiveQTE(id)) return "preventAction";

  const player = getPlayer(id);
  if (!player) return "preventAction";

  const item = api.getHeldItem(id);
  const attrs = item?.attributes?.customAttributes;

  if (!attrs) return "preventAction";

  const weaponName = attrs["muskets/name"];

  if (weaponName === "grenade") return;

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
