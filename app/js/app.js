import * as data from "../data.json";

const foldersContainer = document.querySelector(".folders"),
	cardsWrapper = document.querySelector(".cards"),
	emptyBlock = document.querySelector(".empty"),
	insertButtons = document.querySelectorAll(".navbar-footer .nav-link"),
	breadcrumbsWrapper = document.querySelector(".breadcrumb"),
	showCategoryButton = document.querySelector(".content-top__button"),
	backButton = document.querySelector(".tab-top__button"),
	categoryContainer = document.querySelector(".tab-wrapper");

const info = data.default;

createCommonFolder(info);
createTree(info, foldersContainer);

// Folder "All" creation
function createCommonFolder(info) {
	const nestedCardElements = recursiveSearch(info, 'children');
	const elementTitle = `All (${nestedCardElements.length})`;
	const element = folderCreation('folder__wrapper', elementTitle);

	foldersContainer.append(element);
	addListenerToFolder(element.querySelector(".folder"), nestedCardElements);
}

// Tree creation
function createTree(info, container) {
	let parent = document.createElement("ul");
	parent.hidden = true;

	if (container == foldersContainer) parent = foldersContainer;

	info.forEach(item => {
		if (!item.category) return;

		const nestedCardElements = recursiveSearch(item, 'children'),
			elementTitle = `${item.category} (${nestedCardElements.length})`,
			element = folderCreation('folder__wrapper', elementTitle);

		if (item.children[0].category != undefined) element.classList.add('has-subfolders', 'hide');

		parent.append(element);
		addListenerToFolder(element.querySelector(".folder"), nestedCardElements);
		if (item.children.length > 0) createTree(item.children, element);
	})

	if (container != foldersContainer) container.append(parent);
}

// Get all nested card elements
function recursiveSearch(obj, searchKey, results = []) {
	const r = results;

	Object.keys(obj).forEach(key => {
		const value = obj[key];

		if (key == 'children' || value.children) {
			recursiveSearch(value, searchKey, r);
		} else if (value.title) {
			r.push(value)
		}
	});

	return r;
};

function folderCreation(className, title) {
	let element = document.createElement("li");
	element.classList.add(className);

	element.innerHTML = `
		<div class="folder">
			<span class="folder__icon"><i class="fas fa-folder"></i></span>
			<span class="folder__text">${title}</span>
		</div>
	`;

	return element;
}

// Click by folder
function addListenerToFolder(folder, data) {
	folder.addEventListener("click", event => {
		event.stopPropagation();

		const folders = document.querySelectorAll(".folder");
		const self = event.target;
		let texts = [];

		if (self.nodeName == 'UL') return;
		toggleFolders(self);

		folders.forEach(folder => folder.classList.remove('active'));
		self.classList.add("active");

		const breadcrumbsArray = createBreadcrumbsArray(folder, texts).reverse();
		breadcrumbsWrapper.innerHTML = createBreadcrumbs(breadcrumbsArray);

		// Cards creating
		if (data) {
			createCards(data);
		} else {
			cardsWrapper.innerHTML = "";
			emptyBlock.style.display = "block";
		}
	})
}

// Cards creating
function createCards(data) {
	cardsWrapper.innerHTML = "";
	emptyBlock.style.display = "none";

	data.forEach(item => {
		const element = document.createElement("div");

		element.classList.add("card");
		if (item.marked) element.classList.add("card_marked");

		element.innerHTML = `
			<div class="card__img">
				<img src="${item.image}" alt="">
			</div>
			<div class="card__body">
				<div class="card__info">
					<h5 class="card__title">${item.title}</h5>
					<p class="card__text">${item.text}</p>
				</div>
				<a href="#" class="card__button">
					<svg xmlns="http://www.w3.org/2000/svg" width="12" height="24" fill="#666"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
				</a>
			</div>
		`;

		cardsWrapper.append(element);
		addListenerToCard(element);
	})
}

// Listener for cards
function addListenerToCard(card) {
	card.addEventListener("click", () => {
		const cards = document.querySelectorAll(".card");

		cards.forEach(item => item.classList.remove("active"));
		card.classList.add("active");

		insertButtons.forEach(button => button.classList.add("active"));
	})
}

// Deactivation of active cards
document.addEventListener("click", (event) => {
	if (event.target.closest(".card") === null) {
		const cards = document.querySelectorAll(".card");

		cards.forEach(item => item.classList.remove("active"));
		insertButtons.forEach(button => button.classList.remove("active"));
	}
})

// Breadcrumbs creating
function createBreadcrumbs(array) {
	return array.map(item => `<li class="breadcrumb-item"><a href="#">${item}</a></li>`).join("");
}

function createBreadcrumbsArray(element, texts) {
	const parent = element.closest("ul"),
		text = element.querySelector(".folder__text").textContent;

	texts.push(text.replace(/ *\([^)]*\) */g, ""));
	
	if (!parent.classList.contains("folders")) {
		createBreadcrumbsArray(parent.parentNode, texts);
	}

	return texts;
}

showCategoryButton.addEventListener("click", () => {
	categoryContainer.classList.add("opened");
	document.body.style.overflow = "hidden";
})

backButton.addEventListener("click", () => {
	categoryContainer.classList.remove("opened");
	document.body.style.overflow = "visible";
})

// Toggle tabs by click
function toggleFolders(element) {
	const parent = element.parentNode,
		  childrenList = parent.querySelector('ul');

	if (!childrenList) return;
	childrenList.hidden = !childrenList.hidden;

	if (childrenList.hidden) {
		parent.classList.add('hide');
		parent.classList.remove('show');
	} else {
		parent.classList.add('show');
		parent.classList.remove('hide');
	}
}