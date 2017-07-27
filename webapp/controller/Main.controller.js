sap.ui.define([
	"odkasfactory/reservasalas/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"jquery.sap.global",
	"./utilities",
	"sap/m/MessageToast",
	"sap/m/Text"
], function(BaseController, MessageBox, Utilities, JSONModel, jquery, History, MessageToast, Text) {
	"use strict";

	this.visibleFloors = 6;
	this.selectedFloor = null;
	this.minVisibleFloor = null;
	this.maxVisibleFloor = null;
	this.filters = {};
	this.appointments = [];
	this.startingDay = null;

	return BaseController.extend("odkasfactory.reservasalas.controller.Main", {

		dateFormatter: function(sDate) {
			return new Date(sDate[0], sDate[1], sDate[2], sDate[3], sDate[4]);
		},
		
		mergeTable: function(){
			
		},

		onInit: function() {
			this.appointments = [];
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
	
			var modelTable = new JSONModel();
			modelTable.attachEvent("requestCompleted", function() {
				var table = self.getView().byId("reservationsTable");
				table.setModel(this);
			}).loadData("/webapp/mockdata/MyReservations.json");

			var eventBus = this.getOwnerComponent().getEventBus();
			eventBus.subscribe("InitialToMainChannel", "onRouteInitialMain", this.onDataReceived, this);

			//styling 
			this.getView().byId("sidebarForm").addStyleClass("sidebarForm");
			this.getView().byId("sb_meeting_type").addStyleClass("meeting");
			this.getView().addStyleClass("mainPage");
		},

		onAfterRendering: function() {
			var self = this;
			if (window.innerWidth >= 600) {
				self.getView().byId("sb_panel").setExpandable(false);
			} else {
				var cells = document.querySelectorAll(".sapMListTblHighlightCell"),
					length = cells.length;
				for (var i = 0; i < length; i++) {
					if (!this._isEven(i)) {
						cells[i].parentNode.removeChild(cells[i]);
					}
				}
				var cells2 = document.querySelectorAll(".sapMListTblSubRow");
				length = cells2.length;
				for (var j = 0; j < length; j++) {
					cells2[j].children[0].colSpan = "2";
					cells2[j].children[0].style.borderBottom = "1px solid #e5e5e5";
				}
			}
			//this code is used for testing purposes.
			window.onresize = function() {
				if (window.innerWidth > 600) {
					self.getView().byId("sb_panel").setExpandable(false);
				} else {
					self.getView().byId("sb_panel").setExpandable(true);
					self.getView().byId("sb_panel").setExpanded(true);
					cells = document.querySelectorAll(".sapMListTblHighlightCell");
					length = cells.length;
					for (i = 0; i < length; i++) {
						if (!self._isEven(i)) {
							cells[i].parentNode.removeChild(cells[i]);
						}
					}

					cells2 = document.querySelectorAll(".sapMListTblSubRow");
					length = cells2.length;
					for (j = 0; j < length; j++) {
						cells2[j].children[0].colSpan = "2";
						cells2[j].children[0].style.borderBottom = "1px solid #e5e5e5";
					}
				}
			};
		},

		onExit: function() {
			this.filters = {};
			this.startingDay = null;
		},

		onClearPress: function() {
			this.appointments = [];
			this._changeModelPlanningCalendar(false);
		},

		onReservePress: function(oEvent) {
			if (this.appointments.length === 0) {
				MessageToast.show("Indique pelo menos 1 data!");
				return;
			}
			var self = this;
			//TODO implement confirmation Modal
			var oView = this.getView();
			var oDialog = oView.byId("confDialog");

			var oDummyController = {
				closeDialog: function() {
					MessageToast.show("Cancelou a sua reserva! [DUMMY]");
					oDialog.close();
				},

				confirmationPress: function() {
					var sText = self.getView().byId("confirmDialogTextarea").getValue();
					MessageToast.show("A sua reserva foi criada com a nota: " + sText + " ! [DUMMY]");
					oDialog.close();
				}
			};
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "odkasfactory.reservasalas.view.ConfirmationDialog", oDummyController);
				oView.addDependent(oDialog);
			}

			this.updateConfirmationModalFields();

			oDialog.open();
		},

		updateConfirmationModalFields: function() {
			//update modal fields with Filters data
			var oView = this.getView();
			//participants
			var pt = oView.byId("txt_participants");
			pt.setText(this.getParticipants() + ".");

			//resources
			var res = oView.byId("txt_resources");
			var resources = this.getResources();
			var text = "";
			for (var i = 0; i < resources.length; i++) {
				if (i < resources.length - 1) {
					text += resources[i] + ", ";
				} else {
					text += resources[i] + ".";
				}
			}
			if (text === "") {
				text = "Nenhum.";
			}
			res.setText(text);
			var appointments = this.appointments;
			//Room
			var room = oView.byId("txt_room");
			room.setText(appointments[0].room + " do andar " + appointments[0].floor + ".");

			//date
			var date = oView.byId("txt_date"),
				sDate = "";
			for (var j = 0; j < appointments.length; j++) {
				var start = this.dateFormatter(appointments[j].start),
					end = this.dateFormatter(appointments[j].end);
				start.setHours(0, 0, 0);
				end.setHours(0, 0, 0);
				if (start.getTime() === end.getTime()) {
					sDate += "Dia " + appointments[j].start[2] + "/" + appointments[j].start[1] + "/" + appointments[j].start[0] + " entre as " +
						appointments[j].start[3] + ":" + appointments[j].start[4] + "h e as " + appointments[j].end[3] + ":" + appointments[j].end[4] +
						"h.\n";
				}
			}
			date.setText(sDate);

			//Meeting Type
			var type = oView.byId("txt_type");
			type.setText(appointments[0].title + ".");

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
			var startDate = event.getParameter("startDate");
			var endDate = event.getParameter("endDate");
			endDate.setTime(endDate.getTime() + (60 * 1000)); // Adds 1 minute to the end date go around the less 1 minute
			var tempTime = this._adaptHours(startDate, endDate);
			startDate = this._getArrayDate(tempTime[0]);
			endDate = this._getArrayDate(tempTime[1]);
			var row = event.getParameter("row");
			var self = this;
			var modelPC = new JSONModel();
			modelPC.attachEvent("requestCompleted", function() {
				var planCal = self.getView().byId("PC1");
				var data = modelPC.getData();
				var roomIndex = oPC.indexOfRow(row);
				var selectedFloor = self.getView().byId("floorList").getSelectedItem();
				var selectedFloorKey = self._getKeyOfFloorName(selectedFloor.getText(), data);
				data = data.floors[selectedFloorKey];
				var newAppointment = {
					start: startDate,
					end: endDate,
					title: self.getMeetingType(),
					floor: selectedFloor.getText(),
					room: data.rooms[roomIndex].name,
					resources: self.getResources(),
					type: "Type01",
					tentative: false
				};
				var isContiguous = false;
				var isNewAppointment = self._isSameInfoReservation(self.appointments, newAppointment);
				if (isNewAppointment) {
					for (var i = 0; i < self.appointments.length; i++) {
						if (self._inRange(startDate, self.appointments[i].start, self.appointments[i].end) || self._isContiguousDates(self.appointments[
									i].end,
								startDate)) {
							self.appointments[i].end = endDate;
							isContiguous = true;
						}
						if (self._inRange(endDate, self.appointments[i].start, self.appointments[i].end) || self._isContiguousDates(endDate, self.appointments[
								i].start)) {
							self.appointments[i].start = startDate;
							isContiguous = true;
						}
					}
					if (!isContiguous) {
						self.appointments.push(newAppointment);
					} else {
						//TODO ver se é para juntar os apointments 	
					}
				} else {
					self.appointments.push(newAppointment);
				}
				for (i = 0; i < self.appointments.length; i++) {
					data.rooms[roomIndex].appointments.push(self.appointments[i]); //TODO ver o que fazer quando selecionamos outra sala
				}
				modelPC.setData(data);
				planCal.setModel(modelPC);
			}).loadData("/webapp/mockdata/Reservations.json");
		},

		_adaptHours: function(startDate, endDate) {
			var startMinutes = startDate.getMinutes();
			if (startMinutes === 15 || startMinutes === 45) {
				startDate.setTime(startDate.getTime() - (15 * 60 * 1000));
			} else {
				if (endDate.getTime() - startDate.getTime() < (30 * 60 * 1000)) { //minimum of 30 minuts
					endDate.setTime(startDate.getTime() + (30 * 60 * 1000));
				}
			}
			return [startDate, endDate];
		},

		_isSameInfoReservation: function(appointments, appointment) {

			var arraySameApointment = [];
			for (var i = 0; i < appointments.length; i++) {
				var arrayAppointment = [];
				for (var tempAppointments in appointments[i]) {
					for (var tempAppointment in appointment) {
						if (tempAppointments === tempAppointment) {
							if (tempAppointment !== "start" && tempAppointment !== "end" && tempAppointment !== "resources") { //TODO check resources here
								if (appointments[i][tempAppointments] === appointment[tempAppointment]) {
									arrayAppointment.push(true);
								} else {
									arrayAppointment.push(false);
								}
							} else {
								arrayAppointment.push(true);
							}
						}
					}
				}
				arraySameApointment.push(arrayAppointment);
			}

			for (i = 0; i < arraySameApointment.length; i++) {
				var count = 0;
				for (var j = 0; j < arraySameApointment[i].length; j++) {
					if (arraySameApointment[i][j] === true) {
						count++;
					}
				}
				if (count === arraySameApointment[i].length) {
					return true;
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
				if (parseInt(floorList.mAggregations.items[i].mProperties.key) >= this.minVisibleFloor && parseInt(floorList.mAggregations.items[
							i]
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
			//this._refreshShownFloors(floorList); //TODO find a way around it not possible to do addStyleClass into a item
			//dates handling
			this._setDefaults("sb_start_date", "sb_end_date", "sb_selection", "sb_meeting_type", "sb_participants");

			floorList.getItemByKey(this.filters.floor).focus();
			this._changeModelPlanningCalendar(true);
		},

		onChangeData: function() {

			//TODO remove! This is only for testing purposes.
			var aux = this.getMeetingType();
			var aux2 = this.getStartDate();
			var aux3 = this.getEndDate();
			var aux4 = this.getPeriodSelection();
			var aux5 = this.getParticipants();
			var aux6 = this.getResources();

			this.appointments = [];
			this._changeModelPlanningCalendar(true);
		},

		onSelectionChange: function() {

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
				var roomInfo = self._getSelectedRoom(); //TODO make this select were it has the avaliable resources
				if (!roomInfo.length) {
					roomInfo[0] = data.floors[selectedFloorKey].rooms[0].key;
					roomInfo[1] = data.floors[selectedFloorKey].rooms[0].name;
				}
				if (AddAppointment) {
					var startDate = self._getArrayDate(self.getStartDate());
					var endDate = self._getArrayDate(self.getEndDate());
					var openDialog = false;
					for (var i = 0; i < data.floors[selectedFloorKey].rooms[roomInfo[0]].appointments.length; i++) {
						if (self._inRange(data.floors[selectedFloorKey].rooms[roomInfo[0]].appointments[i].start, startDate, endDate) || self._inRange(
								data.floors[selectedFloorKey].rooms[roomInfo[0]].appointments[i].end, startDate, endDate)) {
							openDialog = true;
						}
					}
					if (openDialog) {
						self.genericDialog({
							"title": "Verificar Disponibilidade",
							"body": "Com as datas selecionadas não é possivel executar uma reserva. Por favou selecionar um conjunto de datas diferentes."
						});
					} else {
						// fazer multi reservas
						var newAppointments = self._createReservationInformation(startDate, endDate, selectedFloor, roomInfo);
						for (i = 0; i < newAppointments.length; i++) {
							self.appointments.push(newAppointments[i]);
						}
					}
				}
				for (i = 0; i < self.appointments.length; i++) {
					if (self.appointments[i] && self.appointments[i].floor === selectedFloor.getText()) {
						data.floors[selectedFloorKey].rooms[roomInfo[0]].appointments.push(self.appointments[i]);
					}
				}
				modelPC.setData(data.floors[selectedFloorKey]);
				planCal.setModel(modelPC);
			}).loadData("/webapp/mockdata/Reservations.json");

		},

		_createReservationInformation: function(startDate, endDate, selectedFloor, roomInfo) {
			var arrayAppointments = [];
			var tempStartDate = this.dateFormatter(startDate);
			var tempEndDate = this.dateFormatter(endDate);
			tempStartDate.setHours(0, 0, 0);
			tempEndDate.setHours(0, 0, 0);
			if (tempStartDate.getTime() !== tempEndDate.getTime()) {
				do {
					var newStartDate = new Date();
					newStartDate.setFullYear(tempStartDate.getFullYear(), tempStartDate.getMonth(), tempStartDate.getDate());
					newStartDate.setHours(this.dateFormatter(startDate).getHours(), this.dateFormatter(startDate).getMinutes());
					var newEndDate = new Date();
					newEndDate.setFullYear(tempStartDate.getFullYear(), tempStartDate.getMonth(), tempStartDate.getDate());
					newEndDate.setHours(this.dateFormatter(endDate).getHours(), this.dateFormatter(endDate).getMinutes());
					arrayAppointments.push({
						start: this._getArrayDate(newStartDate),
						end: this._getArrayDate(newEndDate),
						title: this.getMeetingType(),
						floor: selectedFloor.getText(),
						room: roomInfo[1],
						resources: this.getResources(),
						type: "Type01",
						tentative: false
					});
					tempStartDate.setDate(tempStartDate.getDate() + 1);
				} while (tempStartDate.getTime() <= tempEndDate.getTime());
			} else {
				arrayAppointments.push({
					start: startDate,
					end: endDate,
					title: this.getMeetingType(),
					floor: selectedFloor.getText(),
					room: roomInfo[1],
					resources: this.getResources(),
					type: "Type01",
					tentative: false
				});
			}
			return arrayAppointments;
		},

		genericDialog: function(dialogData, callback) {
			var view = this.getView();
			var dialog = view.byId("genDialog");

			var genericController = {
				closeDialog: function() {
					dialog.close();
				},

				confirmationPress: function() {
					dialog.close();
					callback && callback();
				}
			};
			// create dialog lazily
			if (!dialog) {
				dialog = sap.ui.xmlfragment(view.getId(), "odkasfactory.reservasalas.view.GenericDialog", genericController);
				view.addDependent(dialog);
			}

			//updade dialog information
			if (dialogData.title) {
				dialog.setTitle(dialogData.title);
			}
			if (dialogData.body) {
				var text = new Text();
				text.setText(dialogData.body);
				text.setWidth("100%");
				text.setTextAlign("Center");
				text.addStyleClass("sapMText sapUiSmallMarginTop sapUiSmallMarginBottom");
				dialog.destroyContent();
				dialog.insertContent(text, -1);
			}
			dialog.open();
		},

		_getSelectedRoom: function() {
			var rows = [];
			var planCal = this.getView().byId("PC1");
			var selectedRow = planCal.getSelectedRows();
			if (selectedRow.length) {
				rows[0] = selectedRow[0].getKey();
				rows[1] = selectedRow[0].getTitle();
			}
			return rows;
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

		_disableRadioButtons: function() {
			var radioGroup = this.getView().byId("sb_selection");
			radioGroup.setSelectedIndex(0);
			radioGroup.getSelectedButton().setEnabled(false);
			radioGroup.setSelectedIndex(2);
			radioGroup.getSelectedButton().setEnabled(false);
			radioGroup.setSelectedIndex(4);
		},

		_enableRadioButtons: function() {
			var radioGroup = this.getView().byId("sb_selection");
			radioGroup.setSelectedIndex(0);
			radioGroup.getSelectedButton().setEnabled(true);
			radioGroup.setSelectedIndex(2);
			radioGroup.getSelectedButton().setEnabled(true);
			radioGroup.setSelectedIndex(4);
		},

		_setDefaults: function(startDateID, endDateID, radioGroupID, meetingTypeID, participantsID) {
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
				this.startingDay = date1.getDate();
				//initial radio buttons correction (event is not triggered)
				this._disableRadioButtons();

			} else {
				beginning = 8;
				date1.setDate(date1.getDate() + 1); //move to next day
				date2.setDate(date2.getDate() + 1); //move to next day
				radioGroup.setSelectedIndex(this.filters.selection < 4 ? this.filters.selection : 4);
			}
			date1.setHours(beginning, 0, 0);
			var actualDate = new Date();
			actualDate.setHours(0, 0, 0);
			this.getView().byId("PC1").setMinDate(actualDate);
			this.startDate.setMinDate(date1);
			this.startDate.setValue(this.filters.startDate);

			//set End Date
			date2.setHours(beginning, 30, 0);
			this.endDate.setMinDate(date2);
			this.endDate.setValue(this.filters.endDate);

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
				self.startDate = self.getView().byId(startDateID);
				self.endDate = self.getView().byId(endDateID);
				if (parseInt(this.getValue().split("/")[0]) === self.startingDay) {
					self._disableRadioButtons();
				} else {
					self._enableRadioButtons();
				}
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

				if ((startD[0] > endD[0] && startD[1] >= endD[1]) || ((startD[0] === endD[0] && startD[1] === endD[1]) && startT[1] > endT[1]) ||
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
				dateA.setMinutes(0);
				dateA.setSeconds(0);
				dateB.setMinutes(0);
				dateB.setSeconds(0);
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
		},

		_isEven: function(n) {
			n = Number(n);
			return n === 0 || !!(n && !(n % 2));
		}

	});
});