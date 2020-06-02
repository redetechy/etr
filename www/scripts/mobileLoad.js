var promises = [];
var versionChanged = false;
var dt = new Date();

// Create onerror handler to log uncaught exceptions to the server side log, but only if there 
// is no such handler already.
// Must use "typeof window" here, because in NodeJs, window is not defined at all, so cannot refer to window in any way.
if (typeof window !== 'undefined' && !window.onerror) {
    window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
		//alert("in window.onerror...");
		//alert(errorMsg);
		console.log(errorMsg);
		console.log(url);
		console.log(lineNumber);
		console.log(column);
		console.log(errorObj);
		try {
			showLoadingError("Unhandled Error - " + errorMsg);
		} catch(err) {
			alert("Error in setting Loading Message " + err);
		}
        return false;
    };
}

// Deal with unhandled exceptions thrown in promises
if (typeof window !== 'undefined' && !window.onunhandledrejection) {
    window.onunhandledrejection = function (event) {
		//alert("in event...");
		console.log(event.reason);
		console.log(event.reason.message);
		try {
			showLoadingError("Unhandled Error - " + event.reason.message);
		} catch(err) {
			alert("Error in setting Loading Message " + err);
		}		
        return false;
    };
}

//window.addEventListener('DOMContentLoaded', function()
function onMobileLoad()
{
	console.log("onMobileLoad...");
	showLoadingMsg("Loading.");
	var isDashboardMap = false;
	//alert(window.location.href);
	//alert(document.location.href);
	
	if (document.location.href.indexOf("dashboardMap") != -1) {
		isDashboardMap = true;
		//alert("isDashboardMap is set to true...");
	}
	
	showLoadingMsg("Loading..");
	if (isDashboardMap == false) {
		try {
			document.addEventListener("deviceready", function() {
				// Register the event listener
				document.addEventListener("backbutton", function() {
					if (confirm('Are you sure you want to quit?')) {
						window.navigator.app.exitApp();
					} else {
						// Do nothing!
					}
				}, true);
			}, true);
		} catch(err) {
			//error handling
		}
	}

	showLoadingMsg("Loading...");
	//var ngApp = document.querySelectorAll('[ng-app]')[0];

	var lVersion = localStorage.getItem('version');
	if (lVersion == undefined) {
		console.log("lVersion is undefined");
	}

	var mobileJsonStr = localStorage.getItem('mobileJson');
	var lMobileJsonObj = undefined;
	if (mobileJsonStr != undefined) {
		lMobileJsonObj = JSON.parse(mobileJsonStr);
		console.log(lMobileJsonObj);
	} else {
		console.log("mobileJsonStr is undefined..");
	}
	console.log("localStorage lVersion is "+ lVersion);
	
	showLoadingMsg("Loading....");
	// Throw warning if angular is not found
	if(typeof angular == 'undefined')
	{
		console.warn("ng-include-controllers error: Angular not found, operation canceled.");
		showLoadingError("Angular not found, operation canceled");
	}

	showLoadingMsg("Loading.....");
	if (isDashboardMap == true) {
		//alert("Dashboard Map...loading directly...");
		//alert(lVersion);
		//alert(lMobileJsonObj);
		if (lVersion != undefined && lMobileJsonObj != undefined) {
			//alert("b4 loadJSCSSServerFiles");
			loadJSCSSServerFiles(lMobileJsonObj, lVersion);
		}
		//return;
	}
	
	var url = mobileBaseUrl + "/" + mobilePath + "/" + mobileAppName + ".mobile.json?_v="+dt.getTime();
	//console.log(url);

	showLoadingMsg("Checking App Version...");
	
	$.ajax({
            url: url,
            type: "GET",
            crossDomain: true,
			xhrFields: {
				withCredentials: true
			},
            dataType: "json",
            success: function (response) {
				var mobileJsonObj = response;
				var newVersion = mobileJsonObj.version;
				console.log("newVersion is " + newVersion);
				if ((lVersion == undefined) || (lVersion != newVersion)) {
					console.log("version changed!!");
					versionChanged = true;
				}
				loadJSCSSServerFiles(mobileJsonObj, mobileJsonObj.version, lVersion);
            },
            error: function (xhr, status) {
                //alert(status);
				//Check if app already loaded
				if (lVersion != undefined && lMobileJsonObj != undefined) {
					loadJSCSSServerFiles(lMobileJsonObj, lVersion);
				} else {
					showLoadingError("Not able to determine the version.");
				}				
            }
    });
	
	/*
	var xmlhttp = getXmlHttp();
	xmlhttp.ontimeout = function() {
		console.log("Timeout!!");
		showLoadingError(mobileAppName, "Timeout!!");
	}
	
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
			if (xmlhttp.status == 200) {
				var mobileJsonObj = JSON.parse(xmlhttp.responseText);
				var newVersion = mobileJsonObj.version;
				console.log("newVersion is " + newVersion);
				if ((lVersion == undefined) || (lVersion != newVersion)) {
					console.log("version changed!!");
					versionChanged = true;
				}
				loadJSCSSServerFiles(mobileJsonObj, mobileJsonObj.version, lVersion);
			} else if (xmlhttp.status == 404) {
				console.log("")
				//Check if app already loaded
				if (lVersion != undefined && lMobileJsonObj != undefined) {
					loadJSCSSServerFiles(lMobileJsonObj, lVersion);
				} else {
					showLoadingError("MobileJSON not found!!");
				}
			} else {
				console.log("Status is " + xmlhttp.status);
				alert(xmlhttp.status);
				alert(url);
				alert(xmlhttp.statusText);
				//Check if app already loaded
				if (lVersion != undefined && lMobileJsonObj != undefined) {
					loadJSCSSServerFiles(lMobileJsonObj, lVersion);
				} else {
					showLoadingError(mobileAppName);
				}
			}
		}
	};
	
	var url = mobileBaseUrl + "/" + mobilePath + "/" + mobileAppName + ".mobile.json?_v="+dt.getTime();
	//console.log(url);
	xmlhttp.open("GET", url, true);
	xmlhttp.withCredentials = true;
	xmlhttp.send();		
	console.log("completed onload..");
	*/
}

function getXmlHttp() {
	var xmlhttp;
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}	
	return xmlhttp;
}

function showLoadingMsg(msg) {
	console.log(msg);
	document.getElementById("loadingMsg").innerHTML=msg;
}
		
function showLoadingError(errorMsg) {
	showLoadingMsg("");
	var msg = "Problem loading App";
	if (errorMsg) {
		msg = msg + " (" + errorMsg + ")";
	}
	msg = msg +".  ";
			
	console.log(msg);
	document.getElementById("appLoadingErrorMsg").innerText=msg;
	document.getElementById("appLoadingInd").style.display="none";
	document.getElementById("appLoadError").style.display="block";
}

function loadJSCSSServerFiles(mobileJsonObj, newVersion, oldVersion) {
	
	if (newVersion != undefined && oldVersion != undefined && oldVersion != newVersion) {
		showLoadingMsg("Loading new version " + newVersion);
	} else {
		showLoadingMsg("Loading app version " + newVersion);
	}
	
	if (versionChanged == false) {
		// No version change
		console.log("Version not changed...loading cached version..");
		
		//Load CSS file
		for(var i = 0;i < mobileJsonObj.cssFiles.length;i++)
		{
			var promise = new Promise(function(resolve, reject) {
				var src = mobileJsonObj.cssFiles[i];
				//console.log(src);
				localforage.getItem(src, function(err, value) {
					//console.log("src - " + src + " value is " + value + " err " + err);
					if (value == null) {	
						console.log("value is null..");
					} else {
						loadJsCssContent(value, "css");
						resolve("done");
					}
				});
			});
				
			// Push promises to array to resolve them all together later on
			promises.push(promise);
		}
		
		//Load JS file
		for(var i = 0;i < mobileJsonObj.jsFiles.length;i++)
		{
			var promise = new Promise(function(resolve, reject) {
				var src = mobileJsonObj.jsFiles[i];
				//console.log(src);
				localforage.getItem(src, function(err, value) {
					//console.log("src - " + src + " value is " + value + " err " + err);
					if (value == null) {	
						console.log("value is null..");
					} else {
						loadJsCssContent(value, "js");
						resolve("done");
					}
				});
			});
				
			// Push promises to array to resolve them all together later on
			promises.push(promise);
		}
		
		// Resolve all promises then bootstrap the app
		// Without the use of promises, the bootstrap will start before all scripts are included
		// This results into an error
		Promise.all(promises).then(angular.bootstrap.bind(null, document, ['goTrackyApp']));	
	} else {
		// New version
		// Load CSS File
		for(var i = 0;i < mobileJsonObj.jsFiles.length;i++)
		{
			var promise = new Promise(function(resolve, reject) {
				var src = mobileJsonObj.jsFiles[i];
				console.log("src is " + src);
				
				var xmlhttp = getXmlHttp();
	
				xmlhttp.ontimeout = function() {
					console.log("Timeout!!");
					showLoadingError("Timeout for "+src);
				}
				xmlhttp.onreadystatechange = function() {
					if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
						if ( (xmlhttp.status == 200) || (xmlhttp.status == 304) ) {
							//console.log(xmlhttp.responseText);
							loadJsCssContent(xmlhttp.responseText, "js");
							localforage.setItem(src, xmlhttp.responseText);
							console.log("setting resolve bind for " + src);
							resolve("done");
						}
					}
				}
				xmlhttp.open("GET", mobileBaseUrl + "/" + mobilePath + "/" + src + "?_v="+dt.getTime(), true);
				xmlhttp.send();
			});
					
			// Push promises to array to resolve them all together later on
			console.log("pushing to promise..");
			promises.push(promise);
		}
		
		// Load CSS File
		for(var i = 0;i < mobileJsonObj.cssFiles.length;i++)
		{
			var promise = new Promise(function(resolve, reject) {
				var src = mobileJsonObj.cssFiles[i];
				console.log("src is " + src);
				
				var xmlhttp = getXmlHttp();
	
				xmlhttp.ontimeout = function() {
					console.log("Timeout!!");
					showLoadingError("Timeout for "+src);
				}
				xmlhttp.onreadystatechange = function() {
					if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
						if ( (xmlhttp.status == 200) || (xmlhttp.status == 304) ) {
							//console.log(xmlhttp.responseText);
							loadJsCssContent(xmlhttp.responseText, "css");
							localforage.setItem(src, xmlhttp.responseText);
							console.log("setting resolve bind for " + src);
							resolve("done");
						}
					}
				}
				xmlhttp.open("GET", mobileBaseUrl + "/" + mobilePath + "/" + src + "?_v="+dt.getTime(), false);
				xmlhttp.send();
			});
					
			// Push promises to array to resolve them all together later on
			console.log("pushing to promise..");
			promises.push(promise);
		}
		
		// Resolve all promises then bootstrap the app
		// Without the use of promises, the bootstrap will start before all scripts are included
		// This results into an error
		//console.log("checking for Promise.all");
		//Promise.all(promises).then(angular.bootstrap.bind(null, document, ['goTrackyApp']));
		//Promise.all(promises).then(values => {angular.bootstrap.bind(null, document, ['goTrackyApp'])});
				
		Promise.all(promises).then(function(values) {
			try {
				angular.element(document).ready(angular.bootstrap.bind(angular, document, ['goTrackyApp']));
				console.log("all done...");
				console.log("updating version in localStorage");
				localStorage.setItem('version', newVersion);
				localStorage.setItem('mobileJson', JSON.stringify(mobileJsonObj));
			} catch(err) {
				console.log("in catch..");
				console.log(err);
				showLoadingError("Unhandled Error Promise - " + err);
			}
		});
	}
}	

function loadJsCssContent(content, filetype){
	var fileref;
	if (filetype=="js") { //if filename is a external JavaScript file
		fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.text = content;
		//fileref.setAttribute("src", filename)
	}
	else if (filetype=="css") //if filename is an external CSS file
	{
		fileref=document.createElement("style");
		fileref.type = "text/css";
		fileref.innerHTML = content;
		//fileref.setAttribute("href", filename)
	}
	
	try {
		if (typeof fileref!="undefined")
			document.getElementsByTagName("head")[0].appendChild(fileref)
	} catch(err) {
	
	}
}
