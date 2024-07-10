import { SVG_SHOW_CURVES } from "../utils/SVGConstants.js";

function updateFrameInfo(nodeMgr, handler) {
  const timelineContainer = handler.closest(".timeline");
  const totalWidth = timelineContainer.clientWidth;
  const handlerWidth = handler.clientWidth;
  const handlerLeft = handler.offsetLeft;

  const framesPerPixel = nodeMgr.node.properties.number_animation_frames / totalWidth;
  const startFrame = Math.round(handlerLeft * framesPerPixel);
  const endFrame = Math.round((handlerLeft + handlerWidth) * framesPerPixel);
  const totalFrames = endFrame - startFrame;

  const startSecond = (startFrame / nodeMgr.node.properties.frames_per_second).toFixed(2);
  const endSecond = (endFrame / nodeMgr.node.properties.frames_per_second).toFixed(2);

  const frameInfoElement = handler.querySelector('.frame-info');
  const frameInfoInput = handler.querySelector('.frame-info-input');
  const frameLabel = handler.querySelector('.frame-label');

  if (frameInfoElement && frameInfoInput && frameLabel) {
      frameInfoInput.value = nodeMgr.node.properties.time_format === 'Seconds' ? `${(totalFrames / nodeMgr.node.properties.frames_per_second).toFixed(2)}` : `${totalFrames}`;
      frameLabel.textContent = nodeMgr.node.properties.time_format === 'Seconds' ? ' seconds' : ' frames';
      
      if (nodeMgr.node.properties.time_format === 'Seconds') {
          frameInfoElement.textContent = `From ${startSecond}s to ${endSecond}s`;
      } else {
          frameInfoElement.textContent = `From ${startFrame} to ${endFrame} frames`;
      }
  }
}
  
function updateAllHandlersFrameInfo(nodeMgr) {
  const handlers = nodeMgr.htmlElement.querySelectorAll(".timeline-handler");
  handlers.forEach(handler => {
      updateFrameInfo(nodeMgr, handler);
  });
}

function updateTimeRuler(nodeMgr, timeRuler) {
  // console.log('Updating time ruler with properties:', nodeMgr.node.properties);
  const numberOfFrames = nodeMgr.node.properties.number_animation_frames || 96;
  const framesPerSecond = nodeMgr.node.properties.frames_per_second || 12;
  const timeFormat = nodeMgr.node.properties.time_format;

  // console.log('Time Format:', timeFormat); // Debugging output

  const totalMarkers = timeFormat === "Seconds" ? Math.ceil(numberOfFrames / framesPerSecond) * 10 : numberOfFrames;
  timeRuler.innerHTML = '';

  for (let i = 0; i <= totalMarkers; i++) {
    const timeMarker = document.createElement("div");
    timeMarker.className = "time-marker";
    timeMarker.style.left = `${(i / totalMarkers) * 100}%`;

    if (i % 10 === 0) {
        timeMarker.classList.add("big-tick");
        timeMarker.innerHTML = `<span>${timeFormat === "Seconds" ? i / 10 : i} ${timeFormat === "Seconds" ? 's' : ''}</span>`;
    }
    else if (i % 5 === 0) {
      timeMarker.classList.add("medium-tick");
    }
    else {
      timeMarker.classList.add("small-tick");
    }

    timeRuler.appendChild(timeMarker);
  }

  // Add the total number of frames as the last marker only if the time format is "Frames"
  if (timeFormat === "Frames") {
    const totalFramesMarker = document.createElement("div");
    totalFramesMarker.className = "time-marker big-tick";
    totalFramesMarker.style.left = `100%`;
    totalFramesMarker.innerHTML = `<span>${numberOfFrames}</span>`;
    timeRuler.appendChild(totalFramesMarker);
  }
}
  
function createTimeRuler(nodeMgr) {
  const timeRulerContainer = document.createElement("div");
  timeRulerContainer.className = "time-ruler-container";

  // Add the new button to the left of the time ruler
  const newButton = document.createElement("button");
  newButton.className = "btn new-function-button";
  newButton.innerHTML = SVG_SHOW_CURVES; // You can replace this with SVG or any other content
  // Add an event listener for the button
  newButton.addEventListener("click", () => {
    console.log("New function button clicked");
    // Add your future function logic here
  });
  timeRulerContainer.appendChild(newButton);

  const timeRuler = document.createElement("div");
  timeRuler.className = "time-ruler";

  // Initialize the time ruler with current properties
  updateTimeRuler(nodeMgr, timeRuler);

  timeRulerContainer.appendChild(timeRuler);

  // Add the rearrange handle to the right of the time ruler
  const rearrangeHandle = document.createElement("div");
  rearrangeHandle.className = "same-space-handle";
  timeRulerContainer.appendChild(rearrangeHandle);

  return timeRulerContainer;
}

class TimeRuler {
  constructor(options = {}) {
      this.element = this.createElement();
      this.updateTimeRuler(options);
  }

  createElement() {
      const timeRulerContainer = document.createElement("div");
      timeRulerContainer.className = "time-ruler-container";

      const buttons = [SVG_SHOW_CURVES, SVG_SHOW_CURVES].map(svg => {  // Why two curve buttons?
          const button = document.createElement("button");
          button.className = "btn new-function-button";
          button.innerHTML = svg;
          button.addEventListener("click", () => console.log("New Function clicked"));
          return button;
      });

      buttons.forEach(button => timeRulerContainer.appendChild(button));

      const timeRuler = document.createElement("div");
      timeRuler.className = "time-ruler";
      timeRulerContainer.appendChild(timeRuler);

      const rearrangeHandle = document.createElement("div");
      rearrangeHandle.className = "same-space-handle";
      timeRulerContainer.appendChild(rearrangeHandle);

      return timeRulerContainer;
  }

  updateTimeRuler(options) {
      const { number_animation_frames, frames_per_second, time_format } = options;
      const timeRuler = this.element.querySelector('.time-ruler');
      if (!timeRuler) return;

      const totalMarkers = time_format === "Seconds" ? Math.ceil(number_animation_frames / frames_per_second) * 10 : number_animation_frames;
      timeRuler.innerHTML = '';

      for (let i = 0; i <= totalMarkers; i++) {
          const timeMarker = document.createElement("div");
          timeMarker.className = "time-marker";
          timeMarker.style.left = `${(i / totalMarkers) * 100}%`;

          if (i % 10 === 0) {
              timeMarker.classList.add("big-tick");
              timeMarker.innerHTML = `<span>${time_format === "Seconds" ? i / 10 : i} ${time_format === "Seconds" ? 's' : ''}</span>`;
          } else if (i % 5 === 0) {
              timeMarker.classList.add("medium-tick");
          } else {
              timeMarker.classList.add("small-tick");
          }

          timeRuler.appendChild(timeMarker);
      }

      if (time_format === "Frames") {
          const totalFramesMarker = document.createElement("div");
          totalFramesMarker.className = "time-marker big-tick";
          totalFramesMarker.style.left = `100%`;
          totalFramesMarker.innerHTML = `<span>${number_animation_frames}</span>`;
          timeRuler.appendChild(totalFramesMarker);
      }
  }
}

export { updateTimeRuler, createTimeRuler, updateFrameInfo, updateAllHandlersFrameInfo, TimeRuler };