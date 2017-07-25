sap.ui.define([
	"odkasfactory/reservasalas/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"jquery.sap.global",
	"./utilities"
], function(BaseController, MessageBox, Utilities, JSONModel, jquery, History) {
	"use strict";

	this.visibleFloors = 6;
	this.selectedFloor = null;
	this.minVisibleFloor = null;
	this.maxVisibleFloor = null;
	this.filters = {};
	this.newAppointment = null;

	return BaseController.extend("odkasfactory.reservasalas.controller.Main", {

		dateFormatter: function(sDate) {
			return new Date(sDate[0], sDate[1], sDate[2], sDate[3], sDate[4]);
		},

		onInit: function() {
			this.minVisibleFloor = 2;
			this.maxVisibleFloor = 5;
			var self = this;

			var modelFloors = new JSONModel();
			modelFloors.attachEvent("requestCompleted", function() {
				var vBox = self.getView().byId("floorList");
				vBox.setModel(this);
			}).loadData("/webapp/mockdata/Floors.json");

			var modelPC = new JSONModel();
			modelPC.attachEvent("requestCompleted", function() {
				var planCal = self.getView().byId("PC1");
				this.setData(this.getData().floors[0]);
				planCal.setModel(this);
			}).loadData("/webapp/mockdata/Reservations.json");

			var eventBus = this.getOwnerComponent().getEventBus();
			eventBus.subscribe("InitialToMainChannel", "onRouteInitialMain", this.onDataReceived, this);

			//styling 
			this.getView().byId("sidebarForm").addStyleClass("sidebarForm");
			this.getView().byId("sb_meeting_type").addStyleClass("meeting");
			this.getView().addStyleClass("mainPage");
		},

		handleAppointmentSelect: function(oEvent) {
			var oAppointment = oEvent.getParameter("appointment");
			if (oAppointment) {
				alert("Appointment selected: " + oAppointment.getTitle() + "Start Time: " + oAppointment.mProperties.startDate + "End Time: " +
					oAppointment.mProperties.endDate);
			} else {
				var aAppointments = oEvent.getParameter("appointments");
				var sValue = aAppointments.length + " Appointments selected";
				alert(sValue);
			}
		},

		handleIntervalSelect: function(event) {
			var oPC = event.oSource;
			var startDate = this._getArrayDate(event.getParameter("startDate"));
			var endDate = this._getArrayDate(event.getParameter("endDate"));
			var row = event.getParameter("row");
			var subInterval = event.getParameter("subInterval");
			var modelPC = this.getView().byId("PC1").getModel();
			var data = modelPC.getData();
			var index = -1;

			if (row) {
				index = oPC.indexOfRow(row);
				var isNewAppointment = true;
				var appointments = data.rooms[index].appointments;
				for (var i = 0; i < appointments.length; i++) {
					if (this._inRange(startDate, appointments[i].start, appointments[i].end) || this._isContiguousDates(appointments[i].end,
							startDate)) {
						data.rooms[index].appointments[i].end = endDate;
						isNewAppointment = false;
					}
					if (this._inRange(endDate, appointments[i].start, appointments[i].end) || this._isContiguousDates(endDate, appointments[i].start)) {
						data.rooms[index].appointments[i].start = startDate;
						isNewAppointment = false;
					}

				}
				if (isNewAppointment) {
					var newAppointment = {
						start: startDate,
						end: endDate,
						title: this.getMeetingType(),
						type: "Type09"
					};
					data.rooms[index].appointments.push(newAppointment);
				}
			} else {
				var selectedRows = oPC.getSelectedRows();
				for (i = 0; i < selectedRows.length; i++) {
					index = oPC.indexOfRow(selectedRows[i]);
					data.rooms[index].appointments.push(newAppointment);
				}
			}
			modelPC.setData(data);
		},

		//TODO Remake not working yet
		_isSameInfoReservation: function(appointments, appointment) {
			for (var i = 0; i < appointments.length; i++) {
				for (var tempAppointments in appointments[i]) {
					for (var tempAppointment in appointment)
						if (tempAppointments === tempAppointment && (tempAppointment !== "start" || tempAppointment !== "end")) {
							return true;
						}
				}
			}
			return false;
		},

		_inRange: function(date, startDate, endDate) {
			var d = this.dateFormatter(date);
			var sd = this.dateFormatter(startDate);
			var ed = this.dateFormatter(endDate);
			if (d > sd && d < ed) {
				return true;
			}
			return false;
		},

		_isContiguousDates: function(endDate, startDate) {
			var sd = this.dateFormatter(startDate);
			var ed = this.dateFormatter(endDate);
			// Adds 1 minute to the end date
			ed.setTime(ed.getTime() + (60 * 1000));
			if (ed.valueOf() === sd.valueOf()) {
				return true;
			}
			return false;
		},

		_getArrayDate: function(date) {
			var dateMonth = date.getMonth().toString();
			var strDate = date.toString().split(" ");
			var strTime = strDate[4].split(":");
			return [strDate[3], dateMonth, strDate[2], strTime[0], strTime[1]];
		},

		_refreshShownFloors: function(floorList) { // not working
			//var floorList = this.getView().byId("floorList").mAggregations.items;
			for (var i = 0; i <= floorList.mAggregations.items.length; i++) {
				if (parseInt(floorList.mAggregations.items[i].mProperties.key) >= this.minVisibleFloor && parseInt(floorList.mAggregations.items[i]
						.mProperties.key) <= this.maxVisibleFloor) {
					this.getView().byId(floorList.mAggregations.items[i].getId()).addStyleClass("displayInherit");
					//floorList.getItemByKey(floorList.mAggregations.items[i].mProperties.key).addStyleClass("displayInherit");
				} else {
					this.getView().byId(floorList.mAggregations.items[i].getId()).addStyleClass("displayNone");
					// floorList.getItemByKey(floorList.mAggregations.items[i].mProperties.key).addStyleClass("displayNone");
				}
			}
		},

		onDataReceived: function(channel, event, data) {
			this.filters = data;
			var floorList = this.getView().byId("floorList");
			floorList.setSelectedItem(floorList.getItemByKey(this.filters.floor));
			//this.getView().byId(floorList.getItemByKey(this.filters.floor).getId()).focus();  //Not working Auto Focus in Selected Element
			//this._refreshShownFloors(floorList); //TODO find a way around it not possible to do addStyleClass into a item
			//dates handling
			this._setDefaults("sb_start_date", "sb_end_date", "sb_selection", "sb_meeting_type", "sb_participants");
			this._changeModelPlanningCalendar(true);
		},

		onChangeData: function(oEvent) {

			//TODO remove! This is only for testing purposes.
			var aux = this.getMeetingType();
			var aux2 = this.getStartDate();
			var aux3 = this.getEndDate();
			var aux4 = this.getPeriodSelection();
			var aux5 = this.getParticipants();
			var aux6 = this.getResources();

			this._changeModelPlanningCalendar(true);
		},

		selectionChange: function() {

			this._changeModelPlanningCalendar(false);
		},

		_changeModelPlanningCalendar: function(AddAppointment) {
			var self = this;
			var modelPC = new JSONModel();
			modelPC.attachEvent("requestCompleted", function() {
				var selectedFloor = self.getView().byId("floorList").getSelectedItem();
				var planCal = self.getView().byId("PC1");
				var data = this.getData();
				var selectedFloorKey = self._getKeyOfFloorName(selectedFloor.getText(), data);
				var room = 0; //TODO make this select were it has the avaliable resources
				if (AddAppointment) {
					self.newAppointment = {
						start: self._getArrayDate(self.getStartDate()),
						end: self._getArrayDate(self.getEndDate()),
						title: self.getMeetingType(),
						floor: selectedFloor.getText(),
						room: room,
						resources: self.getResources(),
						type: "Type01",
						tentative: false
					};
					data.floors[selectedFloorKey].rooms[room].appointments.push(self.newAppointment);
				}else{
					if(self.newAppointment.floor === selectedFloor.getText()){
						data.floors[selectedFloorKey].rooms[room].appointments.push(self.newAppointment);
					}
				}

				this.setData(data.floors[selectedFloorKey]);
				planCal.setModel(this);
			}).loadData("/webapp/mockdata/Reservations.json");

		},

		_getKeyOfFloorName: function(floorName, data) {
			var index = 0;

			for (var i = 0; i < data.floors.length; i++) {
				if (data.floors[i].name === floorName) {
					index = i;
					break;
				}
			}
			return index;
		},

		_setDefaults: function(startDateID, endDateID, radioGroupID, meetingTypeID, participantsID) {
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
			this.startDate.setValue(this.filters.startDate);

			//set End Date
			date.setMinutes(30);
			this.endDate.setMinDate(date);
			this.endDate.setValue(this.filters.endDate);
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

				if ((endD[0] < startD[0] && endD[1] <= startD[1]) || ((endD[0] === startD[0] && endD[1] === startD[1]) && startT[1] > endT[1])) {
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
			this.periodSelection.setSelectedIndex(this.filters.selection ? this.filters.selection : 4);

			//define event for when selection changes (Moorning, Afternoon or Day);
			this.getView().byId(radioGroupID).attachSelect(function() {
				var startDate = self.getView().byId(startDateID);
				var endDate = self.getView().byId(endDateID);
				var sDate = startDate.getValue().split(",")[0];
				var infos = this.getSelectedButton().getText();
				switch (infos) {
					case "Manhã":
						startDate.setValue(sDate + ", 08:00");
						endDate.setValue(sDate + ", 13:00");
						break;

					case "Tarde":
						startDate.setValue(sDate + ", 14:00");
						endDate.setValue(sDate + ", 20:00");
						break;
					case "Dia":
						startDate.setValue(sDate + ", 08:00");
						endDate.setValue(sDate + ", 20:00");
						break;
				}
			});

			//meetingType
			var meeting = this.getView().byId(meetingTypeID);
			meeting.setSelectedKey(this.filters.meeting);

			//Participants
			var participants = this.getView().byId(participantsID);
			participants.setValue(this.filters.participants);

			//resources
			this._setSelectedResources(this.filters.resources, "sb_resources");

		},

		_setSelectedResources: function(btnsArray, resourcesContainerID) {
			var i,
				j,
				sbResources = this.getView().byId(resourcesContainerID).mAggregations.content,
				length = sbResources.length;
			for (i = 0; i < length; i++) {
				for (j = 0; j < btnsArray.length; j++) {
					if (sbResources[i].getText() === btnsArray[j]) {
						sbResources[i].setPressed(true);
					}
				}
			}
		},

		validateParticipants: function(oControlEvent) {
			var participantsInput = this.getView().byId("sb_participants");
			if (oControlEvent.getParameters().value === "" || oControlEvent.getParameters().value === "0") {
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

		getMeetingType: function() {
			return this.getView().byId("sb_meeting_type").getSelectedItem().getText();
		},

		getStartDate: function() {
			return this.getView().byId("sb_start_date").getDateValue();
		},

		getEndDate: function() {
			return this.getView().byId("sb_end_date").getDateValue();
		},

		getPeriodSelection: function() {
			return this.getView().byId("sb_selection").getSelectedButton() ? this.getView().byId("sb_selection").getSelectedButton().getText() :
				null;
		},

		getParticipants: function() {
			return this.getView().byId("sb_participants").getValue();
		},

		getResources: function() {
			var aux = [],
				i,
				buttonsArray = this.getView().byId("sb_resources").mAggregations.content,
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