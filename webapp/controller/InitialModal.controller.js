sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox",
	"./utilities"
], function(Controller) {
	"use strict";

	this.meetingType = null;
	this.startDate = null;
	this.endDate = null;
	this.periodSelection = null;
	this.participants = null;
	this.floor = null;
	this.resources = {};

	return Controller.extend("odkasfactory.reservasalas.controller.InitialModal", {

		onInit: function() {

			// this.mBindingOptions = {};
			// this.oRouter = UIComponent.getRouterFor(this);
			// this.oRouter.getTarget("InitialModal").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			// var sUrl = "#" + this.getOwnerComponent().getRouter().getURL("helpSection");
			// this.byId("link").setHref(sUrl);
			this._setDateTimeDefault();
		},

		onIconPress: function() {
			// this.getOwnerComponent().getRouter().navTo("helpSection");
			// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.oRouter.
			// this.getOwnerComponent().getRouter().navTo("HelpSection");
			// var oBindingContext = oEvent.getSource().getBindingContext(); 

			// return new ES6Promise.Promise(function(fnResolve, fnReject) {

			//     this.doNavigate("HelpSection", oBindingContext, fnResolve, ""
			//     );
			// }.bind(this)).catch(function (err) { if (err !== undefined) { MessageBox.error(err.message); }});

		},

		onSavePress: function() {
			var data = {};

			//meeting Type
			this.meetingType = sap.ui.getCore().byId(this.createId("modal_meetingType")).getSelectedItem().getText();
			if (this.meetingType) {
				data.meeting = this.meetingType;
			}

			//start Date
			this.startDate = sap.ui.getCore().byId(this.createId("modal_startDate")).getValue();
			data.startDate = this.startDate;
			//end Date
			this.endDate = sap.ui.getCore().byId(this.createId("modal_endDate")).getValue();
			data.endDate = this.endDate;

			//Time of Day
			this.periodSelection = sap.ui.getCore().byId(this.createId("modal_periodSelection")).getSelectedButton();
			data.selection = this.periodSelection ? this.periodSelection.getText() : "";

			//participants
			this.participants = sap.ui.getCore().byId(this.createId("modal_participants")).getValue();
			if (this.participants === "" || this.participants === "0") {
				sap.ui.getCore().byId(this.createId("modal_participants")).setValueState(sap.ui.core.ValueState.Error);
				data = {};
				return;
			} else {
				sap.ui.getCore().byId(this.createId("modal_participants")).setValueState(sap.ui.core.ValueState.None);
				data.participants = parseInt(this.participants);
			}

			//floor
			this.floor = sap.ui.getCore().byId(this.createId("modal_floor")).getSelectedItem().getText();
			data.floor = this.floor;

			//resources
			this.resources = sap.ui.getCore().byId(this.createId("modal_resources")).mAggregations.content;
			data.resources = this._checkSelectedResources(this.resources);

		},

		_setDateTimeDefault: function() {
			var self = this;
			this.startDate = sap.ui.getCore().byId(this.createId("modal_startDate"));
			this.endDate = sap.ui.getCore().byId(this.createId("modal_endDate"));
			//create date and time selection popup with correct time intervals for Start Date.
			this.startDate._createPopupContent = function() {
				self.startDate = sap.ui.getCore().byId(self.createId("modal_startDate"));
				sap.m.DateTimePicker.prototype._createPopupContent.apply(this, arguments);
				self.startDate._oSliders.setMinutesStep(30);
				self.startDate._oSliders.setSecondsStep(60);
				sap.ui.getCore().byId(self.createId("modal_periodSelection")).setSelectedIndex(4); //set selection to empty if user manually changes date or time
			};
			//create date and time selection popup with correct time intervals for End Date.
			this.endDate._createPopupContent = function() {
				self.endDate = sap.ui.getCore().byId(self.createId("modal_endDate"));
				sap.m.DateTimePicker.prototype._createPopupContent.apply(this, arguments);
				self.endDate._oSliders.setMinutesStep(30);
				self.endDate._oSliders.setSecondsStep(60);
				sap.ui.getCore().byId(self.createId("modal_periodSelection")).setSelectedIndex(4); //set selection to empty if user manually changes date or time
			};

		},

		onAfterRendering: function() {
			var self = this;
			//set Radio Button Group selection to null
			this.periodSelection = sap.ui.getCore().byId(this.createId("modal_periodSelection"));
			this.periodSelection.setSelectedIndex(4);
			
			//define event for when selection changes (Moorning, Afternoon or Day);
			sap.ui.getCore().byId(this.createId("modal_periodSelection")).attachSelect(function() {
				var startDate = sap.ui.getCore().byId(self.createId("modal_startDate"));
				var endDate = sap.ui.getCore().byId(self.createId("modal_endDate"));
				var sDate = startDate.getValue().split(',')[0];
				var infos = this.getSelectedButton().getText();

				switch (infos) {
					case "Manhã":
						startDate.setValue(sDate + ', 08:00');
						endDate.setValue(sDate + ', 13:00');
						break;

					case "Tarde":
						startDate.setValue(sDate + ', 14:00');
						endDate.setValue(sDate + ', 20:00');
						break;
					case "Dia":
						startDate.setValue(sDate + ', 08:00');
						endDate.setValue(sDate + ', 20:00');
						break;
				}
			});
			
			//align Resource buttons
			sap.ui.getCore().byId(this.createId("modal_resources")).addStyleClass("resources");

		},

		validateParticipants: function(oControlEvent) {
			if (oControlEvent.getParameters().value === '' || oControlEvent.getParameters().value === '0') {
				sap.ui.getCore().byId(this.createId("modal_participants")).setValueState(sap.ui.core.ValueState.Error);
			} else {
				sap.ui.getCore().byId(this.createId("modal_participants")).setValueState(sap.ui.core.ValueState.None);
			}
		},

		_checkSelectedResources: function(buttonsArray) {
			var aux = [],
				i,
				length = buttonsArray.length;
			for (i = 0; i < length; i++) {
				if (buttonsArray[i].getPressed()) {
					aux.push(buttonsArray[i].getText());
				}
			}
			return aux;
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