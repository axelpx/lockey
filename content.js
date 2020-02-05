
window.onload = function() {
	
	// get source HTML
	var sourceHtml = document.documentElement.outerHTML;
	chrome.extension.sendMessage(null, sourceHtml);

	// get ID from url
	function getIdFromString(url,dlmtr,param) {
		parts = url.split(/[?&/]/);
		filteredParts = parts.filter(function (part) {
	  		return part.split(dlmtr)[0] === param;
		});
		result = filteredParts[0].split(dlmtr)[1];
		return result;
	}
	
	// initial user ID and tokern
	var startUrl = window.location.toString();
	console.log(startUrl);
	var username = getIdFromString(sourceHtml,"=","USER");
	var mrp = getIdFromString(sourceHtml,"=","MRP");

	console.log(username);
	console.log(mrp);

	// cases arrays
	var casesArray = [];
	var requestsArray = [];
	
	// responses arrays
	var responsesArray = [];

	// get cells
    var targetIDs = document.querySelectorAll('[class="x-grid3-cell-inner x-grid3-col-hpColHeading_mr"]');
	var targetIcon = document.querySelectorAll('[class="x-grid3-row-table"]');

	// compose avaliable cases list
	var i;
	for (i = 0; i < targetIDs.length; i++) {
	
		// get cases list
		var text = targetIDs[i].textContent || targetIDs[i].innerText;
		casesArray[i] = text;
		console.log(text);
		
		// forge link
		requestsArray[i] = 'https://footprints.intermedia.net/MRcgi/MRTicketPage.pl?USER=' + username + '&MRP=' + mrp + '&MAJOR_MODE=DETAILS&MAXMININC=&MRNUMBERLIST=&LASTID=&ABN=&GRPDETAIL=&HISTORYKEY=&FROM_CROSS_PROJ_SEARCH=1&MR=' + casesArray[i] + '&PROJECTID=1&RUNNING_IN_POPUP=1';	
	}
	
	Promise.all(requestsArray.map(url => fetch(url)))
	.then(resp => Promise.all( resp.map(r => r.text())))
	.then(result => {
		responsesArray = result;
		var i;
		for (i = 0; i < responsesArray.length; i++) {
			if (responsesArray[i].includes("This Case was locked for edit") == true) {
				console.log("LOCKED: " + casesArray[i])
				var custom_icon = document.createElement('img');
				custom_icon.src = chrome.extension.getURL('images/lock.png');
				targetIcon[i].appendChild(custom_icon);
			}
		}
	});
}
