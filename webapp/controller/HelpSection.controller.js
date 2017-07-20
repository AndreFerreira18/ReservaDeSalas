sap.ui.define([
	"odkasfactory/reservasalas/controller/BaseController",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController) {
	"use strict";

	return BaseController.extend("odkasfactory.reservasalas.controller.HelpSection", {

		onInit: function() {

			
			this.getView().byId("help_header").addStyleClass("sapUiLargeMarginTop");
			this.getView().byId("help_header").addStyleClass("sapUiMediumMarginBottom");
			
			// this.getView().byId("help_title").addStyleClass("sapUiMediumMarginBegin");
		},
		
		_onClosePressed: function() {
			window.history.go(-1);
		}
	
	});
}, /* bExport= */ true);