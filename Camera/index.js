const video = document.getElementById("webcam");
const liveView = document.getElementById("liveView");
const demosSection = document.getElementById("demos");
const enableWebcamButton = document.getElementById("webcamButton");

// Check if webcam access is supported.
function getUserMediaSupported() {
  return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
}

// Add event listener to the button if webcam is supported.
if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener("click", enableCam);
} 
else {
  console.warn("No camera found.");
}
  
// Enable the live webcam view and start classification.
function enableCam(event) {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    return;
  }
  
  // Hide the button once clicked.
  event.target.classList.add('removed');  
  
  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  });
}


var model = undefined;
var count=0;

// Before we can use COCO-SSD class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment 
// to get everything needed to run.
// Note: cocoSsd is an external object loaded from our index.html
// script tag import so ignore any warning in Glitch.

cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  demosSection.classList.remove('invisible');
});

var children = [];

function predictWebcam() {
  // Start classifying a frame in the stream.
  model.detect(video).then(function (predictions) {

  // Remove any highlighting we did previous frame.
  for (let i = 0; i < children.length; i++) {
    liveView.removeChild(children[i]);
  }
  children.splice(0);
  
  var dict = {};
  dict["person"]=0;
  dict["cell phone"]=0;

  // Now lets loop through predictions and draw them to the live view if
  // they have a high confidence score.
  for (let n = 0; n < predictions.length; n++) {
    // If we are over 60% sure we are sure we classified it right, draw it!
    if (predictions[n].score > 0.62) {
      const p = document.createElement('p');
      p.innerText = predictions[n].class;

      dict[predictions[n].class]+=1;
      if(predictions[n].class!="person" && predictions[n].class!="cell phone"){
        continue;
      }
      if(dict["person"]>1 || dict["cell phone"]>0){
          count+=1;
          if(count>100){
              console.log("Violation"); 
              count=0;
              // take_ss();
          }
      }
      
      // console.log(typeof(predictions[n].class));
      // + ' - with ' 
      // + Math.round(parseFloat(predictions[n].score) * 100) 
      // + '% confidence.'
      p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
          + (predictions[n].bbox[1] - 10) + 'px; width: ' 
          + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

      const highlighter = document.createElement('div');
      highlighter.setAttribute('class', 'highlighter');
      highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
          + predictions[n].bbox[1] + 'px; width: ' 
          + predictions[n].bbox[2] + 'px; height: '
          + predictions[n].bbox[3] + 'px;';

      liveView.appendChild(highlighter);
      liveView.appendChild(p);
      children.push(highlighter);
      children.push(p);
    }
  }
  
  // Call this function again to keep predicting when the browser is ready.
  window.requestAnimationFrame(predictWebcam);
  });
}