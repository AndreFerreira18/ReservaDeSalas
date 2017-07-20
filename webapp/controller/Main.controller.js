sap.ui.define([
	"odkasfactory/reservasalas/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox",
	'sap/ui/model/json/JSONModel',
	'jquery.sap.global',
	"./utilities"
], function(BaseController, MessageBox, Utilities, JSONModel, jquery, History) {
	"use strict";

	this.visibleFloors = 6;
	this.selectedFloor = null;
	this.minVisibleFloor = null;
	this.maxVisibleFloor = null;
	this.filters = {};

	return BaseController.extend("odkasfactory.reservasalas.controller.Main", {

		dateFormatter: function(sDate) {
			return new Date(sDate[0], sDate[1], sDate[2], sDate[3], sDate[4]);
		},

		onInit: function() {
			this.minVisibleFloor = 2;
			this.maxVisibleFloor = 5;
			var self = this;

			var modelPC = new JSONModel();
			modelPC.attachEvent("requestCompleted", function() {
				var planCal = self.getView().byId("PC1");
				planCal.setModel(this);
			}).loadData("/webapp/mockdata/Reservations.json");

			var modelFloors = new JSONModel();
			modelFloors.attachEvent("requestCompleted", function() {
				var vBox = self.getView().byId("floorList");
				vBox.setModel(this);
				//vBox = self._refreshShownFloors(vBox); // not working
			}).loadData("/webapp/mockdata/Floors.json");

			// var oView = this.getView();

			// //load jquery libraries for drag n drop
			// jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-core");
			// jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-widget");
			// jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-mouse");
			// jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-draggable");
			// jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-droppable");

			// //make the appointments drag n droppables
			// var oAppointment = oView.byId("draggable");
			// var idAppointment = oAppointment.getId();
			// oAppointment.onAfterRendering = function() {
			// 	$("#" + idAppointment).draggable({
			// 		cancel: false
			// 	});
			// };
			this.getView().byId("sidebarForm").addStyleClass("sidebarForm");
			this.getView().byId("sb_meeting_type").addStyleClass("meeting");
		},
		// handleAppointmentSelect: function (oEvent) {
		// 	var oAppointment = oEvent.getParameter("appointment");
		// 	if (oAppointment) {
		// 		alert("Appointment selected: " + oAppointment.getTitle());
		// 	}else {
		// 		var aAppointments = oEvent.getParameter("appointments");
		// 		var sValue = aAppointments.length + " Appointments selected";
		// 		alert(sValue);
		// 	}
		// },

		handleIntervalSelect: function(event) {
			var oPC = event.oSource;
			var startDate = this._getArrayDate(event.getParameter("startDate"));
			var endDate = this._getArrayDate(event.getParameter("endDate"));
			var row = event.getParameter("row");
			var subInterval = event.getParameter("subInterval");
			var modelPC = this.getView().byId("PC1").getModel();
			var data = modelPC.getData();
			var index = -1;
			var newAppointment = {start: startDate,
					            end: endDate,
					            title: "new appointment",
					            type: "Type09"};
			if (row) {
				index = oPC.indexOfRow(row);
				data.rooms[index].appointments.push(newAppointment);
			} else {
				var selectedRows = oPC.getSelectedRows();
				for (var i = 0; i < selectedRows.length; i++) {
					index = oPC.indexOfRow(selectedRows[i]);
					data.rooms[index].appointments.push(newAppointment);
				}
			}
			modelPC.setData(data);
		},
		
		_getArrayDate: function(date){
			var dateMonth = date.getMonth().toString();
			var strDate = date.toString().split(" ");
			var strTime = strDate[4].split(":");
			return [strDate[3],dateMonth,strDate[2],strTime[0],strTime[1]];
		},

		_refreshShownFloors: function(vBox) { // not working
			// vBox.
			var floorList = this.getView().byId("floorList").mAggregations.items;
			for (var i = 0; i <= floorList.length; i++) {
				if (parseInt(floorList[i].mProperties.key) >= this.minVisibleFloor && parseInt(floorList[i].mProperties.key) <= this.maxVisibleFloor) {
					//this.getView().byId(floorList[i].sId).addStyleClass("displayInherit");
					vBox = vBox.mAggregations.items[1].mAggregations.items[floorList[i].mProperties.key].addStyleClass("displayInherit");
				} else {
					//this.getView().byId(floorList[i].sId).addStyleClass("displayNone");
					vBox = vBox.mAggregations.items[1].mAggregations.items[floorList[i].mProperties.key].addStyleClass("displayNone");
				}
				return vBox;
			}
		},
				
		onDataReceived: function(channel, event, data) {
			this.filters = data;
		},
		
		onChangeData: function(oEvent){
			
		}
	});
});