// Bloxd Muskets🏹
// Made by Yervweigh
//
// Licensed under Apache-2.0

const FRENCH_CAMP_POS = [1051.5, 51, 1012.5];
const BRITISH_CAMP_POS = [1049.5, 51, 1388.5];
const NEUTRAL_OBJ_POS = [1041.5, 51, 1212.5];

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
  speed: 3,
  damage: 2,
  reloadSpeed: 3,
  loadedItem: "Diamond Crossbow Charged",
  unloadedItem: "Diamond Crossbow",
  projectile: "Fireball",
  message: "Load your cannon!",
};

const UNIFORMS = {
  helmet: {
    soldier: "Gray Wood Helmet",
    grenadier: "Black Wood Helmet",
    sharpshooter: "Green Wood Helmet",
    dragoon: "Iron Helmet",
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

const ROLE_MSG = {
  soldier: "🏹Musketeer",
  sharpshooter: "🎯Sharpshooter",
  artillery: "💥Artillery",
  cavalry: "🐴Dragoon",
  grenadier: "💣Grenadier",
  captain: "👑Captain",
};

var gameState = {
  gameStarted: false,
  players: {},
  teams: {
    british: [],
    french: [],
    spectator: [],
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

  if (gameState.gameStarted) {
    gameState.players[id] = {
      role: null,
      team: "spectator",
      morale: null,
      currentWeapon: null,
      weaponSlot: null,
    };

    gameState.teams.spectator.push(id);
  } else {
    gameState.players[id] = {
      role: null,
      team: null,
      morale: 100,
      currentWeapon: null,
      weaponSlot: null,
    };
  }
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
    const player = gameState.players[id];
    if (player.team === "spectator") continue;

    for (const other of ids) {
      if (other === id) continue;
      if (gameState.players[other].team !== player.team) continue;

      const otherPos = api.getPosition(other);

      const distSq =
        (otherPos[0] - myPos[0]) ** 2 +
        (otherPos[1] - myPos[1]) ** 2 +
        (otherPos[2] - myPos[2]) ** 2;

      dists.push(distSq);
    }

    dists.sort((a, b) => a - b);

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
    } else if (player.team === "british") {
      if (blocks.includes("Blue Portal")) {
        gameState.capture.french += 0.01;
      }

      britishMorale += player.morale;
      teamMsg = "🟥British";
    } else if (player.team === "spectator") {
      teamMsg = "👁️Spectator";
    } else {
      teamMsg = "None";
    }

    let roleMsg = ROLE_MSG[player.role];

    api.setClientOption(
      id,
      "RightInfoText",
      `Bloxd Muskets🏹
      Made by Yervweigh

      Your Team: ${teamMsg ? teamMsg : "None"}
      Your Role: ${roleMsg ? roleMsg : "None"}

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

  const weaponName = attrs["muskets/name"] || "";

  if (weaponName.startsWith("order/")) {
    executeOrder(weaponName);
  }

  if (weaponName === "arty") {
    if (attrs["muskets/loaded"]) {
      return "preventAction";
    }

    const moraleFactor = 0.5 + player.morale * 0.01;

    api.addQTE(id, {
      type: "progressBar",
      parameters: {
        progressStartValue: 10,
        progressDecreasePerTick: 0.5,
        progressPerClick: 3 * moraleFactor,
        canFail: true,
        description: [{ str: "Load your cannon" }],
        clickIcon: "fa-solid fa-computer-mouse",
        scale: 1,
        rotation: 15,
      },
    });

    player.currentWeapon = ARTY;
    player.weaponSlot = api.getSelectedInventorySlotI(id);

    return "preventAction";
  }

  const weapon = FIREARMS[weaponName];

  if (!weapon) return "preventAction";

  if (attrs["muskets/loaded"]) {
    fireWeapon(id, item, attrs, weapon);
  } else {
    startReloadQTE(id, item, weapon);
  }

  return "preventAction";
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

function executeOrder(weaponName) {
  let order = weaponName.slice(6);

  switch (order) {
    case "advance":
      api.broadcastMessage("Your captain is ordering you to ADVANCE", {
        color: "cornflower",
      });
      break;
    case "charge":
      api.broadcastMessage("Your captain is ordering you to CHARGE", {
        color: "orange",
      });
      break;
    case "hold":
      api.broadcastMessage("Your captain is ordering you to HOLD POSITION", {
        color: "yellow",
      });
      break;
    case "fallback":
      api.broadcastMessage("Your captain is ordering you to FALLBACK", {
        color: "grey",
      });
      break;
    default:
      api.log("Error: Invalid Order");
  }
}

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
    "Pebble",
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

  if (player.role !== null) {
    api.setItemSlot(id, 46, UNIFORMS.helmet[player.role], 1);
  }

  if (player.team !== null) {
    api.setItemSlot(id, 47, UNIFORMS.chestplate[player.team], 1);
    api.setItemSlot(id, 49, UNIFORMS.leggings[player.team], 1);
  }

  api.setItemSlot(id, 50, "Black Wood Boots", 1);

  if (player.role === "dragoon") {
    api.setItemSlot(id, 48, "White Wood Gauntlets", 1);
  } else {
    api.setItemSlot(id, 48, "Air", 1);
  }
}

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
            color: "cyan",
          },
        );
      } else {
        britishTeam.push(id);
        api.sendMessage(
          id,
          "Info: You have been randomly assigned to British team",
          {
            color: "cyan",
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
        { color: "cyan" },
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

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
}
