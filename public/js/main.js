'use strict';

// These will be initialized later
var recognizer, isRecognizerReady, recorder, callbackManager, audioContext, outputContainer;

var startBtn = document.getElementById('startBtn');
var stopBtn = document.getElementById('stopBtn');
var recordingIndicator = document.getElementById('recordingIndicator');
var currentStatus = document.getElementById('currentStatus');

// Only when both recorder and recognizer do we have a ready application
var isRecorderReady = isRecognizerReady = false;
var keyword_spotted = false;
/* A convenience function to post a message to the recognizer and associate
 * a callback to its response
 */
function postRecognizerJob(message, callback) {
  var msg = message || {};

  if (callbackManager) {
    msg.callbackId = callbackManager.add(callback);
  }

  if (recognizer) {
    recognizer.postMessage(msg);
  }
}

/* This function initializes an instance of the recorder
 * it posts a message right away and calls onReady when it
 * is ready so that onmessage can be properly set
 */
function spawnWorker(workerURL, onReady) {
  recognizer = new Worker(workerURL);

  recognizer.onmessage = function(event) {
    onReady(recognizer);
  };

  recognizer.postMessage('');
}

// To display the hypothesis sent by the recognizer
function updateHyp(hyp) {
  //console.log("Hyyypp :"+hyp+":");
  if (outputContainer) {
    outputContainer.innerHTML = hyp;

  }
}

function authGoogleTransform()
{
  var usercommand = new Object();
  usercommand.keyword = keyword_spotted;
  usercommand.detected_text = "";
  usercommand.intent = "";
  //Test AJAX call to backend
  $.ajax({
    url: '/speech',
    data: {
      jsonData: JSON.stringify(usercommand)
      // or jsonData: JSON.stringify(credentials)   (newest browsers only)
      },
    dataType: 'json',
    type: 'POST',
    success: function(items) {
        /* do something with items here */
        // You will likely want a template so you don't have to format the string by hand

        console.log(items);
        console.log(items.keyword);
        console.log(items.detected_text);
        console.log(items.intent);
        process_intent(items.intent, items.detected_text);


    }
 });
}


function process_intent(intent,txt) {
    if(intent=="unknown")
    {
      update_chat(true,txt);
      update_chat(false,"I am sorry, This function is not yet implemented!");
    }
    if(intent=="cur-time")
    {
      var timestamp = current_time();
      update_chat(true,txt);
      update_chat(false,"Sure, Its " + timestamp + " now!");
    }
}

function update_chat(isUser, txt) {
  var timestamp = current_time();
  if(isUser)
  {
      //Load alternate chat css
      document.getElementById("chat-window").innerHTML += "<div class=\"speech-wrapper\"><div class=\"bubble alt\"><div class=\"txt\"><p class=\"name alt\">Saumya</p><p class=\"message\">"+txt+"</p><span class=\"timestamp\">"+timestamp+"</span></div><div class=\"bubble-arrow alt\"></div></div></div></br>";
  }
  else
  {
      //Load chat css
      document.getElementById("chat-window").innerHTML += "<div class=\"speech-wrapper\"><div class=\"bubble\"><div class=\"txt\"><p class=\"name\">Sydney</p><p class=\"message\">"+txt+"</p><span class=\"timestamp\">"+timestamp+"</span></div><div class=\"bubble-arrow\"></div></div></div>";
  }
}

function current_time()
{
  var d = new Date(); // for now
  var timestamp = d.getHours() +":"+d.getMinutes()+":"+d.getSeconds();
  return timestamp;
}
/*
 * This updates the UI when the app might be ready.
 * Only when both recorder and recognizer are ready do we enable the buttons.
 */
function updateUI() {
  if (isRecorderReady && isRecognizerReady) {
    startBtn.disabled = stopBtn.disabled = false;
  }
}

// This is just a logging window where we display the status
function updateStatus(newStatus) {
  currentStatus.innerHTML += ('<br/>' + newStatus);
}

// A not-so-great recording indicator
function displayRecording(display) {
  if (display) {
    recordingIndicator.style.display = 'inline-block';
  } else {
    recordingIndicator.style.display = 'none';
  }
}

/* Callback function once the user authorizes access to the microphone
 * in it, we instantiate the recorder
 */
function startUserMedia(stream) {
  var input = audioContext.createMediaStreamSource(stream);

  // Firefox hack https://support.mozilla.org/en-US/questions/984179
  window.firefox_audio_hack = input;

  var audioRecorderConfig = {errorCallback: function(x) {updateStatus('Error from recorder: ' + x);}};

  recorder = new AudioRecorder(input, audioRecorderConfig);

  // If a recognizer is ready, we pass it to the recorder
  if (recognizer) {
    recorder.consumers = [recognizer];
  }

  isRecorderReady = true;
  updateUI();
  updateStatus('Audio recorder ready');
}

// This starts recording.
function startRecording() {
  if (recorder && recorder.start()) {
    //Changes for Binary server
    var client = new BinaryClient('ws://localhost:9001');
    client.on('open', function() {
      window.BinaryReady = true;
      window.BinaryServer = client.createStream();
    });
    displayRecording(true);
    //My changes for BinaryServer


  }
}

// Stops recording
function stopRecording() {
  recorder && recorder.stop();
  //BinaryServer
  //window.BinaryReady = false;
  //window.BinaryServer.end();
  displayRecording(false);
  //if(keyword_spotted)
  //{
  //  authGoogleTransform();
  //}
  //keyword_spotted = false;
}

/* Called once the recognizer is ready
 * We then add the grammars to the input select tag and update the UI
 */
function recognizerReady() {
  isRecognizerReady = true;
  updateUI();
  updateStatus('Recognizer ready');
}

// This initializes the recognizer.
function initRecognizer() {
  recognizer.postMessage({
    command: 'load',
    callbackId: callbackManager.add(
      function() {
        recognizerReady();
        // We pass dictionary and keyword parameters to the recognizer
        postRecognizerJob({
          command: 'initialize',
          data: [
            ["-dict", "keyphrase.dict"],
            ["-kws", "keyphrase.list"]
          ]
        }, function() {
          startRecording();
        });

      }),
      data: [
        'keyphrase-list.js',
        'keyphrase-dict.js'
      ]
  });
}

/* When the page is loaded, we spawn a new recognizer worker and call getUserMedia to request access to the microphone
*/
window.onload = function() {
  outputContainer = document.getElementById('output');

  updateStatus('Initializing web audio and speech recognizer, waiting for approval to access the microphone');
  window.BinaryReady = false;
  callbackManager = new CallbackManager();

  spawnWorker('lib/recognizer.js', function(worker) {
    // This is the onmessage function, once the worker is fully loaded
    worker.onmessage = function(event) {
      console.log('event', event.data.hyp);

      // This is the case when we have a callback id to be called
      if (event.data.hasOwnProperty('id')) {
        var callback = callbackManager.get(event.data['id']);
        var data = {};

        if (event.data.hasOwnProperty('data')) {
          data = event.data.data;
        }

        if (callback) {
          callback(data);
        }
      }

      // This is a case when the recognizer has a new hypothesis
      if (event.data.hasOwnProperty('hyp')) {
        var newHyp = event.data.hyp;

        if (event.data.hasOwnProperty('final') &&  event.data.final) {
          //newHyp = 'Final: ' + newHyp;
          window.BinaryReady = false;
          window.BinaryServer.end();

          if(newHyp!="")
          {
            console.log("Keyword Spotted");
            keyword_spotted=true;
            setTimeout(function(){
                authGoogleTransform();
              }, 5000);
          }
          keyword_spotted = false;
          //authGoogleTransform();
        }

        updateHyp(newHyp);
      }

      // This is the case when we have an error
      if (event.data.hasOwnProperty('status') && (event.data.status === 'error')) {
        updateStatus('Error in ' + event.data.command + ' with code ' + event.data.code);
      }
    };

    // Once the worker is fully loaded, we can call the initialize function
    initRecognizer();

  });


  // The following is to initialize Web Audio
  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    window.URL = window.URL || window.webkitURL;
    audioContext = new AudioContext();
  } catch (error) {
    console.error(error);
    updateStatus('Error initializing Web Audio browser');
  }

  if (navigator.getUserMedia) {
    navigator.getUserMedia({
      audio: {
        mandatory: {
          googEchoCancellation: false,
          googAutoGainControl: false,
          googNoiseSuppression: false,
          googHighpassFilter: false
        },
        optional: []
      }
    }, startUserMedia, function(e) {
      updateStatus('No live audio input in this browser');
    });
  } else {
    updateStatus('No web audio support in this browser');
  }

  // Wiring JavaScript to the UI
  startBtn.disabled = true;
  stopBtn.disabled = true;
  startBtn.onclick = startRecording;
  stopBtn.onclick = stopRecording;
};
