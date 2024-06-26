function buildMythosDeck() {
	if (mythosAvailable.length == 0) {
		getAvailableMythos();
	}
	const isInAdvancedMode = document.getElementsByClassName("toggle-advance-composition")[0].checked;
	const gridElement = isInAdvancedMode ? document.querySelector(".mythos-grid-advanced") : document.querySelector(".mythos-grid-simple");

	shuffleArray(mythosAvailable);

	const mythosToUse = mythosAvailable.slice();
	let deckCards = [];

	for (let i = 0; i <= 3; i++) {
		let stageCards = [];

		const composition = isInAdvancedMode
			? [
					{
						traits: ["Easy", "Green"],
						count: getMythosCountRequired(gridElement, i, "green", "easy"),
					},
					{
						traits: ["Normal", "Green"],
						count: getMythosCountRequired(gridElement, i, "green", "normal"),
					},
					{
						traits: ["Hard", "Green"],
						count: getMythosCountRequired(gridElement, i, "green", "hard"),
					},
					{
						traits: ["Easy", "Yellow"],
						count: getMythosCountRequired(gridElement, i, "yellow", "easy"),
					},
					{
						traits: ["Normal", "Yellow"],
						count: getMythosCountRequired(gridElement, i, "yellow", "normal"),
					},
					{
						traits: ["Hard", "Yellow"],
						count: getMythosCountRequired(gridElement, i, "yellow", "hard"),
					},
					{
						traits: ["Easy", "Blue"],
						count: getMythosCountRequired(gridElement, i, "blue", "easy"),
					},
					{
						traits: ["Normal", "Blue"],
						count: getMythosCountRequired(gridElement, i, "blue", "normal"),
					},
					{
						traits: ["Hard", "Blue"],
						count: getMythosCountRequired(gridElement, i, "blue", "hard"),
					},
			  ]
			: [
					{
						traits: ["Green"],
						count: getMythosCountRequired(gridElement, i, "green"),
					},
					{
						traits: ["Yellow"],
						count: getMythosCountRequired(gridElement, i, "yellow"),
					},
					{
						traits: ["Blue"],
						count: getMythosCountRequired(gridElement, i, "blue"),
					},
			  ];

		for (let j = mythosToUse.length - 1; j >= 0; j--) {
			const currentMythosTraits = mythosToUse[j].traits;

			for (let k = 0; k < composition.length; k++) {
				const current = composition[k];

				if (current.count != 0 && current.traits.every((trait) => currentMythosTraits.includes(trait))) {
					stageCards.push(mythosToUse.splice(j, 1)[0]);
					current.count--;
					break;
				}
			}
		}

		if (!isEnoughMythosFetched(composition)) return;

		shuffleArray(stageCards);
		deckCards = deckCards.concat(stageCards);
	}

	mythosDeck = new deck("Mythos", "", "", deckCards);
	boxMythosDeck = new deck("Box", "", "", mythosToUse);
	renderInitMythosDeck();
	saveGame();
}

function getMythosCountRequired(container, stage, color, difficulty) {
	let query = `[data-stage='${stage}'][data-color='${color}']`;
	if (difficulty) {
		query += `[data-difficulty='${difficulty}']`;
	}
	const targetInput = container.querySelector(query);
	if (targetInput) {
		return parseInt(container.querySelector(query).value, 10) || 0;
	}
	return 0;
}

function getAvailableMythos() {
	mythosAvailable.push(...mythosData.filter((cardGroup) => expansions.includes(cardGroup.expansionID)).flatMap((cardGroup) => cardGroup.cards));
}

function isEnoughMythosFetched(composition) {
	for (let i = 0; i < composition.length; i++) {
		const current = composition[i];

		if (current.count != 0) {
			setMythosError(`Not enough ${current.traits.join(" ")} Mythos card available to match composition.`);
			return false;
		}
	}

	setMythosError("");
	return true;
}

function setMythosError(error) {
	document.querySelector(".mythos-error").textContent = error;
}

function renderMythosDeck() {
	renderMythosCount();
	renderMythosHistoryList();
}

function renderMythosCount() {
	setMythosCount(mythosDeck.availableCards.length);
}

function setMythosCount(count) {
	document.querySelector(".mythos .deck__count").textContent = count;
}

function renderMythosHistoryList() {
	const cardTemplate = document.getElementById("cardItemTemplate");
	const fragment = document.createDocumentFragment();
	const badgeNode = document.createElement("span");
	badgeNode.classList.add("badge");

	mythosDeck.playedCards.toReversed().forEach((card) => {
		const itemNode = cardTemplate.content.cloneNode(true);
		const itemTraitsNode = itemNode.querySelector(".card__traits");

		itemNode.querySelector(".card__name").textContent = card.name;
		Array.from(card.traits).forEach((trait) => {
			const traitNode = badgeNode.cloneNode();
			traitNode.classList.add(trait.toLowerCase());
			traitNode.textContent = trait;
			itemTraitsNode.appendChild(traitNode);
		});
		fragment.appendChild(itemNode);
	});
	document.querySelector(".mythos .history").replaceChildren(fragment);
}

function drawMythosCard() {
	const result = mythosDeck.drawCards(1);
	const drawnCardPlaceholder = document.querySelector(".mythos .newest-card");
	const noDrawnCardMessage = document.querySelector(".mythos .no-newest-card");

	if (result.length == 1) {
		renderDrawnCard(result[0], drawnCardPlaceholder, false, true);
		renderMythosDeck();

		drawnCardPlaceholder.style.display = "block";
		noDrawnCardMessage.style.display = "none";
	} else {
		drawnCardPlaceholder.style.display = "none";
		noDrawnCardMessage.style.display = "block";
	}
}

async function shuffleMythosDeckAsync() {
	mythosDeck.shuffle();

	// So that users know the deck has been shuffled, set the count to 0, delay half a second, then set the actual count
	setMythosCount(0);
	await new Promise((r) => setTimeout(r, 500));
	renderMythosCount();
}

function toggleMythosHistory() {
	toggleSectionByClassName.bind(document.querySelector(".mythos .drawn-cards"))();
}

function toggleMythosGrid(isInAdvancedMode) {
	const simple = document.querySelector(".mythos-grid-simple");
	const advance = document.querySelector(".mythos-grid-advanced");
	if (isInAdvancedMode) {
		simple.style.display = "none";
		advance.style.display = "grid";
	} else {
		simple.style.display = "grid";
		advance.style.display = "none";
	}
}

function toggleMythosPanel(isVisible) {
	document.querySelector(".mythos").style.display = isVisible ? "block" : "none";
}

function renderMythosDeckPanel() {
	document.querySelector(".mythos .drawn-cards").style.display = "none";
	toggleMythosGrid(document.querySelector(".toggle-advance-composition").checked);
	toggleMythosPanel(false);
	loadPresetDropDown();
}

function renderInitMythosDeck() {
	renderMythosDeck();
	document.querySelector(".mythos .newest-card").style.display = "none";
	document.querySelector(".mythos .no-newest-card").style.display = "none";
	toggleMythosPanel(true);
}

function loadPresetDropDown() {
	const fragment = document.createDocumentFragment();
	const option = document.createElement("option");

	const defaultOption = option.cloneNode();
	defaultOption.value = 0;
	defaultOption.text = "--Pick an Option--";
	fragment.append(defaultOption);

	ancientOneData
		.filter((group) => expansions.includes(group.expansionID))
		.flatMap((group) => group.cards)
		.sort((a, b) => a.name.localeCompare(b.name))
		.forEach((ancientOne) => {
			const ancientOneOption = option.cloneNode();
			ancientOneOption.value = ancientOne.id;
			ancientOneOption.text = ancientOne.name;
			fragment.append(ancientOneOption);
		});
	document.querySelector("select[name='ancientOne']").replaceChildren(fragment);
}

function settingPreset(event) {
	const ancientOneId = event.target.value;
	if (ancientOneId == 0) return;
	const ancientOnePreset = getCompositionByAncientOneId(ancientOneId);
	if (!ancientOnePreset) return;
	document.querySelector("form.mythos-grid-form").reset();
	const gridElement = document.querySelector(".mythos-grid-simple");
	for (let i = 0; i < ancientOnePreset.length; i++) {
		const preset = ancientOnePreset[i];
		gridElement.querySelector(`input[data-stage='${preset.stage}'][data-color='${preset.color}']`).value = preset.count;
	}
	const isAdvanceCheckbox = document.querySelector(".toggle-advance-composition");
	if (isAdvanceCheckbox.checked) {
		isAdvanceCheckbox.click();
	}
}

function getCompositionByAncientOneId(id) {
	for (let i = 0; i < ancientOneData.length; i++) {
		for (let j = 0; j < ancientOneData[i].cards.length; j++) {
			if (ancientOneData[i].cards[j].id == id) {
				return ancientOneData[i].cards[j].mythosComposition;
			}
		}
	}
}

function toggleMythosDrawFromBox() {
	toggleSectionByClassName.bind(document.querySelector(".mythos-box"))();
}

function toggleBoxMythosCard(isVisible = true) {
	document.querySelector(".box-drawn").style.display = isVisible ? "flex" : "none";
}

function drawBoxMythosCard() {
	const form = document.querySelector("form.mythos");
	const formData = new FormData(form);
	const traits = formData.getAll("traits");
	const result = boxMythosDeck.drawCards(1, traits);
	const drawnCardPlaceholder = document.querySelector("form.mythos .box-card");
	drawnCardPlaceholder.textContent = "Click to reveal";
	drawnCardPlaceholder.setAttribute("realName", result[0].name);
	drawnCardPlaceholder.setAttribute("cardId", result[0].id);
	toggleBoxMythosCard(true);
}

function revealBoxMythos() {
	const boxCardElement = document.querySelector("form.mythos .box-card");
	boxCardElement.textContent = boxCardElement.getAttribute("realName");
}

function discardBoxMythos() {
	const boxCardElement = document.querySelector("form.mythos .box-card");
	const boxCardId = boxCardElement.getAttribute("cardId");
	const boxCard = boxMythosDeck.playedCards.splice(
		boxMythosDeck.playedCards.findIndex((item) => item.id === boxCardId),
		1
	)[0];
	mythosDeck.playedCards.push(boxCard);
	toggleBoxMythosCard(false);
	renderMythosHistoryList();
}

async function shuffleBoxMythosToDeckAsync() {
	const boxCardElement = document.querySelector("form.mythos .box-card");
	const boxCardId = boxCardElement.getAttribute("cardId");
	const boxCard = boxMythosDeck.playedCards.splice(
		boxMythosDeck.playedCards.findIndex((item) => item.id === boxCardId),
		1
	)[0];
	mythosDeck.availableCards.push(boxCard);
	toggleBoxMythosCard(false);
	await shuffleMythosDeckAsync();
}
