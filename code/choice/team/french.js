(() => {
  if (gameState.gameStarted) {
    return;
  }

  gameState.players[myId].team = "french";
  equipUniform(myId);
})();
