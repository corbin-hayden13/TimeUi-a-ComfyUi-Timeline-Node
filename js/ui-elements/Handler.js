// Handler.js
import { SVG_ADD_TIMEFRAME, SVG_REMOVE_TIMEFRAME, out, scheduleHidePopup, safeSetValue, uuid } from '../utils/index.js';

export function handlerIDToIndex(rowsAndHandlers, handlerElem) {
    for (let a = 0; a < rowsAndHandlers.length; a++) {
        if (rowsAndHandlers[a].handler.id === handlerElem.id) return a;
    }
    return -1;
}

export class Handler {
    constructor(nodeMgr, options = {}) {
        this.nodeMgr = nodeMgr;

        this.defaultHandlerWidth = options.defaultHandlerWidth || 200;
        this.handlerThreshold = options.handlerThreshold || 150;
        this.uID = uuid();
        this.element = this.createElement();
        this.setupEventListeners();
    }

    createElement() {
        const handler = document.createElement('div');
        handler.id = this.uID;
        handler.className = `timeline-handler`;
        handler.style.width = `${this.defaultHandlerWidth}px`;
        handler.style.left = "0px";
        handler.innerHTML = `
            <div class="resize-handle resize-handle-left"></div>
            <div class="drag-area">
                ${this.getHandlerInfoContent()}
                <div class="minimalistic-info"></div>
            </div>
            <div class="resize-handle resize-handle-right"></div>
        `;
        return handler;
    }

    getHandlerInfoContent() {
        return `
            <div class="handler-info">
                <div class="frame-info-container">
                    <div class="image-number">IMAGE</div>
                    <div class="frame-info-container-input">
                        <input type="number" class="frame-info-input" step="1" min="1"><span class="frame-label"> frames</span>
                    </div>
                    <div class="frame-range-container">
                        <input type="number" class="frame-start-input" step="1" min="1" placeholder="Start">
                        <span> to </span>
                        <input type="number" class="frame-end-input" step="1" min="2" placeholder="End">
                    </div>
                </div>
                <div class="handler-buttons">
                    <button class="btn btn-sm add-timeframe">${SVG_ADD_TIMEFRAME}</button>
                    <button class="btn btn-sm remove-timeframe">${SVG_REMOVE_TIMEFRAME}</button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        this.setupInputEventListeners();
    }

    setupInputEventListeners() {
        const inputs = this.element.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.oninput = (e) => {
                e.stopPropagation();
                if (this.onInputChange) this.onInputChange(input);
            };
            input.onblur = (e) => {
                e.stopPropagation();
                if (this.onInputBlur) this.onInputBlur(input);
            };
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.onInputBlur) this.onInputBlur(input);
                    input.blur();
                }
            };
        });
    }

    updateFrameInfoInputs(nodeMgrProperties) {
        const timelineContainer = this.element.closest(".timeline");
        const totalWidth = timelineContainer.clientWidth;
        const handlerWidth = this.element.clientWidth;
        const handlerLeft = this.element.offsetLeft;

        const framesPerPixel = nodeMgrProperties.number_animation_frames / totalWidth;
        const startFrame = Math.max(0, Math.round(handlerLeft * framesPerPixel));
        const endFrame = Math.min(nodeMgrProperties.number_animation_frames, Math.round((handlerLeft + handlerWidth) * framesPerPixel));
        const totalFrames = endFrame - startFrame;

        const startSecond = (startFrame / nodeMgrProperties.frames_per_second).toFixed(2);
        const endSecond = (endFrame / nodeMgrProperties.frames_per_second).toFixed(2);

        const frameInfoInput = this.element.querySelector('.frame-info-input');
        const frameLabel = this.element.querySelector('.frame-label');
        const frameStartInput = this.element.querySelector('.frame-start-input');
        const frameEndInput = this.element.querySelector('.frame-end-input');

        if (frameInfoInput && frameLabel && frameStartInput && frameEndInput) {
            if (timeFormat === 'Seconds') {
                const newValue = (totalFrames / nodeMgrProperties.frames_per_second).toFixed(2);

                safeSetValue(frameInfoInput, newValue);
                frameLabel.textContent = ' seconds';
                safeSetValue(frameStartInput, startSecond);
                safeSetValue(frameEndInput, endSecond);
                
                frameInfoInput.step = '0.01';
                frameStartInput.step = '0.01';
                frameEndInput.step = '0.01';
            } else {
                safeSetValue(frameInfoInput, totalFrames.toString());
                frameLabel.textContent = ' frames';
                safeSetValue(frameStartInput, startFrame.toString());
                safeSetValue(frameEndInput, endFrame.toString());
                
                frameInfoInput.step = '1';
                frameStartInput.step = '1';
                frameEndInput.step = '1';
            }
        }
        else { out(`ui-element/Handler.js Missing html elements in handler - frameInfoInput=${!!frameInfoInput} frameLabel=${!!frameLabel} frameStartInput=${!!frameStartInput} frameEndInput=${!!frameEndInput}`); }
    }

    updateHandlerFromInput(nodeMgrCurrentHandler) {
        
    }

    setImageNumber(number) {
        const imageNumber = this.element.querySelector('.image-number');
        if (imageNumber) {
            imageNumber.textContent = `IMAGE ${number}`;
        }
    }

    setCallbacks(callbacks) {
        this.onInputChange = callbacks.onInputChange;
        this.onInputBlur = callbacks.onInputBlur;
    }

    setupHandlerEventListeners() {
        this.element.addEventListener('mouseenter', (event) => this.mouseEntersHandler(event));
        this.element.addEventListener('mouseleave', (event) => this.mouseLeavesHandler(event));
        this.setupInputEventListeners();
    }

    mouseEntersHandler(event) {
        clearTimeout(this.nodeMgr.popupCloseTimeout);
        if (this.element.offsetWidth < this.handlerThreshold) {
            this.nodeMgr.showPopup(event, this.element);
        }
    }

    mouseLeavesHandler(event) {
        if (!this.nodeMgr.isMouseInPopupOrTolerance(event)) {
            scheduleHidePopup(event, this.nodeMgr);
        }
    }

    calculateNewHandlerPosition(handlerElems) {
        let newLeft = 0;
        if (handlerElems.length > 0) {
            const lastHandler = handlerElems[handlerElems.length - 1];
            newLeft = lastHandler.offsetLeft + lastHandler.offsetWidth;
        }
        const maxLeft = handlerElems[0].closest('.timeline').clientWidth - this.defaultHandlerWidth;
        return Math.min(newLeft, maxLeft);
    }
}