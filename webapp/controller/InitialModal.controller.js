sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox",
	"./utilities"
], function(Controller) {
	"use strict";

	return Controller.extend("odkasfactory.reservasalas.controller.InitialModal", {

		onInit: function() {
			// this.mBindingOptions = {};
			// this.oRouter = UIComponent.getRouterFor(this);
			// this.oRouter.getTarget("InitialModal").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			// var sUrl = "#" + this.getOwnerComponent().getRouter().getURL("helpSection");
			// this.byId("link").setHref(sUrl);
		},

		onIconPress: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("helpSection");
			// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.oRouter.
			// this.getOwnerComponent().getRouter().navTo("HelpSection");
			// var oBindingContext = oEvent.getSource().getBindingContext(); 

			// return new ES6Promise.Promise(function(fnResolve, fnReject) {

			//     this.doNavigate("HelpSection", oBindingContext, fnResolve, ""
			//     );
			// }.bind(this)).catch(function (err) { if (err !== undefined) { MessageBox.error(err.message); }});

		}

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

		// }

		// doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {

		// 	var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
		// 	var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

		// 	var sEntityNameSet;
		// 	if (sPath !== null && sPath !== "") {
		// 		if (sPath.substring(0, 1) === "/") {
		// 			sPath = sPath.substring(1);
		// 		}
		// 		sEntityNameSet = sPath.split("(")[0];
		// 	}
		// 	var sNavigationPropertyName;
		// 	var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

		// 	if (sEntityNameSet !== null) {
		// 		sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
		// 			sRouteName);
		// 	}
		// 	if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
		// 		if (sNavigationPropertyName === "") {
		// 			this.oRouter.navTo(sRouteName, {
		// 				context: sPath,
		// 				masterContext: sMasterContext
		// 			}, false);
		// 		} else {
		// 			oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
		// 				if (bindingContext) {
		// 					sPath = bindingContext.getPath();
		// 					if (sPath.substring(0, 1) === "/") {
		// 						sPath = sPath.substring(1);
		// 					}
		// 				} else {
		// 					sPath = "undefined";
		// 				}

		// 				// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
		// 				if (sPath === "undefined") {
		// 					this.oRouter.navTo(sRouteName);
		// 				} else {
		// 					this.oRouter.navTo(sRouteName, {
		// 						context: sPath,
		// 						masterContext: sMasterContext
		// 					}, false);
		// 				}
		// 			}.bind(this));
		// 		}
		// 	} else {
		// 		this.oRouter.navTo(sRouteName);
		// 	}

		// 	if (typeof fnPromiseResolve === "function") {
		// 		fnPromiseResolve();
		// 	}
		// }

	});

});