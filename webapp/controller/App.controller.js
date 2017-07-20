sap.ui.define([
	"odkasfactory/reservasalas/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("odkasfactory.reservasalas.controller.App", {
		
		onInit: function() {
			//start Router 
			this.getRouter().initialize();
			
			//display initial screen
			this.getRouter().navTo("initialModal");
		
			
		}

	});

});