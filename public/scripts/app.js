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




/* function getText is responsible to send HTTP get request to get the requested data based on the parameters passed
 * @param pageNO - is the current page no that will be incremented everytime used scrolls down to the bottom of the page and 
 * new page will be loaded	
 * @param extras - Default is "description" that fetched the image description displayed on the home page 
 * the extras parameter passed to the API URL gets other requested informations as well such as 
 * date upload, date taken and no of views, based on API documentation 	
*/

function getText(pageNO, extras){
	
	var request; 
	if (window.XMLHttpRequest) {
	    	request = new XMLHttpRequest();
	    } 
	    else {
	  	    request = new ActiveXObject("Microsoft.XMLHTTP");
		}
	var URL = "https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&"+private_api_key+"&"+private_user_id+"&"+private_format+"&per_page=55&page="+pageNO+"&extras="+extras;
	
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