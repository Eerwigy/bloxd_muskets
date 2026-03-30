// Bloxd Muskets🏹
// Made by Yervweigh
//
// Licensed under Apache-2.0

const WEAPONS = {
  smoothbore: {
    speed: 1.5,
    damage: 3,
    reloadSpeed: 10,
    loadedItem: "Wood Crossbow Charged",
    unloadedItem: "Wood Crossbow",
    projectile: "Pebble",
    message: "Load your musket!",
  },

  rifle: {
    speed: 3,
    damage: 5,
    reloadSpeed: 8,
    loadedItem: "Stone Crossbow Charged",
    unloadedItem: "Stone Crossbow",
    projectile: "Pebble",
    message: "Load your musket!",
  },

  arty: {
    speed: 3,
    damage: 2,
    reloadSpeed: 3,
    loadedItem: "Diamond Crossbow Charged",
    unloadedItem: "Diamond Crossbow",
    projectile: "Fireball",
    message: "Load your cannon!",
  },
};

const UNIFORMS = {
  helmet: {
    soldier: "Gray Wood Helmet",
    grenadier: "Iron Helmet",
    sharpshooter: "Green Wood Helmet",
    artillery: "Cyan Wood Helmet",
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

var gameState = {
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
  capture: {
    british: 0,
    french: 0,
    neutral: 0,
  },
};

onPlayerJoin = (id) => {
  api.clearInventory(id);

  const frenchCount = gameState.teams.french.length;
  const britishCount = gameState.teams.british.length;

  let team;

  if (frenchCount < britishCount) {
    team = "french";
  } else if (britishCount < frenchCount) {
    team = "british";
  } else {
    team = Math.random() < 0.5 ? "french" : "british";
  }

  gameState.players[id] = {
    role: "soldier",
    team: team,
    morale: 100,
    currentWeapon: null,
    weaponSlot: null,
  };

  gameState.teams[team].push(id);
  equipUniform(id);
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
      const d = (Math.sqrt(d1) + Math.sqrt(d2)) * 0.5;

      if (d >= 20) {
        proximity = 0;
      } else {
        proximity = (1 - (d - 3) / (20 - 3)) * 50;
      }
    }

    player.morale = proximity + api.getHealth(id) * 0.5;

    let blocks = api.getBlockTypesPlayerStandingOn(id);
    let teamMsg;

    if (player.team === "french") {
      if (blocks.includes("Red Portal")) {
        gameState.capture.british += 0.01;
      }

      frenchMorale += player.morale;
      teamMsg = "🟦French";
    } else {
      if (blocks.includes("Blue Portal")) {
        gameState.capture.french += 0.01;
      }

      britishMorale += player.morale;
      teamMsg = "🟥British";
    }

    api.setClientOption(
      id,
      "RightInfoText",
      `Bloxd Muskets🏹
      Made by Yervweigh

      Your Team: ${teamMsg}

      Current Morale: ${Math.ceil(player.morale)}

      Teams Average Morale:
      🟦${Math.ceil(gameState.morale.french)} - ${Math.ceil(gameState.morale.british)}🟥

      Capture progress:
      🟦${Math.floor(gameState.capture.french)}% - ${Math.floor(gameState.capture.british)}%🟥
      `,
    );
  }

  gameState.morale.french =
    gameState.teams.french.length > 0
      ? frenchMorale / gameState.teams.french.length
      : 0;

  gameState.morale.british =
    gameState.teams.british.length > 0
      ? britishMorale / gameState.teams.british.length
      : 0;
};

onPlayerAttemptAltAction = (id, _x, _y, _z, blockName) => {
  if (api.hasActiveQTE(id)) return "preventAction";

  if (blockName.includes("Door")) return;

  const player = gameState.players[id];
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

onPlayerDamagingOtherPlayer = (attacker, damaged, _n, item) => {
  if (gameState.players[attacker].team == gameState.players[damaged].team) {
    return "preventDamage";
  }
};

onPlayerFinishQTE = (id, qteId, succeed) => {
  const player = gameState.players[id];
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
  const morale = gameState.players[id]?.morale;

  // 100 -> 1.5x, 0 -> 0.5x
  const moraleFactor = 0.5 + morale * 0.01;

  api.attemptCreateThrowable(
    id,
    weapon.projectile,
    [x, y + 1.5, z],
    dir,
    weapon.speed,
    weapon.damage * moraleFactor,
    0.5,
  );

  api.playParticleEffect({
    presetId: "lightGrayFirecrackerSmall",
    pos1: [x, y + 1, z],
    pos2: [x, y + 2, z],
  });
}

function startReloadQTE(id, item, weapon) {
  const player = gameState.players[id];

  // 100 -> 1.5x, 0 -> 0.5x
  const moraleFactor = 0.5 + player.morale * 0.01;

  const qteId = api.addQTE(id, {
    type: "progressBar",
    parameters: {
      progressStartValue: 10,
      progressDecreasePerTick: 0.5,
      progressPerClick: weapon.reloadSpeed * moraleFactor,
      canFail: true,
      description: [{ str: weapon.message }],
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
