sap.ui.define([
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";

	// TODO remove the following demo code
	// ---------------------------- TEMP MOCKSERVER CODE------------------------------------------
	// server.init();
	// ---------------------------- END TEMP MOCKSERVER CODE--------------------------------------

	// var navigationWithContext = {

	// };

	return UIComponent.extend("odkasfactory.reservasalas.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			
			UIComponent.prototype.init.apply(this, arguments);

		}
	});

}, /*bExport= */ true);