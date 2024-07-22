// Handler.js
import { SVG_ADD_TIMEFRAME, SVG_REMOVE_TIMEFRAME, out, safeSetValue, uuid, debounce } from '../utils/index.js';

function handlerIDToIndex(rowsAndHandlers, handlerElem) {
    for (let a = 0; a < rowsAndHandlers.length; a++) {
        if (rowsAndHandlers[a].handler.id === handlerElem.id) return a;
    }
    return -1;
}

function renumberAllHandlersAndRows(nodeMgrElement) {
    nodeMgrElement.querySelectorAll(".timeline-row").forEach((row, rowIndex) => {
        row.querySelector('.timeline').querySelectorAll(".timeline-handler").forEach((handler, handlerIndex) => {
            const imageNumber = handler.querySelector('.image-number');
            if (imageNumber) {
                imageNumber.textContent = `IMAGE ${rowIndex}.${handlerIndex + 1}`;
            }
        });
    });
}

function calculateNewHandlerPosition(nodeMgrHandlers) {
    let newLeft = 0;
    if (nodeMgrHandlers.length > 0) {
        const lastHandler = nodeMgrHandlers[nodeMgrHandlers.length - 1];
        newLeft = lastHandler.element.offsetLeft + lastHandler.element.offsetWidth;
    }
    const maxLeft = nodeMgrHandlers[0].element.closest('.timeline').clientWidth - nodeMgrHandlers[0].defaultHandlerWidth;
    return Math.min(newLeft, maxLeft);
}

class Handler {
    constructor(options = {}) {
        this.defaultHandlerWidth = options.defaultHandlerWidth || 200;
        this.handlerThreshold = options.handlerThreshold || 150;
        this.uID = uuid();
        this.element = this.createElement();
        this.updateFrameInfoInputs(options.nodeMgrProperties);
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

    setupInputEventListeners(nodeMgrProps, nodeMgrPopup) {
        const inputs = this.element.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.oninput = (e) => {
                e.stopPropagation();
                if (this.onInputChange) {
                    this.onInputChange(inputs, nodeMgrProps, nodeMgrPopup);
                }
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

    onInputChange(input, nodeMgrProps, nodeMgrPopup) {
        const updateHandler = debounce(() => {
            let value = parseFloat(input.value);
            if (isNaN(value)) {
                value = parseFloat(input.min) || 0;
            }
    
            const maxFrames = nodeMgrProps.number_animation_frames;
            value = Math.max(parseFloat(input.min) || 0, Math.min(value, maxFrames));
            safeSetValue(input, value);
            value = Math.max(parseFloat(input.min) || 0, Math.min(val, maxFrames));
            
            const inputName = input.classList[0];
            const mainInput = this.element.querySelector(`.${inputName}`);
            
            // if (mainInput) mainInput.value = value;
            if (mainInput) safeSetValue(mainInput, value);
            
            const startInput = this.element.querySelector('.frame-start-input');
            const endInput   = this.element.querySelector('.frame-end-input');
            const infoInput  = this.element.querySelector('.frame-info-input');
            
            if (startInput && endInput && infoInput) {
                if (inputName === 'frame-info-input') {
                    safeSetValue(endInput, parseInt(startInput.value) + value);
                } else if (inputName === 'frame-start-input') {
                    safeSetValue(endInput, value + parseInt(infoInput.value));
                } else if (inputName === 'frame-end-input') {
                    safeSetValue(infoInput, value - parseInt(startInput.value));
                }
            }

            this.updateHandlerSizeFromInputs(nodeMgrProps, nodeMgrPopup);
            this.updateHandlerDisplay();
        }, 50);
    
        updateHandler();
    }

    onInputBlur(input) { }

    updateHandlerSizeFromInputs(nodeMgrProps, nodeMgrPopup) {
        const timelineContainer = this.element.closest(".timeline");
        if (!timelineContainer) {
            out('Timeline container not found in updateHandlerSizeFromInputs', "warn");
            return;
        }

        const totalWidth = timelineContainer.clientWidth;
        const maxFrames = nodeMgrProps.number_animation_frames;
        const framesPerPixel = maxFrames / totalWidth;

        const frameInfoInput  = this.element.querySelector('.frame-info-input');
        const frameStartInput = this.element.querySelector('.frame-start-input');
        const frameEndInput   = this.element.querySelector('.frame-end-input');

        if (!frameInfoInput || !frameStartInput || !frameEndInput) {
            console.warn('One or more inputs not found in updateHandlerSizeFromInputs');
            return;
        }

        let startFrame = parseInt(frameStartInput.value) || 0;
        let endFrame = parseInt(frameEndInput.value) || maxFrames;
        let totalFrames = endFrame - startFrame;

        if (totalFrames <= 0) {
            endFrame = startFrame + 1;
            totalFrames = 1;
        }

        safeSetValue(frameInfoInput, totalFrames);
        safeSetValue(frameStartInput, startFrame);
        safeSetValue(frameEndInput, endFrame);

        const newLeft = startFrame / framesPerPixel;
        const newWidth = totalFrames / framesPerPixel;

        this.element.style.left = `${newLeft}px`;
        this.element.style.width = `${newWidth}px`;

        if (nodeMgrPopup && nodeMgrPopup.element.style.display !== 'none') {
            nodeMgrPopup.updatePosition(this.element);
        }
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

    updateHandlerDisplay() {
        if (!this.element) {
            out("No handler element");
            return;
        }

        const handlerWidth = this.element.offsetWidth;
        const handlerInfo = this.element.querySelector('.handler-info');
        const minimalisticInfo = this.element.querySelector('.minimalistic-info');
        const imageNumber = this.element.querySelector('.image-number');

        if (!handlerInfo || !minimalisticInfo) {
            out(`handlerInfo=${!handlerInfo} minimalisticInfo=${!minimalisticInfo}`);
            return;
        };

        if (handlerWidth < this.handlerThreshold) {
            handlerInfo.style.display = 'none';
            minimalisticInfo.style.display = 'flex';
            minimalisticInfo.textContent = imageNumber ? imageNumber.textContent : 'IMAGE';
            if (handlerWidth <= 65) {
                minimalisticInfo.classList.add('rotate-vertical');
            } else {
                minimalisticInfo.classList.remove('rotate-vertical');
            }
        } else {
            handlerInfo.style.display = 'flex';
            minimalisticInfo.style.display = 'none';
            minimalisticInfo.classList.remove('rotate-vertical');
        }
    }

    setupHandlerEventListeners(nodeMgr) {
        this.element.addEventListener('mouseenter', (event) => nodeMgr.mouseEnteredHandlerElement(event, this));
        this.element.addEventListener('mouseleave', (event) => nodeMgr.mouseLeftHandlerElement(event));
        this.setupInputEventListeners();
    }

    setImageNumber(number) {
        const imageNumber = this.element.querySelector('.image-number');
        if (imageNumber) {
            imageNumber.textContent = `IMAGE ${number}`;
        }
    }
}

export { handlerIDToIndex, renumberAllHandlersAndRows, calculateNewHandlerPosition, Handler };