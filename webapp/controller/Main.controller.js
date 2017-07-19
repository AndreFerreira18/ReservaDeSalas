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

	// $("#floorList").load(function() {
	// 	alert("Image loaded");
	// 	this._refreshShownFloors();
	// });

	return BaseController.extend("odkasfactory.reservasalas.controller.Main", {
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
		onInit: function() {
			// defines the model of the floor selector
			this.minVisibleFloor = 2;
			this.maxVisibleFloor = 5;
			var self = this;
			var vBox = this.getView().byId("floorList");
			var oModel = new JSONModel();
			oModel.attachEventOnce("requestCompleted",function() {
				vBox.setModel(oModel);
				vBox = self._refreshShownFloors(vBox); // not working
				return console.log("Request Completed");
			}).loadData("/webapp/mockdata/floors.json");
			

			// this.mBindingOptions = {};
			// this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.oRouter.getTarget("Main").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
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
		}
	});
});