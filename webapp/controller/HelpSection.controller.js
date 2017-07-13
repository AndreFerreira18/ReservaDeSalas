sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("odkasfactory.reservasalas.controller.HelpSection", {
		// handleRouteMatched: function(oEvent) {

		// 	var oParams = {};

		// 	if (oEvent.mParameters.data.context) {
		// 		this.sContext = oEvent.mParameters.data.context;
		// 		var oPath;
		// 		if (this.sContext) {
		// 			oPath = {
		// 				path: "/" + this.sContext,
		// 				parameters: oParams
		// 			};
		// 			this.getView().bindObject(oPath);
		// 		}
		// 	}

		// },
		_onClosePressed: function() {

			// var oHistory = History.getInstance();
			// var sPreviousHash = oHistory.getPreviousHash();
			// var oQueryParams = this.getQueryParameters(window.location);

			// if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
			// 	window.history.go(-1);
			// } else {
			// 	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// 	oRouter.navTo("default", true);
			// }
		},
		// getQueryParameters: function(oLocation) {

		// 	var oQuery = {};
		// 	var aParams = oLocation.search.substring(1).split("&");
		// 	for (var i = 0; i < aParams.length; i++) {
		// 		var aPair = aParams[i].split("=");
		// 		oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
		// 	}
		// 	return oQuery;

		// },
		onInit: function() {

			// this.mBindingOptions = {};
			// this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.oRouter.getTarget("HelpSection").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		}
	});
}, /* bExport= */ true);