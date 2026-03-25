const WEAPONS = {
  smoothbore: {
    speed: 1.5,
    damage: 2,
    loadedItem: "Wood Crossbow Charged",
    unloadedItem: "Wood Crossbow",
  },

  rifle: {
    speed: 3,
    damage: 4,
    loadedItem: "Stone Crossbow Charged",
    unloadedItem: "Stone Crossbow",
  },
};

var info = {
  gameStarted: false,
  players: {},
};

onPlayerJoin = (id) => {
  info.players[id] = {
    role: "regular",
    currentQte: null,
    currentQteItem: null,
  };
};

onPlayerAttemptAltAction = (id, _x, _y, _z, blockName) => {
  if (api.hasActiveQTE(id)) return "preventAction";

  const player = info.players[id];
  if (!player) return "preventAction";

  const item = api.getHeldItem(id);
  if (!item?.attributes?.customAttributes) return "preventAction";

  const attrs = item.attributes.customAttributes;
  const weaponName = attrs["muskets/name"];
  const weapon = WEAPONS[weaponName];

  if (!weapon) return "preventAction";

  if (attrs["muskets/loaded"]) {
    fireMusket(id, item, attrs, weapon);
  } else {
    startReloadQTE(id, item, weapon);
  }

  return "preventAction";
};
onPlayerFinishQTE = (id, qteid, succeed) => {
  const player = info.players[id];
  if (!player) return;

  if (succeed && player.currentQteItem != null) {
    const item = api.getItemSlot(id, player.weaponSlot);
    if (!item) return;

    const attrs = item.attributes?.customAttributes;
    const weapon = player.currentWeapon;

    if (attrs) {
      attrs["muskets/loaded"] = true;

      api.setItemSlot(
        id,
        player.weaponSlot,
        weapon.loadedItem,
        1,
        item.attributes,
        true,
      );
    }
  }

  player.currentQte = null;
  player.currentQteItem = null;
  player.weaponSlot = null;
};

function fireMusket(id, item, attrs, weapon) {
  attrs["muskets/loaded"] = false;

  api.setItemSlot(
    id,
    api.getSelectedInventorySlotI(id),
    weapon.unloadedItem,
    1,
    item.attributes,
    true,
  );

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
  const player = info.players[id];

  const qte = api.addQTE(id, {
    type: "progressBar",
    parameters: {
      progressStartValue: 10,
      progressDecreasePerTick: 0.5,
      progressPerClick: 50,
      canFail: true,
      description: [{ str: "Load your musket!" }],
      clickIcon: "fa-solid fa-computer-mouse",
      scale: 1,
      rotation: 15,
    },
  });

  player.currentQte = qte;
  player.currentQteItem = item;
  player.weaponSlot = api.getSelectedInventorySlotI(id);
  player.currentWeapon = weapon;
}
