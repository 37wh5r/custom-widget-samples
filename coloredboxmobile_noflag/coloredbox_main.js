(function () {
	let template = document.createElement("template");
	template.innerHTML = `
		<style>
		:host {
			border-radius: 25px;
			border-width: 4px;
			border-color: black;
			border-style: solid;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		</style>
		<div id="dimensions"></div>
	`;

	class ColoredBox extends HTMLElement {

		constructor() {
			super();
			if (new Error().stack.indexOf('Object.cloneDomRef') !== -1) {
				console.log("main: constructor() - drag clone");
				this._isDragClone = true;
			} else {
				console.log("main: constructor()");
			}
			this._shadowRoot = this.attachShadow({ mode: "open" });
			this._shadowRoot.appendChild(template.content.cloneNode(true));
			this._props = {};
			this._randomColorHandlerRegistered = false;
		}

		connectedCallback() {
			console.log(this._isDragClone ? `main[${this._props["widgetName"]}]: connectedCallback() - drag clone` : `main[${this._props["widgetName"]}]: connectedCallback()`);
			const { width, height } = this.getBoundingClientRect();
			if (width > 0 && height > 0) {
				// setVisible(false) results in connectedCallback being called with rect {0,0,0,0}!
				// we do not need to adjust the dimensions DIV in that case
				this.adjustDimensionsText(width, height);
				this.adjustDimensionsColor();
			}
		}

		disconnectedCallback() {
			console.log(this._isDragClone ? `main[${this._props["widgetName"]}]: disconnectedCallback() - drag clone` : `main[${this._props["widgetName"]}]: disconnectedCallback()`);
		}

		onCustomWidgetResize(width, height) {
			console.log(`main[${this._props["widgetName"]}]: onCustomWidgetResize(${Math.round(width)}, ${Math.round(height)})`);
			this.adjustDimensionsText(width, height);
		}

		onCustomWidgetBeforeUpdate(changedProps) {
			this._props = { ...this._props, ...changedProps };
			console.log(`main[${this._props["widgetName"]}]: onCustomWidgetBeforeUpdate(${JSON.stringify(changedProps)})`);
			// in view mode, depending on whether we are running on a mobile device or not, register an appropriate handler for random color changes
			if (this._props["designMode"] === false && !this._randomColorHandlerRegistered) {
				this._props["mobileMode"] === false ? this.registerShiftClickHandler() : this.registerTwoFingerTapHandler();
				this._randomColorHandlerRegistered = true;
			}
		}

		onCustomWidgetAfterUpdate(changedProps) {
			console.log(`main[${this._props["widgetName"]}]: onCustomWidgetAfterUpdate(${JSON.stringify(changedProps)})`);
			if ("color" in changedProps) {
				this.updateColor(changedProps["color"]);
			}
			if ("opacity" in changedProps) {
				this.style["opacity"] = changedProps["opacity"];
			}
			if ("showDimensions" in changedProps) {
				this._shadowRoot.getElementById("dimensions").style["display"] = changedProps["showDimensions"] ? "block" : "none";
			}
			if (changedProps["onClick"] === true && changedProps["designMode"] === false) {
				// at runtime only, show a hand cursor on hover if an "onClick" event handler exists
				this.style["cursor"] = "pointer";
			}
		}

		onCustomWidgetDestroy() {
			console.log(`main[${this._props["widgetName"]}]: onCustomWidgetDestroy()`);
		}

		updateColor(color) {
			this.style["background-color"] = color;
			this.adjustDimensionsColor();
		}

		adjustDimensionsColor() {
			if (window.getComputedStyle(this).backgroundColor) {
				const currentColor = window.getComputedStyle(this).backgroundColor.match(/\d+/g).map(a => parseInt(a, 10));
				const perceivedBrightness = (currentColor[0] * 299 + currentColor[1] * 587 + currentColor[2] * 114) / 1000;
				this._shadowRoot.getElementById("dimensions").style["color"] = perceivedBrightness < 123 ? "white" : "black";
			}
		}

		adjustDimensionsText(width, height) {
			this._shadowRoot.getElementById("dimensions").textContent = `${Math.round(width)} x ${Math.round(height)}`;
		}

		setBackgroundColor(newColor) {
			this.dispatchEvent(new CustomEvent("propertiesChanged", {
				detail: {
					properties: {
						color: newColor
					}
				}
			}));
			this.updateColor(newColor);
		}

		registerShiftClickHandler() {
			this.addEventListener("click", event => {
				const shiftKey = event.shiftKey;
				if (shiftKey) { // at view time, shift-clicking the colored box sets a random color
					this.setBackgroundColor(this.getRandomColor());
				} else {
					this.dispatchEvent(new Event("onClick"));
				}
			});
		}

		registerTwoFingerTapHandler() {
			this.addEventListener("touchstart", event => {
				event.preventDefault();
				if (event.targetTouches.length === 2) { // at view time, touching with two fingers sets a random color
					this.setBackgroundColor(this.getRandomColor());
				}
			});
		}

		getRandomColor() {
			const letters = '0123456789ABCDEF';
			let color = '#';
			for (var i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color;
		}
	}

	customElements.define("com-sap-sample-coloredbox-mobile", ColoredBox);
})();
