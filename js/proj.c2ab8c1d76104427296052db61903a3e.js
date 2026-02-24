let MAX_CARD_HEIGHT = 400;
const THREE_COLUMN_MIN_SCR_WIDTH = 1000;
const TWO_COLUMN_MIN_SCR_WIDTH = 800;

let coarse_pointer = false;

function handle_coarse_pointer(event) {
	if (event.matches) {
		coarse_pointer = true;
	} else {
		coarse_pointer = false;
	}

	if (document.readyState === "complete")
		setup();
}

const mediaQueryList = window.matchMedia('(pointer: coarse)');
mediaQueryList.addEventListener('change', handle_coarse_pointer);
handle_coarse_pointer(mediaQueryList);

function arrange_cards() {
	const grid = document.getElementsByClassName("proj-grid")[0];
	let CONTAINER_WIDTH = grid.clientWidth;
	let GAP = 10;

	let screen_width = window.innerWidth;
	let COLUMNS = 0;
	if (screen_width > THREE_COLUMN_MIN_SCR_WIDTH) {
		COLUMNS = 3;
	} else if (screen_width > TWO_COLUMN_MIN_SCR_WIDTH) {
		COLUMNS = 2;
	} else {
		COLUMNS = 1;
	}

	let ITEM_WIDTH = (CONTAINER_WIDTH / COLUMNS);

	let y_poss = [];
	for (let i = 0; i < COLUMNS; i++)
		y_poss.push(0);

	let x_pos = 0;
	let current_col = 0;
	let current_row = 0;
	const items = grid.getElementsByClassName("proj-grid-item");
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		item.style.width = ITEM_WIDTH + "px";

		const card = item.getElementsByClassName("proj-grid-item-card")[0];

		x_pos = current_col * ITEM_WIDTH;
		if (current_col > 0) x_pos += current_col * GAP;

		if (current_row > 0) y_poss[current_col] += GAP;

		item.style.left = x_pos + "px";
		item.style.top = y_poss[current_col] + "px";

		const itemHeight = item.getBoundingClientRect().height;

		y_poss[current_col] += itemHeight;
		current_col++;
		if (current_col == COLUMNS) { 
			current_col = 0;
			current_row++;
		}
	}
	grid.style.height = Math.max(...y_poss) + "px";

}

function resize_cards() {
	const divs = document.getElementsByClassName("proj-grid-item");

	for (let i = 0; i < divs.length; i++) {
		const div = divs[i];
		const img = div.getElementsByClassName("proj-grid-item-image")[0];
		let current_height = 0;
		current_height += div.getElementsByClassName("proj-grid-item-title")[0].clientHeight;
		current_height += div.getElementsByClassName("proj-grid-item-text")[0].clientHeight;

		if (current_height + img.style.clientHeight > MAX_CARD_HEIGHT && !coarse_pointer) {
			current_height = MAX_CARD_HEIGHT;
		}

		let height = Math.min(MAX_CARD_HEIGHT, current_height + img.style.clientHeight);
		div.style.height = height + "px";
		div.setAttribute("index", i);
	}
}

function disable_nojs_defaults() {
	const grid = document.getElementsByClassName("proj-grid")[0];
	grid.style.display = "block";

	const items = grid.getElementsByClassName("proj-grid-item");
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		item.style.position = "absolute";
		item.style.width = "calc(33%)";
	}
}

function setup() {
	disable_nojs_defaults();
	resize_cards();
	arrange_cards();
}

window.onload = setup;
window.pageshow = setup;
window.onreload = setup;
window.onresize = setup;

