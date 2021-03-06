var csv = require('csv');
var http = require('http');



var csvfile = process.argv[2]; 		//get the filename from the command line
var stoponerror = process.argv[3]; 	//get the stoponerror from the command line
var totalScore = 0;
var possTotal = 0;

//we need at least the csvfile
if (!csvfile)
{
	console.log ("Usage node codeharness.js filename ");
	process.exit(1);
}

function intersect(a, b) {
    var results = [];

	for (var i = 0; i < a.length; i++) {
    	if (b.indexOf(a[i]) !== -1) {
        	results.push(a[i]);
    	}
    }
    return results;
}

csv()
.from.path(csvfile, { columns: true, delimiter: "\t" } )


// on each record, populate the map and check the codes
.on('record', function (data, index) 
{
	
	title = data.title;
	short_description = data.short_description;
	long_description = data.long_description;
	
	total_desc = title+short_description+long_description;
	
	var codes = data.aiddata_activity_code.split("|");
	codes = codes.map(function (val) { return val; });
	
	var request = require("request");
	
	var options = 
	{
    	url: 'http://localhost:3000/classify.json?description='+total_desc,
    	codes:  codes,
	};
	
	function callback(error, response, body) 
	{
    	if (!error && response.statusCode == 200) {
        	var info = JSON.parse(body);
        	reported_codes = info.length;
        	human_codes = this.req.res.request.codes;
        	var robo_codes = [];
        	for (y = 0; y < reported_codes; y++)
        	{
        		robo_codes.push(info[y].formatted_number);
        		//console.log(info[y].formatted_number);
        	}
        	
        	
        	matched_arr = intersect(human_codes,robo_codes);
        	thisScore = 0;
    
    		possTotal += human_codes.length;
    		
        	if (reported_codes > 0)
        	{
        		thisScore = (matched_arr.length/reported_codes)*human_codes.length;
        		totalScore += thisScore;
        	}
        	
        	//console.log("Matched Codes "+matched_arr.length);
        	//console.log("Human Codes "+human_codes.length);
        	//console.log("Auto Codes "+robo_codes.length);
        	console.log("Round Score: "+ thisScore);
        	console.log("Possible Round Score: "+ human_codes.length);
        	console.log("Possible Total: "+possTotal);
        	console.log("Total Score: "+ totalScore);
        	console.log("Rank: "+(totalScore/possTotal)*100);
        	console.log("--------------------");
        	
        	
        	
        	
    	}
    	//console.log(this.req.res.request.codes);
	}

request(options, callback);
 
	
}); 
