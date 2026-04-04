(() => {
  if (gameState.gameStarted) {
    return;
  }

  gameState.players[myId].role = "grenadier";
  equipUniform(myId);
})();
