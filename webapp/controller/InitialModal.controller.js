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

		},

		onAfterRendering: function() {
			this.getView().addStyleClass("initialModal");
			//dates handling
			this._setDateTimeAndSelection("modal_start_date", "modal_end_date", "modal_selection");

			//align Resource buttons
			this.getView().byId("modal_resources").addStyleClass("resources");
		},

		onExit: function() {
			this.meetingType = null;
			this.startDate = null;
			this.endDate = null;
			this.periodSelection = null;
			this.participants = null;
			this.floor = null;
			this.resources = {};
			this.startingDay = null;

		},
		onHelpPress: function(oEvent) {
			this.getRouter().navTo("helpSection");
		},

		onSavePress: function() {
			var self = this,
				data = {};

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
			if (this.periodSelection < 4) {
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
			this.floor = this.getView().byId("modal_floor").getSelectedItem().getKey();
			data.floor = this.floor;

			//resources
			this.resources = this.getView().byId("modal_resources").mAggregations.content;
			data.resources = this._checkSelectedResources(this.resources);

			this.getRouter().navTo("main");
			setTimeout(function() {
				var eventBus = self.getOwnerComponent().getEventBus();
				eventBus.publish("InitialToMainChannel", "onRouteInitialMain", data);
			}, 500);

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
			var self = this,
				radioGroup = this.getView().byId(radioGroupID),
				date1 = new Date(),
				date2 = new Date(),
				beginning;

			this.startDate = this.getView().byId(startDateID);
			this.endDate = this.getView().byId(endDateID);
			//set Start date
			if (date1.getHours() <= 13) {
				beginning = 14;
				var aux = date1;
				aux.setHours(14, 0, 0);
				this.startingDay = aux;
				//initial radio buttons correction (event is not triggered)
				this._disableRadioButtons();
			} else {
				beginning = 8;
				date1.setDate(date1.getDate() + 1); //move to next day
				date2.setDate(date2.getDate() + 1); //move to next day
				radioGroup.setSelectedIndex(4);
				this.startingDay = null;
			}
			date1.setHours(beginning, 0, 0);
			this.startDate.setMinDate(date1);

			//set End Date
			date2.setHours(beginning, 30, 0);
			this.endDate.setMinDate(date2);
			//create date and time selection popup with correct time intervals for Start Date.
			this.startDate._createPopupContent = function() {
				sap.m.DateTimePicker.prototype._createPopupContent.apply(this, arguments);
				this._oSliders.setMinutesStep(30);
				this._oSliders.setSecondsStep(60);
				radioGroup.setSelectedIndex(4); //set selection to empty if user manually changes date or time
			};
			//create date and time selection popup with correct time intervals for End Date.
			this.endDate._createPopupContent = function() {
				sap.m.DateTimePicker.prototype._createPopupContent.apply(this, arguments);
				this._oSliders.setMinutesStep(30);
				this._oSliders.setSecondsStep(60);
				radioGroup.setSelectedIndex(4); //set selection to empty if user manually changes date or time
			};

			this.startDate.attachChange(function() {
				self.endDate = self.getView().byId(endDateID);
				var sDate = this.getDateValue(),
					eDate = self.endDate.getDateValue();

				if (self.startingDay && sDate.withoutTime().getTime() === self.startingDay.withoutTime().getTime()) {
					self._disableRadioButtons();
				} else {
					self._enableRadioButtons();
				}

				if (sDate.getTime() >= eDate.getTime()) {
					self.adjustEndDateValue();
				}

			});

			this.endDate.attachChange(function() {
				self.startDate = self.getView().byId(startDateID);
				var eDate = this.getDateValue(),
					sDate = self.startDate.getDateValue();

				if (eDate.getTime() <= sDate.getTime()) {
					self.adjustEndDateValue();
				}
			});

			//define event for when selection changes (Moorning, Afternoon or Day);
			this.getView().byId(radioGroupID).attachSelect(function() {
				var startDate = self.getView().byId(startDateID),
					endDate = self.getView().byId(endDateID),
					infos = this.getSelectedButton().getText(),
					dateA = new Date(),
					dateB = new Date(),
					sDateValue = startDate.getDateValue(),
					sDate = startDate.getValue().split(",")[0],
					eDateValue = endDate.getDateValue(),
					eDate = endDate.getValue().split(",")[0];

				dateA.setFullYear(sDateValue.getFullYear(), sDateValue.getMonth(), sDateValue.getDate());
				dateB.setFullYear(eDateValue.getFullYear(), eDateValue.getMonth(), eDateValue.getDate());
				dateA.setMinutes(0, 0);
				dateB.setMinutes(0, 0);
				switch (infos) {
					case "Manhã":
						dateA.setHours(8);
						startDate.setDateValue(dateA);
						startDate.setValue(sDate + ", 08:00");
						dateB.setHours(13);
						endDate.setDateValue(dateB);
						endDate.setValue(eDate + ", 13:00");
						break;
					case "Tarde":
						dateA.setHours(14);
						startDate.setDateValue(dateA);
						startDate.setValue(sDate + ", 14:00");
						dateB.setHours(20);
						endDate.setDateValue(dateB);
						endDate.setValue(eDate + ", 20:00");
						break;
					case "Dia":
						dateA.setHours(8);
						startDate.setDateValue(dateA);
						startDate.setValue(sDate + ", 08:00");
						dateB.setHours(20);
						endDate.setDateValue(dateB);
						endDate.setValue(eDate + ", 20:00");
						break;
				}
			});
		},

		adjustEndDateValue: function() {
			var date = this.startDate.getDateValue(),
				timeText = "",
				dateText = "",
				newDate = new Date();
			if(date.getMinutes() === 30){
				var hour = date.getHours() + 1;
				timeText = hour < 10 ? " 0" + hour.toString() : " " + hour.toString();
				timeText += ":00";
				newDate.setHours(hour,0,0);
			} else {
				timeText = date.getHours() + ":30";
				newDate.setHours(date.getHours(),30,0);
			}
			dateText = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
			newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
			this.endDate.setValue(dateText + "," + timeText);
			this.endDate.setDateValue(newDate);
		},

		_disableRadioButtons: function() {
			var radioGroup = this.getView().byId('modal_selection');
			radioGroup.setSelectedIndex(0);
			radioGroup.getSelectedButton().setEnabled(false);
			radioGroup.setSelectedIndex(2);
			radioGroup.getSelectedButton().setEnabled(false);
			radioGroup.setSelectedIndex(4);
		},

		_enableRadioButtons: function() {
			var radioGroup = this.getView().byId('modal_selection');
			radioGroup.setSelectedIndex(0);
			radioGroup.getSelectedButton().setEnabled(true);
			radioGroup.setSelectedIndex(2);
			radioGroup.getSelectedButton().setEnabled(true);
			radioGroup.setSelectedIndex(4);
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

Date.prototype.withoutTime = function() {
	var d = new Date(this);
	d.setHours(0, 0, 0, 0);
	return d;
};