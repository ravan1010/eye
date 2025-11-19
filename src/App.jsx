import React, { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import sudeep from "./sudeep.jpg"
import sudeep0 from "./sudeep0.jpg"
import sudeep1 from "./sudeep1.jpg"
import sudeep2 from "./sudeep2.jpg"
import sudeep3 from "./sudeep3.jpg"



export default function LeftEyeTracker() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [bgColor, setBgColor] = useState("white");
  const [leftIrisState, setLeftIrisState] = useState({ x: 0.5, y: 0.5 });

  // LEFT iris landmark indices
  const LEFT_IRIS_IDX = [468, 469, 470, 471];

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, // enables iris
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(on);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await faceMesh.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();
  }, );

  const centerPoint = (points) => ({
    x: points.reduce((s, p) => s + p.x, 0) / points.length,
    y: points.reduce((s, p) => s + p.y, 0) / points.length,
  });

  // y

  const on = (results) => {
    if (!results.multiFaceLandmarks?.length) return;

    const landmarks = results.multiFaceLandmarks[0];

    /** ---------------------------
     * LEFT IRIS CENTER
     * ------------------------- */
    const irisPoints = LEFT_IRIS_IDX.map((i) => landmarks[i]);
    const iris = centerPoint(irisPoints);
    setLeftIrisState(iris);

    /** ---------------------------
     * LEFT EYE — UP & DOWN Detection
     * ------------------------- */

    const upper = landmarks[386]; // left upper eyelid
    const lower = landmarks[374]; // left lower eyelid

    // if (iris.y > lower.y) {
    //   setBgColor("red"); // looking down
    // } else if (iris.y < upper.y) {
    //   setBgColor("blue"); // looking up
    // } else {
    //   setBgColor("white"); // neutral
    // }

    const SCROLL_SPEED = 40;

    if (iris.y > lower.y) {
      // setBgColor("red"); // looking down
      window.scrollBy(0, SCROLL_SPEED); // scroll down
    } else if (iris.y < upper.y) {
      // setBgColor("blue"); // looking up
      window.scrollBy(0, -SCROLL_SPEED); // scroll up
    } else {
      setBgColor("white"); // neutral
    }

    drawCanvas(results.image, iris);
  };

  const drawCanvas = (image, iris) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    const x = iris.x * canvas.width;
    const y = iris.y * canvas.height;

    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  const stylesudeep = { 
    width : '100%'
  }

  return (
    <div
      style={{
        backgroundColor: bgColor,
        height: "100vh",
        width: "100vw",
      }}
    >
      <video ref={videoRef} className="hidden" style={{ width: '100px', height: '80px', position: "fixed", display: "none"}} />
      <canvas ref={canvasRef} className="border rounded-lg" style={ { display: 'none' }} />

      <div className="mt-4 text-lg font-bold text-center">
        👁 Left Iris → X: {leftIrisState.x.toFixed(3)} | Y:{" "}
        {leftIrisState.y.toFixed(3)}
      </div>
      <h1>
        ravan
      </h1>

      <img src={sudeep} style={stylesudeep}/>
      <img src={sudeep0} style={stylesudeep}/>
      <img src={sudeep1} style={stylesudeep}/>
      <img src={sudeep2} style={stylesudeep}/>
      <img src={sudeep3} style={stylesudeep}/>


    </div>
  );
}
