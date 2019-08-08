var config='';
var api_secret='';
var api_secret='';
var configured_embedcodes={};
configured_embedcodes["assets"]=[];

$( document ).ready(function() {

	
	document.getElementById('files').addEventListener('change', handleFileSelect, false);
	var time = Math.floor(Date.now() / 1000) +300;
  
});	

function updateAPIKeys(){
  api_key= $("#ooyala-api-key").val().trim();
  api_secret= $("#ooyala-api-secret").val().trim();
}

function ImplementChange(embedcode){

  console.log('clicked Button:'+embedcode);
  updateAPIKeys();
  var o = searchEmbedCode(embedcode,config.assets);
  var p = { stream_urls: o.stream_urls};
  var time = Math.floor(Date.now() / 1000) +10;
  update_embedcode(embedcode,api_key,api_secret,time,JSON.stringify(p));
  console.log('foo');
}

function searchEmbedCode(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].embed_code === nameKey) {
            return myArray[i];
        }
    }
}

function log(message) {
  $('#output').prepend('<p>' + new Date().toLocaleString() + ' : ' +message + '</p>');
};


function getCurrentConfig(embedcode,api_key,api_secret,expires){
	$.ajax({
        type: "GET",
        url: "https://api.ooyala.com/v2/assets/"+embedcode+"?api_key="+api_key+"&expires="+expires+"&signature="+getSignature(api_secret,api_key,"GET",
        	"/v2/assets/"+embedcode,expires,''),

        dataType: "text",
        success: function(data) {
        
          var embed = {};
          var json = JSON.parse(data);
          console.log(data);
          embed["embed_code"]= json.embed_code;
          embed["stream_urls"] = {};
          embed["stream_urls"]["ipad"]=json.stream_urls.ipad;
          embed["stream_urls"]["iphone"]=json.stream_urls.iphone;
          embed["stream_urls"]["flash"]=json.stream_urls.flash;
          embed["stream_urls"]["smooth"]=json.stream_urls.smooth;
          embed["description"]=json.description;
        	
          configured_embedcodes["assets"].push(embed);
          jsondata=JSON.stringify(configured_embedcodes);
        	console.log(jsondata);
         
          log(JSON.stringify(data,undefined, 2));
          log("successfully queried");
        },
        error: function (data, textStatus, errorThrown) {
        	 log(JSON.stringify(data,undefined, 2));
           log("error getting info about the asset");
        }
        });
}


function getConfig(embedcode,api_key,api_secret,expires){
 
}

function update_embedcode(embedcode,api_key,api_secret,expires,json){
$.ajax({
        type: "PATCH",
        url: "https://api.ooyala.com/v2/assets/"+embedcode+"?api_key="+api_key+"&expires="+expires+"&signature="+getSignature(api_secret,api_key,"PATCH",
          "/v2/assets/"+embedcode,expires,json),
        data: json,
        dataType: "text",
        success: function(data){
           console.log("updated successfully"+data);
         
           log(JSON.stringify(data,undefined, 2));
           log("successfully updated");
        },
        error: function (data, textStatus, errorThrown) {
          console.log(data);
          log(JSON.stringify(data,undefined, 2));
          log("error updating the asset");
        }
        });
}

function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function Sync(){
  updateAPIKeys();

  configured_embedcodes["assets"]=[];



  for (var i = config.assets.length - 1; i >= 0; i--) {
      var time = Math.floor(Date.now() / 1000) +300;
      getCurrentConfig(config.assets[i].embed_code,api_key,api_secret,time);
  };

}

function Download(){
      var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(configured_embedcodes),null,2));
    pom.setAttribute('download', "ooyala-config.json");

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }


}

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
     f = files[0];
      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          // Render thumbnail.
         JsonObj = e.target.result
         config=JSON.parse(JsonObj);
         $('#resultstable').empty();
         var html='';  
          for (i = 0; i < config.assets.length; i++) { 
      	   html += '<tr><td><p class="text-left">'+config.assets[i].description+'</p></td>' +
      	   '<td><p class="text-left">'+config.assets[i].embed_code+'</p></td>'+
           '<td><button onclick="ImplementChange(\''+config.assets[i].embed_code+'\');" type="button" class="btn btn-default btn-lg"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></button></td>'+
           '<td><button onclick="infoclick(\''+config.assets[i].embed_code+'\');" type="button" class="btn btn-default btn-lg"><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span></button></td>'+
      	   '</tr>'
     	  }
     	    $('#resultstable').append(html);
        };
      })(f);

      // Read in the image file as a data URL.
      reader.readAsText(f);		
}

function getSignature(secret, api_key,http_method, request_path, expires, request_body){
	var method = method || 'GET';
	console.log(method);
	var string_to_sign = secret + http_method + request_path + 'api_key='+api_key+ 'expires='+expires+request_body;
	console.log("before sign:"+string_to_sign)
	var shaObj = new jsSHA("SHA-256", "TEXT");
	shaObj.update(string_to_sign);
	var hash = shaObj.getHash("B64");
    var signature = encodeURIComponent(hash.substr(0,43).replace(/=*$/,''));
    console.log("after sign:"+signature);
    return signature;	
}

function infoclick(embedcode){
  var time = Math.floor(Date.now() / 1000) +300;
  updateAPIKeys();
   $.ajax({
        type: "GET",
        url: "https://api.ooyala.com/v2/assets/"+embedcode+"?api_key="+api_key+"&expires="+time+"&signature="+getSignature(api_secret,api_key,"GET",
          "/v2/assets/"+embedcode,time,''),

        dataType: "text",
        success: function(data) {
        
   
          var json = JSON.parse(data);
          $('#infotable').empty;
          $("#myModal").modal('show');    
          $("#modalheader").text("Stream URL info");        // initializes and invokes show immediately
          var html;
          var s = searchEmbedCode(embedcode,config.assets)
  html += '<tr><td><p class="text-left">embedcode</p></td><td>'+json.embed_code+'</td>'+
    '<tr><td><p class="text-left">Title</p></td><td>'+json.name+'</td>'+
    '<tr><td><p class="text-left">Description</p></td><td>'+json.description+'</td>'+
    '<tr><td><p class="text-left">ipad url</p></td><td>'+json.stream_urls.ipad+'</td>'+
    '<tr><td><p class="text-left">iphone url</p></td><td>'+json.stream_urls.iphone+'</td>'+
    '<tr><td><p class="text-left">flash url</p></td><td>'+json.stream_urls.flash+'</td>'+
    '<tr><td><p class="text-left">smooth url</p></td><td>'+json.stream_urls.smooth+'</td>'+
  '</tr>';

  $('#infotable').html(html);
 log(JSON.stringify(data,undefined, 2));
           log("successfully queried the asset information");

        },
        error: function (data, textStatus, errorThrown) {
                   log(JSON.stringify(data,undefined, 2));
           log("error getting info about the asset");
        }
        });
}
