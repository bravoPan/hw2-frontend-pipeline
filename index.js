var filename = null;
var encoded = null;
var type = null;
var fileExt = null;

var readerStr = null;

window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const synth = window.speechSynthesis;
const recognition = new SpeechRecognition();

function previewFile(input) {
    var reader = new FileReader();
    reader.readAsDataURL(input.files[0]);
    type = input.files[0].type;
    filename = input.files[0].name;
    console.log(type)


    reader.onload = function (e) {
        console.log(reader.result.toString());

        readerStr = reader.result.toString();

        encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
        if ((encoded.length % 4) > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
  }
}

function upload(input) {
    // last_index_quote = encoded.lastIndexOf('"');
    // if (fileExt == 'jpg' || fileExt == 'jpeg') {
    //     encodedStr = encoded.substring(33, last_index_quote);
    // }
    // else {
    //     encodedStr = encoded.substring(32, last_index_quote);
    // }
    var apigClient = apigClientFactory.newClient({ apiKey: "84PGcnVgWL4Bu8KbQGtuS1hAmDdixphY8psrfZtQ" });
    var params = {
        "file": filename,
        "bucket": "photobucket-b2",
        "x-amz-meta-customLabels": input,
        "Content-Type": "image/jpeg;base64",
        "Accept": '*/*'
    };

    var additionalParams = {
        headers: {
        // "ContentEncoding": 'base64',
        "Access-Control-Allow-Origin": '*',
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": 'ContentEncoding,Accept,Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-amz-meta-customlabels,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Access-Control-Allow-Headers',
        "Access-Control-Allow-Methods": 'OPTIONS,PUT'
        }
    };

    console.log(encoded)

    apigClient.uploadBucketFilePut(params, encoded, additionalParams)
        .then(function (result) {
        console.log('success OK');
        console.log(result);
        alert("Photo uploaded successfully!");
        }).catch(function (result) {
        console.log(result);
        });
}

function voiceSearch() {
    recognition.onstart = function(){
        $("#search").val("Voice search is on. Speak to begin..")
    }
    recognition.start();
    recognition.onresult = (event) => {
        $("#voiceinstr").empty();
        const speechToText = event.results[0][0].transcript;
        $("#search").val(speechToText);
        // console.log(speechToText)

        var apigClient = apigClientFactory.newClient({ apiKey: "84PGcnVgWL4Bu8KbQGtuS1hAmDdixphY8psrfZtQ" });
        var params = {
        "q": speechToText
        };
        var body = {
        "q": speechToText
        };

        var additionalParams = {
        headers: {
            "Access-Control-Allow-Origin": '*',
            "Access-Control-Allow-Credentials": true,
            "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-amz-meta-customlabels,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Access-Control-Allow-Headers',
            "Access-Control-Allow-Methods": 'GET,OPTIONS'
        }
        };

    apigClient.searchGet(params, body, additionalParams)
      .then(function (result) {
        console.log('success OK');
        showImages(result["data"]["body"]["results"]);
        console.log(result["data"]["body"]["results"]);
      }).catch(function (result) {
        console.log(result);
        console.log(speechToText);
      });
  }
}


function search() {
  var searchTerm = $("#search").val();
  var apigClient = apigClientFactory.newClient({ apiKey: "84PGcnVgWL4Bu8KbQGtuS1hAmDdixphY8psrfZtQ" });
  var params = {
    "q": searchTerm
  };
  var body = {
    "q": searchTerm
  };

  var additionalParams = {
    headers: {
        "Access-Control-Allow-Origin": '*',
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-amz-meta-customlabels,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Access-Control-Allow-Headers',
        "Access-Control-Allow-Methods": 'GET,OPTIONS'
    }
  };
  console.log(searchTerm);
  apigClient.searchGet(params, body, additionalParams)
    .then(function (result) {
      console.log(result["data"]["body"]["results"]);
      showImages(result["data"]["body"]["results"]);
    }).catch(function (result) {
      console.log(result);
    });
}

function display(index, item){
    var result_image= $("<div class='col-md-4'></div>");
    var block = $("<div class='image'></div>");
    let res_img = $("<img class='result_img' src='" + item + "'>");
    block.append(res_img);
    result_image.append(block);

    return result_image
}

function showImages(res) {
    var newDiv = $("#images");
    newDiv.empty();
    if(newDiv.val != 'undefined' && newDiv != null){
        while (newDiv.firstChild) {
            newDiv.removeChild(newDiv.firstChild);
        }
    }
    console.log(res)
    if (res == undefined || res.length == 0) {
        var newContent = $("<p>No matching Results</p>");
        newDiv.append(newContent);
        // var currentDiv = document.getElementById("div1");
        // document.body.insertBefore(newDiv, currentDiv);
    } else {
        // var newDiv = document.getElementById("div");
        // newDiv.style.display = 'inline'
        // var newContent = document.createElement("img");
        // newContent.src = res[i];
        // newDiv.appendChild(newContent);
        // var currentDiv = document.getElementById("div1");
        // document.body.insertBefore(newDiv, currentDiv);
        $.each(res, function(index, item){
            console.log(item);
            var img = display(index, item);
            $("#images").append(img);
        });
    }
};


$(document).ready(function(){
    $("#img").on('change', function(){
        previewFile(this);
    });

    $(".mybtn").click(function(){
        var customLabels = $("#customlabels").val();
        upload(customLabels);
    });

    $("#search").keypress(function(event){
        if(event.keyCode === 13) {
            event.preventDefault();
            search();
        }
    });

    $("#voice").click(function(){
        voiceSearch();
    });
})
