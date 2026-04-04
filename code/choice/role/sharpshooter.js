(() => {
  if (gameState.gameStarted) {
    return;
  }

  gameState.players[myId].role = "sharpshooter";
  equipUniform(myId);
})();
