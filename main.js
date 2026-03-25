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

  const item = api.getHeldItem(id);
  if (!item) return "preventAction";

  const mName = item.attributes.customAttributes["muskets/name"];

  if (mName == "smoothbore") {
    if (item.attributes.customAttributes["muskets/loaded"]) {
      item.attributes.customAttributes["muskets/loaded"] = false;
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
    } else {
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
  }

  return "preventAction";
};

onPlayerFinishQTE = (id, qteid, succeed) => {
  if (succeed) {
    const item = api.getHeldItem(id);
    item.attributes.customAttributes["muskets/loaded"] = true;
    api.setItemSlot(
      id,
      api.getSelectedInventorySlotI(id),
      "Wood Crossbow Charged",
      1,
      item.attributes,
      true,
    );
  }

  info.players[id].currentQte = null;
  info.players[id].currentQteItem = null;
};
