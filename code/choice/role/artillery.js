(() => {
  if (gameState.gameStarted) {
    return;
  }

  gameState.players[myId].role = "artillery";
  equipUniform(myId);
})();
