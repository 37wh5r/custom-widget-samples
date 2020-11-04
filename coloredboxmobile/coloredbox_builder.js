(function () {
	let template = document.createElement("template");
	template.innerHTML = `
		<form id="form">
			<fieldset>
				<legend>Colored Box Properties</legend>
				<table>
					<tr>
						<td><label><input id="sps_dimensions" type="checkbox">Show Dimensions</label></td>
						<td></td>
					</tr>
					<tr>
						<td>Opacity</td>
						<td><input id="sps_opacity" type="text" size="5" maxlength="5"></td>
					</tr>
				</table>
				<input type="submit" style="display:none;">
			</fieldset>
		</form>
		<style>
		:host {
			display: block;
			padding: 1rem 1rem 1rem 1rem;
		}
		</style>
	`;

	class ColoredBoxBuilderPanel extends HTMLElement {
		constructor() {
			super();
			console.log("builder: constructor()");
			this._shadowRoot = this.attachShadow({ mode: "open" });
			this._shadowRoot.appendChild(template.content.cloneNode(true));
			this._shadowRoot.getElementById("form").addEventListener("submit", this._opacityChanged.bind(this));
			this._shadowRoot.getElementById("sps_dimensions").addEventListener('change', this._showDimensionsChanged.bind(this));
			this._props = {};
		}

		connectedCallback() {
			console.log(`builder[${this._props["widgetName"]}]: connectedCallback()`);
		}

		disconnectedCallback() {
			console.log(`builder[${this._props["widgetName"]}]: disconnectedCallback()`);
		}

		onCustomWidgetBeforeUpdate(changedProps) {
			this._props = { ...this._props, ...changedProps };
			console.log(`builder[${this._props["widgetName"]}]: onCustomWidgetBeforeUpdate(${JSON.stringify(changedProps)})`);
		}

		onCustomWidgetAfterUpdate(changedProps) {
			console.log(`builder[${this._props["widgetName"]}]: onCustomWidgetAfterUpdate(${JSON.stringify(changedProps)})`);
		}

		onCustomWidgetDestroy() {
			console.log(`builder[${this._props["widgetName"]}]: onCustomWidgetDestroy()`);
		}

		_showDimensionsChanged(e) {
			e.preventDefault();
			this.dispatchEvent(new CustomEvent("propertiesChanged", {
				detail: {
					properties: {
						showDimensions: this.showDimensions,
					}
				}
			}));
		}

		_opacityChanged(e) {
			e.preventDefault();
			this.dispatchEvent(new CustomEvent("propertiesChanged", {
				detail: {
					properties: {
						opacity: this.opacity,
					}
				}
			}));
		}

		set opacity(newOpacity) {
			this._shadowRoot.getElementById("sps_opacity").value = newOpacity;
		}

		get opacity() {
			return parseFloat(this._shadowRoot.getElementById("sps_opacity").value);
		}

		set showDimensions(show) {
			this._shadowRoot.getElementById("sps_dimensions").checked = show;
		}

		get showDimensions() {
			return this._shadowRoot.getElementById("sps_dimensions").checked;
		}
	}

	customElements.define("com-sap-sample-coloredbox-builder-mobile", ColoredBoxBuilderPanel);
})();
