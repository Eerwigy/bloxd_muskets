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
  const mName = attrs["muskets/name"];

  if (mName !== "smoothbore") return "preventAction";

  if (attrs["muskets/loaded"]) {
    fireMusket(id, item, attrs);
  } else {
    startReloadQTE(id, item);
  }

  return "preventAction";
};

onPlayerFinishQTE = (id, qteid, succeed) => {
  const player = info.players[id];
  if (!player) return;

  if (succeed && player.currentQteItem) {
    const item = player.currentQteItem;
    const attrs = item.attributes?.customAttributes;

    if (attrs) {
      attrs["muskets/loaded"] = true;

      api.setItemSlot(
        id,
        api.getSelectedInventorySlotI(id),
        "Wood Crossbow Charged",
        1,
        item.attributes,
        true,
      );
    }
  }

  player.currentQte = null;
  player.currentQteItem = null;
};

function fireMusket(id, item, attrs) {
  attrs["muskets/loaded"] = false;

  api.setItemSlot(
    id,
    api.getSelectedInventorySlotI(id),
    "Wood Crossbow",
    1,
    item.attributes,
    true,
  );

  const [x, y, z] = api.getPosition(id);
  const { dir } = api.getPlayerFacingInfo(id);

  api.attemptCreateThrowable(id, "Pebble", [x, y + 1.5, z], dir, 2, 1, 0.5);

  api.playParticleEffect({
    presetId: "lightGrayFirecrackerSmall",
    pos1: [x, y + 1, z],
    pos2: [x, y + 2, z],
  });
}

function startReloadQTE(id, item) {
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

  info.players[id].currentQte = qte;
  info.players[id].currentQteItem = item;
}
