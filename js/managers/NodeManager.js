import { updateAllHandlersFrameInfo, renumberImageRows, removeImageRow, get_position_style, scheduleHidePopup, renumberAllHandlersAndRows, calculateNewHandlerPosition, handlerIDToIndex } from "../ui-elements/index.js";
import { Popup, TimeRuler, Handler, ImageRow } from "../ui-elements/index.js";
import { initializeDragAndResize } from "../utils/EventListeners.js";
import { ObjectStore } from "./ObjectStore.js";
import { app } from "../../../scripts/app.js";
import { $el } from "../../../scripts/ui.js";
import { ComfyWidgets } from "../../../scripts/widgets.js";
import { out, uuid, debounce, safeSetValue } from "../utils/MiscUtils.js";

// We don't need to add the docListeners more than once, so this flag stops multiple adds
let docListenersAdded = false;

/**
 * Gets bound to the NodeManager instance so `this` works here
 * @param {*} widget 
 */
function onWidgetChange(widget) {
  this.properties[widget.name] = widget.value;

  if (this.timeRuler) {
    this.timeRuler.updateTimeRuler(this.properties);
    this.handlers.forEach(handler => {
      handler.updateFrameInfoInputs(this.properties);
    });
  }
}

class NodeManager {
  constructor(node, props={}) {
    // Destructuring props with default values
    const {
        size = [900, 360],
        baseHeight = 260,
        rowHeight = 100,
        serialize_widgets = true,
        color = LGraphCanvas.node_colors.black.groupcolor,
        bgcolor = LGraphCanvas.node_colors.black.groupcolor,
        groupcolor = LGraphCanvas.node_colors.black.groupcolor
    } = props;

    // Setting NodeManager member variables
    this.uID = uuid();
    this.properties = {
      ipadapter_preset: "LIGHT - SD1.5 only (low strength)",
      video_width: 512,
      video_height: 512,
      interpolation_mode: "Linear",
      number_animation_frames: 96,
      frames_per_second: 12,
      time_format: "Frames",
      imageTimelineInfo: {},
    }
    this.handlers = [];

    // HTML Container Properties
    this.baseHeight = baseHeight;
    this.rowHeight = rowHeight;
    this.handlerThreshold = 150;
    this.popupBuffer = 10;
    this.popupTolerance = 30;
    this.defaultHandlerWidth = 200;
    this.minHandlerWidth = 1;
    this.maxHandlers = 20;

    // Setting HTML containers
    this.htmlElement = $el("div.timeline-container", { 
      id: "images-rows-container" 
    });
    this.timeRuler = new TimeRuler(this.properties);
    this.popup = new Popup(this.popupBuffer);  // Using one popup and moving to the handlers that need them

    // HTML Component Objects and References
    this.currentHandler = null;
    this.currentPopupHandler = null;
    this.selectedHandler = null;
    this.activeHandler = null;
    this.popupCloseTimeout = null;
    
    // State Flags
    this.isMouseOverPopup = false;
    this.isDragging = false;
    this.isResizingLeft = false;
    this.isResizingRight = false;

    // Operating on the node
    this.node = node;
    this.node.jimmmm_ai_node_uID = this.uID;
    this.node.serialize_widgets = serialize_widgets;
    this.node.size = [size[0], this.baseHeight + this.rowHeight];
    this.node.color = color;
    this.node.bgcolor = bgcolor;
    this.node.groupcolor = groupcolor;
    this.bindMethods();
  }
  /** Getters and Setters to alias node object passed to constructor */
  get widgets() {return this.node.widgets;}

  get title() {return this.node.title;}
  set title(newTitle) {this.node.title = newTitle;}

  get inputs() {return this.node.inputs;}
  set inputs(newInputs) {
    if (Array.isArray(newInputs)) {
      this.node.inputs = newInputs.map(input => ({name: input.name, type: input.type, label: input.label}));
    }
  }

  get size() {return this.node.size;}
  set size(newSize) {
    if (Array.isArray(newSize)) {
        this.node.size = newSize;
        this.node.setDirtyCanvas(true, true);
    }
  }

  get resizable() {return this.node.resizable;}
  set resizable(isResizable) {this.node.resizable = isResizable;}

  bindMethods () {
    this.initializeSortable = this.initializeSortable.bind(this);
    this.isMouseOverHandler = this.isMouseOverHandler.bind(this);
    this.selectHandler = this.selectHandler.bind(this);
    this.addHandler = this.addHandler.bind(this);
  }

  onNodeCreated() {
    this.addWidgets();
    this.appendHTMLToBody();
    this.addTimelineHandlerRow();
    this.setupEventListeners();
    this.initializeSortable();
    this.initResizeListeners();
    this.addTimelineWidget();
  }

  /** Setup Methods */
  addWidgets() {
    ComfyWidgets.COMBO(this.node, "ipadapter_preset", [["LIGHT - SD1.5 only (low strength)", "STANDARD (medium strength)", "VIT-G (medium strength)", "PLUS (high strength)", "PLUS FACE (portraits)", "FULL FACE - SD1.5 only (portraits stronger)"], { default: "LIGHT - SD1.5 only (low strength)" }]);
    ComfyWidgets.FLOAT(this.node, "video_width", ["INT", { default: 512, min: 0, max: 10000, step: 1 }], app);
    ComfyWidgets.FLOAT(this.node, "video_height", ["INT", { default: 512, min: 0, max: 10000, step: 1 }], app);
    ComfyWidgets.COMBO(this.node, "interpolation_mode", [["Linear", "Ease_in", "Ease_out", "Ease_in_out"], { default: "Linear" }]);
    ComfyWidgets.FLOAT(this.node, "number_animation_frames", ["INT", { default: 96, min: 1, max: 12000, step: 1 }], app);
    ComfyWidgets.FLOAT(this.node, "frames_per_second", ["INT", { default: 12, min: 8, max: 24, step: 1 }], app);
    ComfyWidgets.COMBO(this.node, "time_format", [["Frames", "Seconds"], { default: "Frames" }], app);
  
    // Bind onWidgetChange function to widget change events
    this.node.widgets.forEach(widget => {
      widget.callback = onWidgetChange.bind(this, widget);
    });
  }

  addTimelineWidget() {
    const rowHeight = this.rowHeight;
    const timelineWidget = {
      type: "HTML",
      name: "timeline",
      inputEl: this.htmlElement,
      draw(ctx, node, widget_width, y, widget_height) {
        Object.assign(this.inputEl.style, get_position_style(ctx, widget_width, y, node.size[1]), rowHeight);
      },
      async serializeValue(nodeId, widgetIndex) {
        return this.properties.imageTimelineInfo;
      }
    };

    this.node.addCustomWidget(timelineWidget);
    this.node.onRemoved = function() { timelineWidget.inputEl.remove(); };
  }
  
  addImageRow() {
    const newRow = new ImageRow({ rowIndex: this.htmlElement.querySelectorAll(".timeline-row").length + 1 });
    const handler = newRow.addHandler({ defaultHandlerWidth: this.defaultHandlerWidth });
    
    if (!handler || !handler.element || !handler.element.style) {
      out(`Problem in NodeManager.addImageRow - handler=${handler} handler.element=${handler.element} handler.element.style=${handler.element.style}`, "error");
      return;
    }

    this.handlers.push({row: newRow, handler});
    this.htmlElement.appendChild(newRow.element);
    
    this.updateNodeHeight(true);
    this.initializeSortable();
    initializeDragAndResize(this);
    
    renumberAllHandlersAndRows(this.htmlElement);
    updateAllHandlersFrameInfo(this);
  }

  addHandler() {
    const timeline = currentHandler.closest('.timeline');

    if (Array.from(timeline.querySelectorAll('.timeline-handler')).length >= this.maxHandlers) {
      out("Maximum number of handlers reached", "warn");
      return;
    }

    const newHandler = new Handler({ defaultHandlerWidth: this.defaultHandlerWidth });
    this.handlers.push(newHandler);
    const newLeft = calculateNewHandlerPosition(this.handlers);
    newHandler.element.style.left = `${newLeft}px`;
    timeline.appendChild(newHandler.element);

    this.handlers.forEach(handler => { // Replaces updateAllHandlersFrameInfo
      handler.updateFrameInfoInputs(this.properties);
    });
    renumberAllHandlersAndRows(this.htmlElement);
    this.selectHandler(newHandler.element);
  }

  // Only called in constructor, no need to bind
  appendHTMLToBody() {
    this.htmlElement.appendChild(this.timeRuler.element);
    document.body.appendChild(this.htmlElement);
    document.body.appendChild(this.popup.element);
  }

  addTimelineHandlerRow() {
    this.addImageRow();
  }

  /** Event Listeners */
  setupEventListeners() {
    this.htmlElement.addEventListener("click", (event) => {
      if (event.target.closest(".add-row")) {
        this.addImageRow();
      } else if (event.target.closest(".remove-row")) {
        removeImageRow(this, event.target);
      } else if (event.target.closest(".image-input")) {
        event.target.closest(".image-input").addEventListener("change", (e) => this.handleImageUpload(e));
      }
    });
  }

  initializeSortable(animation=150) {
    const findClassName = "time-ruler-container";
    Sortable.create(this.htmlElement, {
      animation,
      handle: ".rearrange-handle",
      filter: `.${findClassName}`,
      onMove: function (event) {
        return event.related.className.indexOf(findClassName) === -1;
      },
      onEnd: () => {
        renumberImageRows(this);
      },
    });
  }

  initResizeListeners() {
    if (!docListenersAdded) {
      initializeDragAndResize(this);
    }
    docListenersAdded = true;
  }
  
  /** Event Handlers */
  addOutput() {
    if (this.node) {
      this.node.addOutput("mask", "MASK");
      this.node.setDirtyCanvas(true, true);
    } else {
      out("this.node is undefined in NodeManager.addOutput()");
    }
  }

  removeOutput() {
    if (this.node) {
      this.node.removeOutput(this.node.outputs.length - 1);
      this.node.setDirtyCanvas(true, true);
    } else {
      out("this.node is undefined in NodeManager.removeOutput()");
    }
  }

  handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.className = "uploaded-image";
        
        const uploadContainer = event.target.closest(".image-upload");
        const timelineHandler = event.target.closest(".timeline-handler");
        const rowHTML = event.target.closest(".timeline-row");
        // This is used for passing the images to the backend
        this.properties.imageTimelineInfo[rowHTML.id] = {imgSrc: img.src, timelineHandler};
        uploadContainer.innerHTML = '';
        uploadContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  }

  updateNodeHeight(addingRow=true) {
    const rowCount = this.htmlElement.querySelectorAll(".timeline-row").length + (addingRow ? 1 : 0);
    this.size = [this.size[0], this.baseHeight + this.rowHeight * rowCount];
  }

  isMouseOverHandler(event) {
    if (!this.currentPopupHandler) return false;
    const rect = this.currentPopupHandler.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.right &&
           event.clientY >= rect.top && event.clientY <= rect.bottom;
  }

  /**
   * elemObject is an Object, not an HTML element
   */
  mouseEnteredHandlerElement(event, handler) {
    clearTimeout(this.popupCloseTimeout);
      if (handler.element.offsetWidth < handler.handlerThreshold) {
        this.showPopup(event, handler.element);
      }
  }

  mouseLeftHandlerElement(event) {
    if (!this.isMouseInPopupOrTolerance(event)) {
      scheduleHidePopup(event, this);
  }
  }

  selectHandler(handler) {
    if (this.selectedHandler && this.selectedHandler !== handler) {
      this.selectedHandler.classList.remove('active');
    }
    if (this.selectedHandler !== handler) {
      this.selectedHandler = handler;
      this.selectedHandler.classList.add('active');
    }
  }

  handleInputChange(input, timeoutInMiliseconds=50) {
    if (!input) {
      console.warn('Input is null in handleInputChange');
      return;
    }

    const updateHandler = debounce(() => {
      const handler = input.closest('.timeline-handler') || this.currentHandler;
      if (!handler) {
        out('Handler not found in handleInputChange', "warn");
        return;
      }
      let value = parseFloat(input.value);
      if (isNaN(value)) {
        value = parseFloat(input.min) || 0;
      }

      value = Math.max(parseFloat(input.min) || 0, Math.min(value, this.properties.number_animation_frames));
      safeSetValue(input, value);
    }, timeoutInMiliseconds);

    updateHandler();
  }

  /** Popup methods */
  setupPopupCallbacks() {
    this.popup.setCallbacks({
      onAddtimeframe: () => this.addHandler(),
      // onRemoveTimeframe: (handlerElem) => this.removeHandler(handlerElem),
      // onInputChange: (input, handlerElem) => this.handlePopupInputChange(input, handlerElem),
      // onInputBlur: (input, handlerElem) => this.handlePopupInputBlur(input, handlerElem)
    });
  }

  showPopup(event, handlerElem) {
    if (this.currentPopupHandler !== handlerElem) {
      scheduleHidePopup(event, this);
    }

    const rect = handlerElem.getBoundingClientRect();
      const position = {
        left: rect.left + (rect.width / 2),
        top: rect.top - this.popupBuffer
      };
      this.popup.show(handlerElem, position);
      this.currentPopupHandler = handlerElem;
  }

  isMouseInPopupOrTolerance(e) {
    if (!this.popup || !this.currentHandler) return false;

    const popupRect = this.popup.element.getBoundingClientRect();
    const handlerRect = this.currentHandler.getBoundingClientRect();

    const toleranceRect = {
      left: Math.min(Math.min(popupRect.left, handlerRect.left) - this.popupTolerance, Math.min(toleranceRect.left, handlerRect.left - this.popupTolerance)),
      right: Math.max(Math.max(popupRect.right, handlerRect.right) + this.popupTolerance, Math.max(toleranceRect.right, handlerRect.right + this.popupTolerance)),
      top: Math.min(popupRect.top, handlerRect.top) - this.popupTolerance,
      bottom: Math.max(popupRect.bottom, handlerRect.bottom) + this.popupTolerance
    };

    const middleY = (handlerRect.top + popupRect.bottom) / 2;
    
    if (e.clientY < middleY) toleranceRect.bottom = Math.max(toleranceRect.bottom, middleY + this.popupTolerance);
    else toleranceRect.top = Math.min(toleranceRect.top, middleY - this.popupTolerance);

    return e.clientX >= toleranceRect.left && e.clientX <= toleranceRect.right &&
           e.clientY >= toleranceRect.top && e.clientY <= toleranceRect.bottom;
  }
}

let nodeStorage = new ObjectStore();

// I want every NodeManager to be stored in the nodeStorage, so this is the only way to get a node manager in code
export function makeNodeManager(node, props={}) {
  const uID = nodeStorage.add(new NodeManager(node, props));
  return nodeStorage.get(uID);
}