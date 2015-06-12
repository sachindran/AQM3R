function changePage(page){
        $(page).bind("callback", function(e, args) {
            alert(args.mydata);
        });
        $.mobile.changePage( $(page), "pop", true, true);
        $("page").trigger("callback");
    }
angular.module('mapsApp', ['ui.bootstrap'])
.controller('MapController', function($http,myService,Scopes,$location) {
  var mapCont = this;
  mapCont.portsLabel = "Ports";
  var url = "http://thekbsystems.com/SummerAcademicTraining/BrazilProgramWebService.asmx/RetrieveFacilityDetails";
  $http({
    url: url,
    dataType: 'json',
    method: 'POST',
    data: '',
    headers: 
    {
      "Content-Type": "application/json"
    }
  }).
  success(function(response)
  {
    mapCont.obj = JSON.parse(response.d);
    mapCont.portCordList = mapCont.obj;
    mapCont.portSelected = mapCont.portCordList[0].FacilityId;
    //mapCont.portsLabel = mapCont.portCordList[0].FacilityName;  
    $("#portListSel").trigger("refresh");
    $('#portListSel').val(0);
    
  }).
  error(function(error)
  {
    mapCont.error = error;
  });
  url = "http://thekbsystems.com/SummerAcademicTraining/BrazilProgramWebService.asmx/RetrievePegDetailsinFacility";
  $http({
    url: url,
    dataType: 'json',
    method: 'POST',
    data: '',
    headers: 
    {
      "Content-Type": "application/json"
    }
  }).
  success(function(response)
  {
    mapCont.obj = JSON.parse(response.d);
    mapCont.groupDetails = mapCont.obj;
    var myLatlng = new google.maps.LatLng(mapCont.groupDetails[0].Latitude,mapCont.groupDetails[0].Longitude);
  //mapCont.map.setCenter(myLatlng)
  var mapOptions = {
    center: myLatlng,
    zoom: 18,
    mapTypeId: google.maps.MapTypeId.SATELLITE
  };
      //var myLatlng = new google.maps.LatLng(mapCont.portCordList[0].FacilityLatitude,mapCont.portCordList[0].FacilityLongitude);
      mapCont.map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
      
      mapCont.markersSet();
    }).
  error(function(error)
  {
    mapCont.error = error;
  });
  var height = $( document ).height()-150;
  var width = $( document ).width()-32;
  $('#map-canvas').css({'height':height,'width':width});
  
  mapCont.onchange = function(id)
  {
    alert(id.portName);
  };

  mapCont.portChange = function (id) {
      //alert(id.portName);
      mapCont.portsLabel = id.FacilityName;
      var myLatlng = new google.maps.LatLng(id.FacilityLatitude,id.FacilityLongitude);


      
      var mapOptions = {
        center: myLatlng,
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.SATELLITE
      };

      mapCont.map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
      var image = "img/img1.jpg";
      mapCont.markersSet();
    };

    mapCont.markersSet = function () {
      var marker;
      var myLatlng;
      $.each(mapCont.groupDetails, function(index, element)   {
        var image = {url: 'img/Icons/number_'+(element.PegName)+'.png'};
        myLatlng = new google.maps.LatLng(element.Latitude,element.Longitude);
        marker = new google.maps.Marker({
            animation: google.maps.Animation.DROP,
            position: myLatlng,
            icon : image,
            title: ""+element.PegId
        });
        google.maps.event.addListener(marker, 'click', function() {
          mapCont.showGroupDetails(element);
        });
        marker.setMap(mapCont.map);
      });
       $("#portListSel").trigger("refresh");
    //$('#portListSel').val(0);
    //$("select option:contains(fish)").prop('selected', 'selected');

    $('#portListSel').delay( 800 ).selectmenu('refresh', true);
    }

    mapCont.showGroupDetails = function(groupData) 
    {
      var sharedData = {GroupId : groupData.PegId,PortId : groupData.FacilityId}
      myService.setData(sharedData);
      Scopes.store('sharedData',sharedData);
      sessionStorage.setItem("PegId", groupData.PegId);
      sessionStorage.setItem("FacilityId", groupData.FacilityId);
      //open("studentDetails.html");
      //changePage("#studentDetails");
      window.location="studentDetails.html";
    }
  })
.factory('Scopes', function ($rootScope) {
  var mem = {};

  return {
    store: function (key, value) {
      $rootScope.$emit('scope.stored', key);
      mem[key] = value;
    },
    get: function (key) {
      return mem[key];
    }
  };
})
.service('myService', function() {
 var savedData = [];
 
 var setData = function(data) {
   savedData = data;
 };
 var getData = function() {
  return savedData;
};

return {
  setData: setData,
  getData: getData
};

})
.controller('StudentDetailsController', function ($scope, $http, myService, Scopes, $modal, $log) {
  var studentaData = this;
  studentaData.PegId = sessionStorage.getItem('PegId');
  studentaData.FacilityId = sessionStorage.getItem('FacilityId');
  
  var height = $( "#homeButton" ).height()+27;
  $('#stuHeader').css({'height':height});
    //alert("PegId : "+ studentaData.PegId+"\n FacilityId : "+studentaData.FacilityId);
    url = "http://thekbsystems.com/SummerAcademicTraining/BrazilProgramWebService.asmx/RetrievePollutantandStudentDetails";
    $http({
      url: url,
      dataType: 'json',
      method: 'POST',
      data: {FacilityId : studentaData.FacilityId, PegId:studentaData.PegId},
      headers: 
      {
        "Content-Type": "application/json"
      }
    }).
    success(function(response)
    {
      studentaData.obj = JSON.parse(response.d);
      studentaData.groupDetails = studentaData.obj;
      //mapCont.markersSet();
    }).
    error(function(error)
    {
      studentaData.error = error;
    });

    studentaData.showGraph = function(data)
    {
      url = "http://thekbsystems.com/SummerAcademicTraining/BrazilProgramWebService.asmx/RetrievePollutantValues";
      $http({
        url: url,
        dataType: 'json',
        method: 'POST',
        data: {RecordId : data.RecordId},
        headers: 
        {
          "Content-Type": "application/json"
        }
      }).
      success(function(response)
      {
        studentaData.obj = JSON.parse(response.d);
        studentaData.graphData = studentaData.obj;
        studentaData.plotGraph(studentaData.graphData);
      }).
      error(function(error)
      {
        studentaData.error = error;
      });
    }

    studentaData.plotGraph =  function drawVisualization(data) {        

      var dataTable = new google.visualization.DataTable();
      dataTable.addColumn('string', 'RecordedTime');
      dataTable.addColumn('number', data[0].PollutantName);
      if (data[0].Norm1Hr != null)
        dataTable.addColumn('number', data[0].PollutantName + " --1Hr");
      if (data[0].Norm8Hr != null)
        dataTable.addColumn('number', data[0].PollutantName + " --8Hr");
      if (data[0].Norm24Hr != null)
        dataTable.addColumn('number', data[0].PollutantName + " --24Hr");   

      for (var i = 0; i < data.length; i++) {
        var row = [];
        row.push(data[i].RecordedTime);
        row.push(data[i].PollutantValue);
        if (data[0].Norm1Hr != null)
          row.push(data[i].Norm1Hr);
        if (data[0].Norm8Hr != null)
          row.push(data[i].Norm8Hr);
        if (data[0].Norm24Hr != null)
          row.push(data[i].Norm24Hr);            
        dataTable.addRow(row);
      }

      var options = {
        title: 'Pollutant Value by Time',
        vAxis: { title: data[0].Units },
        hAxis: { title: "Time" },
        seriesType: "line",
        series: { 0: { type: "line",lineWidth: 1,pointSize: 5}        
      },

    };

    var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
    chart.draw(dataTable, options);
  }

  studentaData.showModal = function(selectedRow){
    $scope.row = selectedRow;
    sessionStorage.setItem("selectedRowId", selectedRow.RecordId);
      //sessionStorage.setItem("FacilityId", groupData.FacilityId);
      $scope.open('lg');
    }
    $scope.items = ['item1', 'item2', 'item3'];

    $scope.animationsEnabled = true;

    $scope.open = function (size) {

      var modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'myModalContent.html',
        controller: 'ModalInstanceCtrl',
        size: size,
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

    $scope.toggleAnimation = function () {
      $scope.animationsEnabled = !$scope.animationsEnabled;
    };

    studentaData.goBack  = function () {
        window.history.back();
        return false;
    }
  })
.controller('ModalDemoCtrl', function ($scope, $modal, $log) {

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;

  $scope.open = function (size) {

    var modalInstance = $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

})
.controller('ModalInstanceCtrl', function ($http, $scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selectedRowId = sessionStorage.getItem('selectedRowId');
  
  url = "http://thekbsystems.com/SummerAcademicTraining/BrazilProgramWebService.asmx/RetrievePollutantValues";
  $http({
    url: url,
    dataType: 'json',
    method: 'POST',
    data: {RecordId : $scope.selectedRowId},
    headers: 
    {
      "Content-Type": "application/json"
    }
  }).
  success(function(response)
  {
    $scope.obj = JSON.parse(response.d);
    $scope.graphData = $scope.obj;
    $scope.plotGraph($scope.graphData);
        //studentaData.plotGraph(studentaData.graphData);
      }).
  error(function(error)
  {
    studentaData.error = error;
  });


  $scope.plotGraph =  function (data) {        

    var dataTable = new google.visualization.DataTable();
    var height = $(document).height() - 225; 
    $('#chart_div').css({'height':height});
    
    dataTable.addColumn('string', 'RecordedTime');
    dataTable.addColumn('number', data[0].PollutantName);
    if (data[0].Norm1Hr != null)
      dataTable.addColumn('number', data[0].PollutantName + " --1Hr");
    if (data[0].Norm8Hr != null)
      dataTable.addColumn('number', data[0].PollutantName + " --8Hr");
    if (data[0].Norm24Hr != null)
      dataTable.addColumn('number', data[0].PollutantName + " --24Hr");   

    for (var i = 0; i < data.length; i++) {
      var row = [];
      row.push(data[i].RecordedTime);
      row.push(data[i].PollutantValue);
      if (data[0].Norm1Hr != null)
        row.push(data[i].Norm1Hr);
      if (data[0].Norm8Hr != null)
        row.push(data[i].Norm8Hr);
      if (data[0].Norm24Hr != null)
        row.push(data[i].Norm24Hr);            
      dataTable.addRow(row);
    }

    var options = {
      title: 'Pollutant Value by Time',
      vAxis: { title: data[0].Units },
      hAxis: { title: "Time" },
      seriesType: "line",
      series: { 0: { type: "line",lineWidth: 1,pointSize: 5}        
    },


  };

  var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
  chart.draw(dataTable, options);  
}

$scope.selected = {
  item: $scope.items[0]
};

$scope.ok = function () {
  $modalInstance.close($scope.selected.item);
};

$scope.cancel = function () {
  $modalInstance.dismiss('cancel');
};
});
