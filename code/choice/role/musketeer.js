(() => {
  if (gameState.gameStarted) {
    return;
  }

  gameState.players[myId].role = "soldier";
  equipUniform(myId);
})();
