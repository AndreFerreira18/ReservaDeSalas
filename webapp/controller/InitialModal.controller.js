sap.ui.define([
	"odkasfactory/reservasalas/controller/BaseController",
	"./utilities"
], function(BaseController) {
	"use strict";

	this.meetingType = null;
	this.startDate = null;
	this.endDate = null;
	this.periodSelection = null;
	this.participants = null;
	this.floor = null;
	this.resources = {};

	this.startingDay = null;

	return BaseController.extend("odkasfactory.reservasalas.controller.InitialModal", {

		onInit: function() {
			this.getView().addStyleClass("initialModal");

		},

		onAfterRendering: function() {
			//dates handling
			this._setDateTimeAndSelection("modal_start_date", "modal_end_date", "modal_selection");

			//align Resource buttons
			this.getView().byId("modal_resources").addStyleClass("resources");
		},

		onHelpPress: function(oEvent) {
			this.getRouter().navTo("helpSection");
		},

		onSavePress: function() {
			var data = {};

			//meeting Type
			this.meetingType = this.getView().byId("modal_meeting_type").getSelectedItem().getKey();
			data.meeting = this.meetingType;

			//start Date
			this.startDate = this.getView().byId("modal_start_date").getValue();
			data.startDate = this.startDate;
			//end Date
			this.endDate = this.getView().byId("modal_end_date").getValue();
			data.endDate = this.endDate;

			//Time of Day
			this.periodSelection = this.getView().byId("modal_selection").getSelectedIndex();
			if (this.periodSelection && parseInt(this.periodSelection) < 4) {
				data.selection = this.periodSelection;
			}

			//participants
			this.participants = this.getView().byId("modal_participants").getValue();
			if (this.participants === "" || this.participants === "0") {
				this.getView().byId("modal_participants").setValueState(sap.ui.core.ValueState.Error);
				data = {};
				return;
			} else {
				this.getView().byId("modal_participants").setValueState(sap.ui.core.ValueState.None);
				data.participants = parseInt(this.participants);
			}

			//floor
			this.floor = this.getView().byId("modal_floor").getSelectedItem().getText();
			data.floor = this.floor;

			//resources
			this.resources = this.getView().byId("modal_resources").mAggregations.content;
			data.resources = this._checkSelectedResources(this.resources);

			this.getRouter().navTo("main");
			var eventBus = this.getOwnerComponent().getEventBus();
			eventBus.publish("InitialToMainChannel", "onRouteInitialMain", data);

		},

		validateParticipants: function(oControlEvent) {
			var participantsInput = this.getView().byId("modal_participants");
			if (oControlEvent.getParameters().value === '' || oControlEvent.getParameters().value === '0') {
				participantsInput.setValueState(sap.ui.core.ValueState.Error);
			} else {
				participantsInput.setValueState(sap.ui.core.ValueState.None);
			}

			if (participantsInput.getValue().length > participantsInput.getMaxLength()) {
				var text = participantsInput.getValue().slice(0, participantsInput.getMaxLength());
				participantsInput.setValue("");
				participantsInput.setValue(text);
			}
		},

		_setDateTimeAndSelection: function(startDateID, endDateID, radioGroupID) {
			var self = this;
			this.startDate = this.getView().byId(startDateID);
			this.endDate = this.getView().byId(endDateID);
			var radioGroup = this.getView().byId(radioGroupID);
			//set Start date
			var date = new Date();
			var beginning;
			if (date.getHours() <= 13) {
				beginning = 14;
				this.startingDay = date.getDate();
				//initial radio buttons correction (event is not triggered)
				radioGroup.setSelectedIndex(0);
				radioGroup.getSelectedButton().setValueState(sap.ui.core.ValueState.Error);
				radioGroup.getSelectedButton().setEnabled(false);
				radioGroup.setSelectedIndex(2);
				radioGroup.getSelectedButton().setValueState(sap.ui.core.ValueState.Error);
				radioGroup.getSelectedButton().setEnabled(false);
			} else {
				beginning = 8;
				date.setDate(date.getDate() + 1); //move to next day
			}
			date.setHours(beginning);
			date.setMinutes(0);
			date.setSeconds(0);
			this.startDate.setMinDate(date);

			//set End Date
			date.setMinutes(30);
			this.endDate.setMinDate(date);
			//create date and time selection popup with correct time intervals for Start Date.
			this.startDate._createPopupContent = function() {
				self.startDate = self.getView().byId(startDateID);
				sap.m.DateTimePicker.prototype._createPopupContent.apply(this, arguments);
				self.startDate._oSliders.setMinutesStep(30);
				self.startDate._oSliders.setSecondsStep(60);
				radioGroup.setSelectedIndex(4); //set selection to empty if user manually changes date or time
			};
			//create date and time selection popup with correct time intervals for End Date.
			this.endDate._createPopupContent = function() {
				self.endDate = self.getView().byId(endDateID);
				sap.m.DateTimePicker.prototype._createPopupContent.apply(this, arguments);
				self.endDate._oSliders.setMinutesStep(30);
				self.endDate._oSliders.setSecondsStep(60);
				radioGroup.setSelectedIndex(4); //set selection to empty if user manually changes date or time
			};

			this.startDate.attachChange(function() {
				var button = null;
				self.startDate = self.getView().byId(startDateID);
				self.endDate = self.getView().byId(endDateID);
				if (parseInt(this.getValue().split("/")[0]) === self.startingDay) {
					radioGroup.setSelectedIndex(0);
					button = radioGroup.getSelectedButton();
					button.setValueState(sap.ui.core.ValueState.Error);
					button.setEnabled(false);

					radioGroup.setSelectedIndex(2);
					radioGroup.getSelectedButton().setValueState(sap.ui.core.ValueState.Error);
					radioGroup.getSelectedButton().setEnabled(false);
				} else {
					radioGroup.setSelectedIndex(0);
					radioGroup.getSelectedButton().setValueState(sap.ui.core.ValueState.None);
					radioGroup.getSelectedButton().setEnabled(true);
					radioGroup.setSelectedIndex(2);
					radioGroup.getSelectedButton().setValueState(sap.ui.core.ValueState.None);
					radioGroup.getSelectedButton().setEnabled(true);
				}
				radioGroup.setSelectedIndex(4);
				var startD = this.getValue().split("/");
				var endD = self.endDate.getValue().split("/");
				var startT = this.getValue().split(",");
				var endT = self.endDate.getValue().split(",");

				if ((startD[0] > endD[0] && startD[1] >= endD[1]) || ((startD[0] === endD[0] && startD[1] === endD[1]) && startT[1] > endT[1]) ||
					startT[1] === endT[1]) {
					var auxDate, auxTime, aux, infoTime, infoDate, endTime, endDate;
					aux = this.getValue().split(",");
					auxTime = aux[1];
					auxDate = aux[0];
					infoTime = auxTime.split(":");
					infoDate = auxDate.split("/");
					if (infoTime[1] === "30") {
						var hour = parseInt(infoTime[0]) + 1;
						endTime = hour < 10 ? " 0" + hour.toString() : " " + hour.toString();
						endTime += ":00";
					} else {
						endTime = infoTime[0] + ":30";
					}
					var d = new Date();
					endDate = infoDate[0] + "/" + infoDate[1] + "/" + d.getFullYear();
					self.endDate.setValue(endDate + "," + endTime);
				}
			});

			this.endDate.attachChange(function() {
				var startD = self.startDate.getValue().split("/");
				var endD = this.getValue().split("/");
				var startT = self.startDate.getValue().split(",");
				var endT = this.getValue().split(",");

				if (((endD[0] === startD[0] && endD[1] === startD[1]) && startT[1] > endT[1]) ||
					startT[1] === endT[1]) {
					var auxDate, auxTime, aux, infoTime, infoDate, endTime, endDate;
					aux = self.startDate.getValue().split(",");
					auxTime = aux[1];
					auxDate = aux[0];
					infoTime = auxTime.split(":");
					infoDate = auxDate.split("/");
					if (infoTime[1] === "30") {
						var hour = parseInt(infoTime[0]) + 1;
						endTime = hour < 10 ? " 0" + hour.toString() : " " + hour.toString();
						endTime += ":00";
					} else {
						endTime = infoTime[0] + ":30";
					}
					var d = new Date();
					endDate = infoDate[0] + "/" + infoDate[1] + "/" + d.getFullYear();
					this.setValue(endDate + "," + endTime);
				}
			});

			//set Radio Button Group selection to null
			this.periodSelection = this.getView().byId(radioGroupID);
			this.periodSelection.setSelectedIndex(4);

			//define event for when selection changes (Moorning, Afternoon or Day);
			this.getView().byId(radioGroupID).attachSelect(function() {
				var startDate = self.getView().byId(startDateID);
				var endDate = self.getView().byId(endDateID);
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

	});
});