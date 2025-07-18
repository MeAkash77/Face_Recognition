import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import './App.css';

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [message, setMessage] = useState('');

  // Load from useEffect hook in mounted phase
  useEffect(() => {
    startVideo();
    videoRef && loadModels();
  }, []);

  // Open Yr face WEBCAM
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream
      })
      .catch((err) => {
        console.log(err)
      })
  };

  // Load models from faceAPI
  const loadModels = () => {
    Promise.all([
      // THIS FOR FACE DETECT AND LOAD FROM YOU public/models Directory
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models")
    ]).then(() => {
      faceMyDetect();
    })
  };

  const faceMyDetect = () => {
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

      // DRAW YOU FACE IN WEBCAM
      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current);
      faceapi.matchDimensions(canvasRef.current, {
        width: 940,
        height: 650
      });

      const resized = faceapi.resizeResults(detections, {
        width: 940,
        height: 650
      });

      faceapi.draw.drawDetections(canvasRef.current, resized);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized); // angry, disgusted, fearful, happy, neutral, sad, surprised
      resized.forEach((result) => {
        let confidenceMessage = '';
        const confidence = result.detection.score;
        if (confidence < 0.3) {
          confidenceMessage = 'Poor';
        } else if (confidence >= 0.3 && confidence < 0.6) {
          confidenceMessage = 'Normal';
        } else {
          confidenceMessage = 'High';
        }
        setMessage(`Confidence: ${confidenceMessage}`);
      });
    }, 1000);
  };


  return (
    <div className="myApp">
      <h1>Face Detection</h1>
      <div className="appVideo">
        <video crossOrigin="anonymous" ref={videoRef} autoPlay></video>
      </div>
      <canvas ref={canvasRef} width="940" height="650" className="appCanvas" />
      <p>{message}</p>
    </div>
  );
}

export default App;
