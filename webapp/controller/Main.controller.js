sap.ui.define([
	"sap/ui/core/mvc/Controller",
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

	// $("#floorList").load(function() {
	// 	alert("Image loaded");
	// 	this._refreshShownFloors();
	// });

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

		// handleIntervalSelect: function (oEvent) {
		// 	var oPC = oEvent.oSource;
		// 	var oStartDate = oEvent.getParameter("startDate");
		// 	var oEndDate = oEvent.getParameter("endDate");
		// 	var oRow = oEvent.getParameter("row");
		// 	var oSubInterval = oEvent.getParameter("subInterval");
		// 	var oModel = this.getView().getModel();
		// 	var oData = oModel.getData();
		// 	var iIndex = -1;
		// 	var oAppointment = {start: oStartDate,
		// 			                end: oEndDate,
		// 			                title: "new appointment",
		// 			                type: "Type09"};

		// 	if (oRow) {
		// 		iIndex = oPC.indexOfRow(oRow);
		// 		oData.people[iIndex].appointments.push(oAppointment);
		// 	} else {
		// 		var aSelectedRows = oPC.getSelectedRows();
		// 		for (var i = 0; i < aSelectedRows.length; i++) {
		// 			iIndex = oPC.indexOfRow(aSelectedRows[i]);
		// 			oData.people[iIndex].appointments.push(oAppointment);
		// 		}
		// 	}

		// 	oModel.setData(oData);

		// },

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
			}
			// onAfterRendering: function() {
			// 	var containerSideBar =  sap.ui.getCore().byId("__panel0");
			// 	containerSideBar.oParent.aCustomStyleClasses=["sapUiRespGridSpanL3", "sapUiRespGridSpanM5", "sapUiRespGridSpanS12", "sapUiRespGridSpanXL3"];

		// 	var containerFloorSelector =  sap.ui.getCore().byId("__grid1");
		// 	containerFloorSelector.oParent.aCustomStyleClasses=["sapUiRespGridSpanL3", "sapUiRespGridSpanM7", "sapUiRespGridSpanS12", "sapUiRespGridSpanXL3"];

		// 	var containerMatrix =  sap.ui.getCore().byId("__bar1");
		// 	containerMatrix.oParent.aCustomStyleClasses=["sapUiRespGridSpanL6", "sapUiRespGridSpanM7", "sapUiRespGridSpanS12", "sapUiRespGridSpanXL6"];

		// 	var containerFooter =  sap.ui.getCore().byId("__table0");
		// 	containerFooter.oParent.aCustomStyleClasses=["sapUiRespGridSpanL9", "sapUiRespGridSpanM7", "sapUiRespGridSpanS12", "sapUiRespGridSpanXL9"];

		// },
		//  handleRouteMatched: function (oEvent) {

		// var oParams = {}; 

		// if (oEvent.mParameters.data.context) { 
		//     this.sContext = oEvent.mParameters.data.context;
		//     var oPath; 
		//     if (this.sContext) { 
		//         oPath = {path: "/" + this.sContext, parameters: oParams}; 
		//         this.getView().bindObject(oPath);
		//     } 
		// }

		//      },
	});
});