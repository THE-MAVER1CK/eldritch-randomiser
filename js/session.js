function saveGame() {
	try {
		const saveItem = {
			expansions,
			decks,
			mythosDeck,
		};
		localStorage.setItem("Eldritch Horror Session", JSON.stringify(saveItem));
	} catch (e) {
		console.log(e);
	}
}

function loadGame() {
	try {
		const savedItem = JSON.parse(localStorage.getItem("Eldritch Horror Session"));
		resetGlobalVariables();
		loadExpansions(savedItem);
		loadDecks(savedItem);
		renderDeckPanels();
		renderMythosDeckPanel();
		if (mythosDeck) {
			renderInitMythosDeck();
		}
		switchToView("mainView");
	} catch (e) {
		console.log(e);
	}
}

function loadDecks(savedItem) {
	savedItem.decks.forEach((item) => {
		decks.push(new deck(item.name, item.availableCards, item.playedCards));
	});
	if (savedItem.mythosDeck) {
		mythosDeck = new deck(savedItem.mythosDeck.name, savedItem.mythosDeck.availableCards, savedItem.mythosDeck.playedCards);
	}
}

function loadExpansions(savedItem) {
	expansions.push(...savedItem.expansions);

	const expansionsSelected = document.getElementsByName("expansions");
	for (let i = 0; i < expansionsSelected.length; i++) {
		expansionsSelected[i].checked = expansions.includes(Number(expansionsSelected[i].value));
	}
}
