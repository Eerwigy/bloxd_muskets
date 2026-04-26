// Bloxd Muskets🏹
// Made by Yervweigh
// Licensed under Apache-2.0

// =================
// Constants
// =================

const TESTMODE = true;

const FRENCH_CAMP_POS = [1051.5, 51, 1012.5];
const BRITISH_CAMP_POS = [1049.5, 51, 1388.5];
const NEUTRAL_OBJ_POS = [1041.5, 51, 1212.5];

const ORDER_COOLDOWN = 15_000; // 15 seconds

const FIREARMS = {
  smoothbore: {
    speed: 1.5,
    damage: 3,
    reloadSpeed: 10,
    loadedItem: "Wood Crossbow Charged",
    unloadedItem: "Wood Crossbow",
    message: "Load your musket!",
  },

  rifle: {
    speed: 3,
    damage: 5,
    reloadSpeed: 8,
    loadedItem: "Stone Crossbow Charged",
    unloadedItem: "Stone Crossbow",
    message: "Load your musket!",
  },

  pistol: {
    speed: 1,
    damage: 3,
    reloadSpeed: 15,
    loadedItem: "Iron Crossbow Charged",
    unloadedItem: "Iron Crossbow",
    message: "Load your pistol!",
  },
};

const ARTY = {
  loadedItem: "Diamond Crossbow Charged",
  unloadedItem: "Diamond Crossbow",
};

const RECOIL = {
  smoothbore: 10,
  rifle: 10,
  pistol: 5,
  arty: 20,
};

const UNIFORMS = {
  slots: {
    helmet: 46,
    chestplate: 47,
    gauntlets: 48,
    leggings: 49,
    boots: 50,
  },

  defaults: {
    boots: "Black Wood Boots",
    gauntlets: "Air",
  },

  roles: {
    medic: {
      helmet: {
        british: "Red Wood Helmet",
        french: "Blue Wood Helmet",
      },
      chestplate: "White Wood Chestplate",
      gauntlets: "Brown Wood Gauntlets",
      leggings: "Brown Wood Leggings",
    },

    soldier: { helmet: "Gray Wood Helmet" },
    grenadier: { helmet: "Black Wood Helmet" },
    sharpshooter: { helmet: "Green Wood Helmet" },
    dragoon: { helmet: "Iron Helmet", gauntlets: "White Wood Gauntlets" },
    artillery: { helmet: "Cyan Wood Helmet" },
    captain: { helmet: "Gold Helmet" },
  },

  team: {
    chestplate: {
      british: "Red Wood Chestplate",
      french: "Blue Wood Chestplate",
    },
    leggings: {
      british: "Light Gray Wood Leggings",
      french: "White Wood Leggings",
    },
  },
};

const ROLE_MSG = {
  soldier: "🏹Musketeer",
  sharpshooter: "🎯Sharpshooter",
  artillery: "💥Artillery",
  dragoon: "🐴Cavalry",
  grenadier: "💣Grenadier",
  captain: "👑Captain",
  medic: "⚕️Surgeon",
};

const PALETTE = {
  british: "#ff2222",
  french: "#0069ff",
  info: "cyan",
  order: "orange",
  error: "red",
  null: "grey",
};

// =================
// Game State
// =================

var gameState = {
  tickn: 0,
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
  kills: {},
  deaths: {},
};

// =================
// Callbacks
// =================

onPlayerJoin = (id) => {
  api.clearInventory(id);

  gameState.players[id] = createPlayer({
    team: gameState.gameStarted ? "spectator" : null,
    morale: gameState.gameStarted ? null : 100,
  });

  api.setClientOption(id, "lobbyLeaderboardInfo", {
    name: { displayName: "Name", sortPriority: 0 },
    team: { displayName: "Team", sortPriority: 0 },
    role: { displayName: "Role", sortPriority: 0 },
    kills: { displayName: "Kills", sortPriority: 0 },
    deaths: { displayName: "Deaths", sortPriority: 0 },
    ratio: { displayName: "K/D Ratio", sortPriority: 0 },
  });

  api.sendMessage(id, "Welcome to Bloxd Muskets🏹", { color: PALETTE.info });
};

onPlayerLeave = (id) => {
  const player = gameState.players[id];
  if (!player) return;

  removeFromArray(gameState.teams[player.team] || [], id);
  delete gameState.players[id];
  delete gameState.kills[id];
  delete gameState.deaths[id];
};

tick = () => {
  const ids = api.getPlayerIds();

  if (notStarted()) {
    for (const id of ids) {
      updateSidebarNotStarted(id);
    }

    if (gameState.tickn % 100 === 0) updateLeaderboard();
    gameState.tickn += 1;

    return;
  }

  let britishMorale = 0;
  let frenchMorale = 0;

  for (const id of ids) {
    const myPos = api.getPosition(id);
    const player = gameState.players[id];

    if (player.team === "spectator") continue;

    const [closest1, closest2] = getClosest(ids, id, player, myPos);

    let proximity;
    if (closest1 <= 9 && closest2 <= 9) {
      proximity = 50;
    } else {
      const d = (Math.sqrt(closest1) + Math.sqrt(closest2)) * 0.5;
      if (d >= 20) {
        proximity = 0;
      } else {
        proximity = (1 - (d - 3) / (20 - 3)) * 50;
      }
    }
    player.morale = proximity + api.getHealth(id) * 0.5;
    if (player.team === "french") {
      if (false) {
        gameState.capture.british += 0.01;
      }
      frenchMorale += player.morale;
    } else if (player.team === "british") {
      if (false) {
        gameState.capture.french += 0.01;
      }
      britishMorale += player.morale;
    }

    updateSidebarStarted(id);
  }

  gameState.morale.french = gameState.teams.french.length > 0
    ? frenchMorale / gameState.teams.french.length
    : 0;

  gameState.morale.british = gameState.teams.british.length > 0
    ? britishMorale / gameState.teams.british.length
    : 0;

  if (gameState.tickn % 100 === 0) updateLeaderboard();

  gameState.tickn += 1;
};

onPlayerKilledOtherPlayer = (killerId, victimId) => {
  if (notStarted()) return;
  gameState.kills[killerId] = (gameState.kills[killerId] || 0) + 1;
  gameState.deaths[victimId] = (gameState.deaths[victimId] || 0) + 1;
};

onPlayerAttemptAltAction = (id, _x, _y, _z, blockName) => {
  if (notStarted()) return;

  const player = gameState.players[id];
  if (!player) return "preventAction";

  if (player.team === "spectator") return "preventAction";

  if (api.hasActiveQTE(id)) return "preventAction";

  if (blockName.includes("Door")) return;

  const item = api.getHeldItem(id);
  const attrs = item?.attributes?.customAttributes;

  if (!attrs) return "preventAction";

  const weaponName = attrs["muskets/name"] || "";
  const loaded = attrs["muskets/loaded"];

  if (weaponName.startsWith("order/")) {
    const now = api.now();
    const elapsed = now - player.lastOrderTime;

    if (elapsed < ORDER_COOLDOWN) {
      api.sendMessage(
        id,
        `${
          Math.ceil((ORDER_COOLDOWN - elapsed) / 1000)
        } seconds left until you can issue a new order`,
        { color: PALETTE.null },
      );
      return "preventAction";
    }

    player.lastOrderTime = now;
    executeOrder(id, weaponName);
  }

  if (weaponName === "arty") {
    if (loaded) {
      fireCannon(id, item, attrs);
    } else {
      reloadCannon(id);
    }
  }

  const weapon = FIREARMS[weaponName];

  if (!weapon) return "preventAction";

  if (loaded) {
    fireWeapon(id, item, attrs, weapon);
  } else {
    reloadFirearm(id, weapon);
  }

  return "preventAction";
};

onPlayerFinishQTE = (id, qteId, succeed) => {
  if (notStarted()) return;

  const player = gameState.players[id];
  if (!player) return;

  if (!succeed) {
    return;
  }

  if (player.weaponSlot !== null) {
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
  api.sendFlyingMiddleMessage(id, "Weapon loaded", 200);
};

// =================
// Game loop
// =================

function startGame() {
  if (gameState.gameStarted) {
    return api.log("Error: game already started");
  }

  const ids = api.getPlayerIds();

  if (ids.length < 6) {
    return api.log("Error: not enough players");
  }

  const frenchTeam = [];
  const britishTeam = [];
  const unassigned = [];

  for (const id of ids) {
    const player = gameState.players[id];

    gameState.kills[id] = 0;
    gameState.deaths[id] = 0;

    switch (player.team) {
      case "french":
        frenchTeam.push(id);
        break;
      case "british":
        britishTeam.push(id);
        break;
      default:
        unassigned.push(id);
    }
  }

  for (const id of unassigned) {
    if (frenchTeam.length > britishTeam.length) {
      britishTeam.push(id);
    } else if (frenchTeam.length < britishTeam.length) {
      frenchTeam.push(id);
    } else {
      if (Math.random() > 0.5) {
        frenchTeam.push(id);
        api.sendMessage(
          id,
          "Info: You have been randomly assigned to French team",
          {
            color: PALETTE.info,
          },
        );
      } else {
        britishTeam.push(id);
        api.sendMessage(
          id,
          "Info: You have been randomly assigned to British team",
          {
            color: PALETTE.info,
          },
        );
      }
    }
  }

  let diff = frenchTeam.length - britishTeam.length;

  if (Math.abs(diff) > 1) {
    const biggerTeam = diff > 0 ? frenchTeam : britishTeam;
    const smallerTeam = diff > 0 ? britishTeam : frenchTeam;
    const msg = diff > 0 ? "British" : "French";

    while (Math.abs(biggerTeam.length - smallerTeam.length) > 1) {
      const movedPlayer = biggerTeam.pop();
      smallerTeam.push(movedPlayer);

      api.sendMessage(
        movedPlayer,
        `Info: You have been reassigned to ${msg} team`,
        { color: PALETTE.info },
      );
    }
  }

  for (const id of frenchTeam) {
    gameState.players[id].team = "french";
    gameState.teams.french.push(id);
    api.setPosition(id, FRENCH_CAMP_POS);
  }

  for (const id of britishTeam) {
    gameState.players[id].team = "british";
    gameState.teams.british.push(id);
    api.setPosition(id, BRITISH_CAMP_POS);
  }

  gameState.gameStarted = true;
}

function endGame() {
  if (!gameState.gameStarted) {
    return api.log("Error: game not started");
  }

  gameState.gameStarted = false;
}

// =================
// UI
// =================

function updateSidebarStarted(id) {
  const player = gameState.players[id];
  const roleMsg = ROLE_MSG[player.role];

  api.setClientOption(
    id,
    "RightInfoText",
    `Bloxd Muskets🏹
      Made by Yervweigh

      Your Team: ${
      {
        french: "🟦French",
        british: "🟥British",
        spectator: "👁️Spectator",
      }[player.team] || "None"
    }
      Your Role: ${roleMsg ? roleMsg : "None"}

      Current Morale: ${Math.ceil(player.morale)}

      Teams Average Morale:
      🟦${Math.ceil(gameState.morale.french)} - ${
      Math.ceil(gameState.morale.british)
    }🟥

      Capture progress:
      🟦${Math.floor(gameState.capture.french)}% - ${
      Math.floor(gameState.capture.british)
    }%🟥
      `,
  );
}

function updateSidebarNotStarted(id) {
  const player = gameState.players[id];
  const roleMsg = ROLE_MSG[player.role];

  api.setClientOption(
    id,
    "RightInfoText",
    `Bloxd Muskets🏹
     Made by Yervweigh
     
     Game has not started yet

     Your Team: ${
      {
        french: "🟦French",
        british: "🟥British",
        spectator: "👁️Spectator",
      }[player.team] || "None"
    }
     Your Role: ${roleMsg ? roleMsg : "None"}`,
  );
}

function updateLeaderboard() {
  for (const id of api.getPlayerIds()) {
    const kills = gameState.kills[id] || 0;
    const deaths = gameState.deaths[id] || 0;
    const player = gameState.players[id];
    api.setTargetedPlayerSettingForEveryone(
      id,
      "lobbyLeaderboardValues",
      {
        team: capitalizeFirstLetter(player.team || "None"),
        role: player.role ? ROLE_MSG[player.role] : "None",
        kills: kills,
        deaths: deaths,
        ratio: deaths > 0 ? kills / deaths : kills,
      },
      true,
    );

    api.setTargetedPlayerSettingForEveryone(
      id,
      "colorInLobbyLeaderboard",
      {
        french: PALETTE.french,
        british: PALETTE.british,
      }[gameState.players[id].team] || PALETTE.null,
    );
  }
}

// =================
// Weapon functions
// =================

function executeOrder(id, weaponName) {
  const team = gameState.players[id].team;
  if (!team) return;

  const order = weaponName.slice(6);

  const teamList = gameState.teams[team];

  switch (order) {
    case "advance":
      for (const pid of teamList) {
        if (pid === id) continue;
        api.sendMessage(pid, "Your captain is ordering you to ADVANCE", {
          color: PALETTE.order,
        });
      }

      api.sendMessage(id, "Ordered your troops to ADVANCE");

      break;
    case "charge":
      for (const pid of teamList) {
        api.applyEffect(pid, "Speed", 5_000, {});
        api.applyEffect(pid, "Damage", 10_000, {});

        if (pid === id) continue;
        api.sendMessage(pid, "Your captain is ordering you to CHARGE", {
          color: PALETTE.order,
        });
      }

      api.sendMessage(id, "Ordered your troops to CHARGE");

      break;
    case "hold":
      for (const pid of teamList) {
        api.applyEffect(pid, "Slowness", 15_000, {});
        api.applyEffect(pid, "Damage Reduction", 20_000, {});
        api.applyEffect(pid, "Health Regen", 5_000, {});

        if (pid === id) continue;
        api.sendMessage(pid, "Your captain is ordering you to HOLD POSITION", {
          color: PALETTE.order,
        });
      }

      api.sendMessage(id, "Ordered your troops to HOLD POSITION");

      break;
    case "fallback":
      for (const pid of teamList) {
        api.applyEffect(pid, "Weakness", 20_000, {});
        api.applyEffect(pid, "Speed", 15_000, {});
        api.applyEffect(pid, "Health Regen", 10_000, {});

        if (pid === id) continue;
        api.sendMessage(pid, "Your captain is ordering you to FALLBACK", {
          color: PALETTE.order,
        });
      }

      api.sendMessage(id, "Ordered your troops to FALLBACK");

      break;
    default: {
      api.log("Error: Invalid Order");
      return;
    }
  }
}

function fireWeapon(id, item, attrs, weapon) {
  const slot = api.getSelectedInventorySlotI(id);

  attrs["muskets/loaded"] = false;

  api.setItemSlot(id, slot, weapon.unloadedItem, 1, item.attributes, true);

  const [x, y, z] = api.getPosition(id);
  const { dir } = api.getPlayerFacingInfo(id);
  const morale = gameState.players[id]?.morale;

  api.attemptCreateThrowable(
    id,
    "Pebble",
    [x, y + 1.5, z],
    deviate(
      dir,
      weapon === FIREARMS["rifle"] ? 0 : reverseMoraleFactor(morale, 0.2),
    ),
    weapon.speed,
    weapon.damage * getMoraleFactor(morale),
    0.5,
  );

  applyRecoil(id, dir, attrs["muskets/name"]);

  api.playParticleEffect({
    presetId: "lightGrayFirecrackerSmall",
    pos1: [x, y + 1, z],
    pos2: [x, y + 2, z],
  });
}

function fireCannon(id, item, attrs) {
  const player = gameState.players[id];
  const slot = api.getSelectedInventorySlotI(id);

  attrs["muskets/loaded"] = false;

  api.setItemSlot(
    id,
    slot,
    ARTY.unloadedItem,
    1,
    item.attributes,
    true,
  );

  const [x, y, z] = api.getPosition(id);
  const { dir } = api.getPlayerFacingInfo(id);
  const moraleFactor = getMoraleFactor(player.morale);

  api.attemptCreateThrowable(
    id,
    "Fireball",
    [x, y + 1.5, z],
    dir,
    2,
    10 * moraleFactor,
    1,
  );

  const grapeshotDamage = 10 * moraleFactor;
  for (let i = 0; i < 6; i += 1) {
    api.attemptCreateThrowable(
      id,
      "Reinforced Pebble",
      [x, y + 1.5, z],
      deviate(dir, 0.4),
      2,
      grapeshotDamage,
      5,
    );
  }

  applyRecoil(id, dir, "arty");

  api.playParticleEffect({
    presetId: "lightGrayFirecrackerLarge",
    pos1: [x, y + 1, z],
    pos2: [x, y + 2, z],
  });
}

function reloadFirearm(id, weapon) {
  const player = gameState.players[id];

  api.addQTE(id, {
    type: "progressBar",
    parameters: {
      progressStartValue: 10,
      progressDecreasePerTick: 0.5,
      progressPerClick: weapon.reloadSpeed * getMoraleFactor(player.morale),
      canFail: true,
      description: [weapon.message],
      clickIcon: "fa-solid fa-computer-mouse",
      scale: 1,
      rotation: 15,
    },
  });

  player.currentWeapon = weapon;
  player.weaponSlot = api.getSelectedInventorySlotI(id);
}

function reloadCannon(id) {
  const player = gameState.players[id];

  api.addQTE(id, {
    type: "rhythmClick",
    parameters: {
      requiredSuccesses: 8,
      shrinkDurationMs: 800,
      toleranceFraction: 0.15 * getMoraleFactor(player.morale),
      maxMisses: 3,
      label: ["Load your cannon!"],
    },
  });

  player.currentWeapon = ARTY;
  player.weaponSlot = api.getSelectedInventorySlotI(id);
}

function equipUniform(id) {
  const player = gameState.players[id];
  const { role, team } = player;

  const loadout = {
    helmet: null,
    chestplate: null,
    gauntlets: UNIFORMS.defaults.gauntlets,
    leggings: null,
    boots: UNIFORMS.defaults.boots,
  };

  const roleData = UNIFORMS.roles[role];

  if (!roleData) return;

  if (typeof roleData.helmet === "object") {
    loadout.helmet = team ? roleData.helmet[team] : null;
  } else {
    loadout.helmet = roleData.helmet;
  }

  if (roleData.chestplate) loadout.chestplate = roleData.chestplate;
  if (roleData.gauntlets) loadout.gauntlets = roleData.gauntlets;
  if (roleData.leggings) loadout.leggings = roleData.leggings;

  if (team) {
    if (!loadout.chestplate) {
      loadout.chestplate = UNIFORMS.team.chestplate[team];
    }
    if (!loadout.leggings) {
      loadout.leggings = UNIFORMS.team.leggings[team];
    }
  }

  for (const piece in loadout) {
    if (loadout[piece] !== null) {
      api.setItemSlot(id, UNIFORMS.slots[piece], loadout[piece], 1);
    }
  }
}

// =================
// Helpers
// =================

function createPlayer({ team = null, morale = 100 } = {}) {
  return {
    role: null,
    team,
    morale,
    currentWeapon: null,
    weaponSlot: null,
    lastOrderTime: -Infinity,
  };
}

function applyRecoil(id, dir, weapon) {
  const strength = RECOIL[weapon] +
    reverseMoraleFactor(gameState.players[id]?.morale, 5);
  api.applyImpulse(
    id,
    -dir[0] * strength,
    -dir[1] * strength,
    -dir[2] * strength,
  );
}

function notStarted() {
  return !gameState.gameStarted && !TESTMODE;
}

function getClosest(ids, id, player, myPos) {
  let closest1 = Infinity;
  let closest2 = Infinity;

  for (const other of ids) {
    if (other === id) continue;

    const otherPlayer = gameState.players[other];
    if (otherPlayer.team !== player.team) continue;

    const otherPos = api.getPosition(other);

    const dx = otherPos[0] - myPos[0];
    const dy = otherPos[1] - myPos[1];
    const dz = otherPos[2] - myPos[2];

    if (Math.abs(dx) > 20 || Math.abs(dy) > 20 || Math.abs(dz) > 20) continue;

    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq < closest1) {
      closest2 = closest1;
      closest1 = distSq;
    } else if (distSq < closest2) {
      closest2 = distSq;
    }
  }

  return [closest1, closest2];
}

function deviate(dir, strength = 1) {
  return [
    dir[0] + (Math.random() - 0.5) * strength,
    dir[1] + (Math.random() - 0.5) * strength,
    dir[2] + (Math.random() - 0.5) * strength,
  ];
}

function removeFromArray(arr, val) {
  const i = arr.indexOf(val);
  if (i !== -1) arr.splice(i, 1);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getMoraleFactor(morale) {
  return 0.5 + morale * 0.01;
}

function reverseMoraleFactor(morale, val) {
  return val - val * morale * 0.01;
}

function capitalizeFirstLetter(str) {
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}
