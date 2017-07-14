sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox",
	"./utilities"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("odkasfactory.reservasalas.controller.Main", {
		// onAfterRendering: function() {
		// 	var containerSideBar =  sap.ui.getCore().byId("__panel0");
		// 	containerSideBar.oParent.aCustomStyleClasses=["sapUiRespGridSpanL3", "sapUiRespGridSpanM5", "sapUiRespGridSpanS12", "sapUiRespGridSpanXL3"];
			
		// 	var containerFloorSelector =  sap.ui.getCore().byId("__grid1");
		// 	containerFloorSelector.oParent.aCustomStyleClasses=["sapUiRespGridSpanL3", "sapUiRespGridSpanM7", "sapUiRespGridSpanS12", "sapUiRespGridSpanXL3"];
			
		// 	var containerMatrix =  sap.ui.getCore().byId("__bar1");
		// 	containerMatrix.oParent.aCustomStyleClasses=["sapUiRespGridSpanL6", "sapUiRespGridSpanM7", "sapUiRespGridSpanS12", "sapUiRespGridSpanXL6"];
		
		// 	var containerFooter =  sap.ui.getCore().byId("__table0");
		// 	containerFooter.oParent.aCustomStyleClasses=["sapUiRespGridSpanL9", "sapUiRespGridSpanM7", "sapUiRespGridSpanS12", "sapUiRespGridSpanXL9"];

		// },
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