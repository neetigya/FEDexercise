
/* Global Private Variables */
	
	/*private_api_key, private_user_id,private_format **must be** kept unchanged 
	 *used in request URL to the API	 */
	
	var private_api_key="api_key=a5e95177da353f58113fd60296e1d250";
	var private_user_id="user_id=24662369@N07";
	var private_format= "format=json&nojsoncallback=1";
	/*requests the 1st page to be loaded on page load and increases as the user scrolls down 
	 * to the bottom of the page, used to load the next page*/

	var currentPage =1;
	
	/*	extras -> variable to hold the extras field in URL to fetch varous fields from API
	 * 	imageURL -> variable to store the complete URL of the image
	 */
	var extras = "description";
	var imageURL = "";
/*Global Private Variables End*/

/*timeConverter function coverts time from unix timestamp to readable date format*/

function timeConverter(unix_timestamp){
	var date = new Date(unix_timestamp*1000);
	var formattedDate = "0"+ date.getMonth()+ " : " + date.getDate()+ " : " + date.getFullYear() +
						" "+ date.getHours()+ " : " + date.getMinutes()+ " : " + date.getSeconds();
    return formattedDate;
}

/* callBackOnPageLoad function is to complete 
 * the image URL and sending the cooncatenated URL's to the DOM  
 * to render onto the webpage
 * @param text - parameter response to the http request in the form of JSON
 * @param extras - extras to get Various Fields from API default is "description", used to sort 
 * callBackAfterSorting function triggers when sorting is requested takes parameter extras as sort by value
 */

var callBackOnPageLoad = function(text,extras){
		
		var imagePathBuilder = text["photos"]["photo"]; 
		var urlDefault = "";
		for (let i = 0; i < text["photos"]["photo"].length; i++) {
			var id = imagePathBuilder[i]["id"];
			var farm = imagePathBuilder[i]["farm"];
			var server = imagePathBuilder[i]["server"];
			var secret = imagePathBuilder[i]["secret"];
			var title = imagePathBuilder[i]["title"];
			var description = imagePathBuilder[i][extras];
			urlDefault = 'https://farm' + farm + '.staticflickr.com/' + server + '/' + id + '_' + secret + '.jpg'
			imageURL += '<div> <img src = "' + urlDefault + '" alt ="sorry could not load images" >'+ 
						'<h3>'+ title +'</h3>'+
						'<p>'+ description["_content"] + '</p></div>';
		}
		
		document.getElementById("images").innerHTML = imageURL;
}

var callBackAfterSorting = function(text,extras){
		var viewDescription = {
			"date_upload" : "date upload",
			"date_taken" : "date taken", 
			"views" : "views"
		}
		var readProperty = {
			"date_upload" : "dateupload",
			"date_taken" : "datetaken", 
			"views" : "views"
		}
		
		var urlDefault = "";
		imageURL = "";
		for (let i = 0; i < text.length; i++) {
			var id = text[i]["id"];
			var farm = text[i]["farm"];
			var server = text[i]["server"];
			var secret = text[i]["secret"];
			var read = text[i][readProperty[extras]];
			//console.log(extras)
			
			/* if it is date_upload convert it into readable date format
			 */
			if(extras == "date_upload"){
				read = timeConverter(read); 
			}
			
			urlDefault = 'https://farm' + farm + '.staticflickr.com/' + server + '/' + id + '_' + secret + '.jpg'
			imageURL += '<div><img src = "' + urlDefault + '" alt ="sorry could not load images" >' +
						'<h3>'+viewDescription[extras]+" : <span>"+read +'</span><h3></div>';
		}
		document.getElementById("images").innerHTML = "";
		document.getElementById("images").innerHTML = imageURL;
}


/* function getText is responsible to send HTTP get request to get the requested data based on the parameters passed
 * @param pageNO - is the current page no that will be incremented everytime used scrolls down to the bottom of the page and 
 * new page will be loaded	
 * @param extras - Default is "description" that fetched the image description displayed on the home page 
 * the extras parameter passed to the API URL gets other requested informations as well such as 
 * date upload, date taken and no of views, based on API documentation 
 * per_page field specifies the photos loaded per page. is set to 25 in the variable URL	
*/

function getText(pageNO, extras){
	var request; 
	if (window.XMLHttpRequest) {
	    	request = new XMLHttpRequest();
	    } 
	    else {
	  	    request = new ActiveXObject("Microsoft.XMLHTTP");
		}
	var URL = "https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&"+
			   private_api_key+"&"+private_user_id+"&"+private_format+
			   "&per_page=25&page="+pageNO+"&extras="+extras;
	
	request.onreadystatechange = function(){
		if(request.readyState === 4 && request.status === 200){
				if(extras !== "" & extras !== "description"){
						/*gets called when sorting by parameter is requested, extras is the parameter passed*/
						callBackAfterSorting(Sort(JSON.parse(request.responseText), extras),extras);
						extras = "";
				}
				else{
						/*called on page load and scroll event*/
						callBackOnPageLoad(JSON.parse(request.responseText),extras);
				}
		}
	};
	request.open("GET", URL,true);
	request.send();
}

/* current page specifies the page no field of API
 * event listener for scroll event as user reaches to the bottom of the page
 * few pages are loaded, per page 25 photos with descriptions are loaded
 *
 *
*/

var passedSort = "description"; 
function setExtras(sortBy){
	this.passedSort = sortBy; 
}

/*Event Handler that fires up everytime user hits the bottom of the page 
 *as a result more contents are loaded by incrementing current page variable
 */

window.addEventListener("scroll", function(event){
	var wrapper = document.getElementById("images");
	var contentHeight = wrapper.offsetHeight;
	var yOffset = window.pageYOffset; 
	var y = yOffset + window.innerHeight; 
	if(y >= contentHeight-200){
		currentPage += 1 ;
		getText(currentPage, passedSort);
		event = event || window.event 
		if (event.stopPropagation) {
		        event.stopPropagation()
		} else {
		        event.cancelBubble = true; //for IE
		    }
		event.preventDefault(); 
		}
}, true);


/*Event Handler that fires up everytime sort buttons are clicked*/

var lis = document.getElementsByClassName("sortBy");	
for (var i = 0; i < lis.length; i++) {
		lis[i].addEventListener("click", function(){
			var sortBy = this.getAttribute("name");
			setExtras(sortBy);
			getText(1, sortBy);	
	}); 
}	
/* This function is called when buttons are clicked to sort
 * the returned sorted values are passed to callBackAfterSorting function
 */
function Sort(jsonToSort,sortCriteria){
	var sorted = jsonToSort["photos"]["photo"]
	sorted.sort(function(a,b){
		return a[sortCriteria] - b[sortCriteria];
	});
	return sorted;
}

/* page load event for the first time page loads pass 1 as page no to be fetched
 * and extras as description	
 */
window.onload= getText(1, extras);
/* event handling at the click of home button reload the homepage	
*/
var homeButton = document.getElementById("home");
	homeButton.addEventListener("click", function(){
	location.href = "index.html";
});