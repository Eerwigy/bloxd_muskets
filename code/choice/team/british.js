(() => {
  if (gameState.gameStarted) {
    return;
  }

  gameState.players[myId].team = "british";
  equipUniform(myId);
})();
