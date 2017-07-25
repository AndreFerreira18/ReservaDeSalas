sap.ui.define([
	"odkasfactory/reservasalas/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"jquery.sap.global",
	"./utilities",
	"sap/m/MessageToast"
], function(BaseController, MessageBox, Utilities, JSONModel, jquery, History, MessageToast) {
	"use strict";

	this.visibleFloors = 6;
	this.selectedFloor = null;
	this.minVisibleFloor = null;
	this.maxVisibleFloor = null;
	this.filters = {};
	this.startingDay = null;

	return BaseController.extend("odkasfactory.reservasalas.controller.Main", {

		dateFormatter: function(sDate) {
			return new Date(sDate[0], sDate[1], sDate[2], sDate[3], sDate[4]);
		},

		onInit: function() {
			this.minVisibleFloor = 2;
			this.maxVisibleFloor = 5;
			var self = this;

			var modelMatrix = new JSONModel();
			modelMatrix.attachEvent("requestCompleted", function() {
				var planCal = self.getView().byId("PC1");
				planCal.setModel(this);
			}).loadData("/webapp/mockdata/Reservations.json");

			var modelFloors = new JSONModel();
			modelFloors.attachEvent("requestCompleted", function() {
				var vBox = self.getView().byId("floorList");
				vBox.setModel(this);
				//vBox = self._refreshShownFloors(vBox); // not working
			}).loadData("/webapp/mockdata/Floors.json");

			var eventBus = this.getOwnerComponent().getEventBus();
			eventBus.subscribe("InitialToMainChannel", "onRouteInitialMain", this.onDataReceived, this);

			//styling 
			this.getView().byId("sidebarForm").addStyleClass("sidebarForm");
			this.getView().byId("sb_meeting_type").addStyleClass("meeting");
			this.getView().addStyleClass("mainPage");

		},

		onAfterRendering: function() {
			var self = this;
			this.wasRemoved = false;
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
				this.wasRemoved = true;
				var cells2 = document.querySelectorAll(".sapMListTblSubRow");
				length = cells2.length;
				for (var j = 0; j < length; j++) {
					cells2[j].children[0].colSpan = "2";
				}
			}
			//this code is used for testing purposes.
			window.onresize = function() {
				if (window.innerWidth >= 600) {
					self.getView().byId("sb_panel").setExpandable(false);
				} else {
					self.getView().byId("sb_panel").setExpandable(true);
					self.getView().byId("sb_panel").setExpanded(true);
					if (!self.wasRemoved) {
						self.wasRemoved = true;
						var cells = document.querySelectorAll(".sapMListTblHighlightCell"),
							length = cells.length;
						for (var i = 0; i < length; i++) {
							if (!self._isEven(i)) {
								cells[i].parentNode.removeChild(cells[i]);
							}
						}
					}
					var cells2 = document.querySelectorAll(".sapMListTblSubRow");
					length = cells2.length;
					for (var j = 0; j < length; j++) {
						cells2[j].children[0].colSpan = "2";
					}
				}
			};
		},

		onExit: function() {
			this.filters = {};
			this.startingDay = null;
		},

		onClearPress: function(oEvent) {
			//TODO Nuno: implement clear appointments functionality
			
		},

		onReservePress: function(oEvent) {
			var self = this;
			//TODO implement confirmation Modal
			var oView = this.getView();
			var oDialog = oView.byId("confDialog");

			var oDummyController = {
				closeDialog: function() {
					oDialog.close();
				},
				
				confirmationPress: function(){
					MessageToast.show("A sua reserva foi criada! [DUMMY]");
					oDialog.close();
				}
			};
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "odkasfactory.reservasalas.view.ConfirmationDialog", oDummyController);
				oView.addDependent(oDialog);
			}

			oDialog.open();
		},

		_refreshShownFloors: function(vBox) { // not working
			// vBox.
			var floorList = this.getView().byId("floorList").mAggregations.items;
			for (var i = 0; i <= floorList.length; i++) {
				if (parseInt(floorList[i].mProperties.key) >= this.minVisibleFloor && parseInt(floorList[i].mProperties.key) <= this.maxVisibleFloor) {
					//this.getView().byId(floorList[i].sId).addStyleClass("displayInherit");
					vBox = vBox.mAggregations.items[1].mAggregations.items[floorList[i].mProperties.key].addStyleClass("displayNone");
				} else {
					//this.getView().byId(floorList[i].sId).addStyleClass("displayNone");
					vBox = vBox.mAggregations.items[1].mAggregations.items[floorList[i].mProperties.key].addStyleClass("displayNone");
				}
			}
			return vBox;
		},

		onDataReceived: function(channel, event, data) {
			var self = this;
			this.filters = data;
			//filters handling
			setTimeout(function() {
				self._setDefaults("sb_start_date", "sb_end_date", "sb_selection", "sb_meeting_type", "sb_participants");
			}, 500);
		},

		onChangeData: function(oEvent) {
			//TODO remove! This is only for testing purposes.
			var aux = this.getMeetingType();
			var aux2 = this.getStartDate();
			var aux3 = this.getEndDate();
			var aux4 = this.getPeriodSelection();
			var aux5 = this.getParticipants();
			var aux6 = this.getResources();

			var table = this.getView().byId("reservationsTable");
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
				radioGroup.getSelectedButton().setEnabled(false);
				radioGroup.setSelectedIndex(2);
				radioGroup.getSelectedButton().setEnabled(false);
			} else {
				beginning = 8;
				date.setDate(date.getDate() + 1); //move to next day
			}
			radioGroup.setSelectedIndex(4);
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
					button.setEnabled(false);

					radioGroup.setSelectedIndex(2);
					radioGroup.getSelectedButton().setEnabled(false);
				} else {
					radioGroup.setSelectedIndex(0);
					radioGroup.getSelectedButton().setEnabled(true);
					radioGroup.setSelectedIndex(2);
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

		getMeetingType: function() {
			return this.getView().byId("sb_meeting_type").getSelectedItem().getText();
		},

		getStartDate: function() {
			return this.getView().byId("sb_start_date").getValue();
		},

		getEndDate: function() {
			return this.getView().byId("sb_end_date").getValue();
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