sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox",
	"./utilities"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("odkasfactory.reservasalas.controller.Main", {
		//  handleRouteMatched: function (oEvent) {

		// var oParams = {}; 

		// if (oEvent.mParameters.data.context) { 
		//     this.sContext = oEvent.mParameters.data.context;
		//     var oPath; 
		//     if (this.sContext) { 
		//         oPath = {path: "/" + this.sContext, parameters: oParams}; 
		//         this.getView().bindObject(oPath);
		//     } 
		// }

		//      },
		onInit: function() {

			// this.mBindingOptions = {};
			// this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.oRouter.getTarget("Main").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		}
	});
});