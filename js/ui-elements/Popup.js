import { SVG_ADD_TIMEFRAME, SVG_REMOVE_TIMEFRAME } from '../utils/index.js';

class Popup {
    constructor() {
        this.element = this.createElement();
        this.isVisible = false;
        this.currentHandler = null;
        this.callbacks = {};
        this.setupEventListeners();
    }

    createElement() {
        const popup = document.createElement('div');
        popup.className = 'handler-popup';
        popup.style.display = 'none';
        popup.innerHTML = this.getPopupContent();

        return popup;
    }

    getPopupContent() {
        return `
            <div class="popup-content">
                <div class="popup-body">
                    <div class="frame-info-container">
                        <span class="image-number"></span>
                        <div class="frame-info-container-input">
                            <input type="number" class="frame-info-input" step="1" min="1">
                            <span class="frame-label"> frames</span>
                        </div>
                        <div class="frame-range-container">
                            <input type="number" class="frame-start-input" step="1" min="0" placeholder="Start">
                            <span> to </span>
                            <input type="number" class="frame-end-input" step="1" min="1" placeholder="End">
                        </div>
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
        this.element.addEventListener('mouseenter', this.onMouseEnter.bind(this));
        this.element.addEventListener('mouseleave', this.onMouseLeave.bind(this));

        const addTimeframeButton = this.element.querySelector('.add-timeframe');
        const removeTimeframeButton = this.element.querySelector('.remove-timeframe');

        if (addTimeframeButton) {
            addTimeframeButton.onclick = (e) => {
                e.stopPropagation();
                if (this.callbacks.onAddTimeframe) this.callbacks.onAddTimeframe(this.currentHandler);
            };
        }

        if (removeTimeframeButton) {
            removeTimeframeButton.onclick = (e) => {
                e.stopPropagation();
                if (this.callbacks.onRemoveTimeframe) this.callbacks.onRemoveTimeframe(this.currentHandler);
            };
        }

        this.setupInputEventListeners();
    }

    setupInputEventListeners() {
        const inputs = this.element.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.oninput = (e) => {
                e.stopPropagation();
                if (this.callbacks.onInputChange) this.callbacks.onInputChange(input, this.currentHandler);
            };
            input.onblur = (e) => {
                e.stopPropagation();
                if (this.callbacks.onInputBlur) this.callbacks.onInputBlur(input, this.currentHandler);
            };
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.callbacks.onInputBlur) this.callbacks.onInputBlur(input, this.currentHandler);
                    input.blur();
                }
            };
        });
    }

    show(handler, position) {
        this.isVisible = true;
        this.currentHandler = handler;
        this.updateContent(handler);
        this.updatePosition(position);
        this.element.style.display = 'block';
    }

    hide() {
        this.isVisible = false;
        this.element.style.display = 'none';
        this.currentHandler = null;
    }

    updatePosition(position) {
        this.element.style.left = `${position.left - this.element.offsetWidth / 2}px`;
        this.element.style.top = `${position.top - this.element.offsetHeight}px`;
    }

    updateContent(handler) {
        const imageNumber = this.element.querySelector('.image-number');
        const frameInfoInput = this.element.querySelector('.frame-info-input');
        const frameStartInput = this.element.querySelector('.frame-start-input');
        const frameEndInput = this.element.querySelector('.frame-end-input');

        const handlerImageNumber = handler.querySelector('.image-number');
        const handlerFrameInfoInput = handler.querySelector('.frame-info-input');
        const handlerFrameStartInput = handler.querySelector('.frame-start-input');
        const handlerFrameEndInput = handler.querySelector('.frame-end-input');

        if (imageNumber && handlerImageNumber) {
            imageNumber.textContent = handlerImageNumber.textContent;
        }
        if (frameInfoInput && handlerFrameInfoInput) {
            frameInfoInput.value = handlerFrameInfoInput.value;
        }
        if (frameStartInput && handlerFrameStartInput) {
            frameStartInput.value = handlerFrameStartInput.value;
        }
        if (frameEndInput && handlerFrameEndInput) {
            frameEndInput.value = handlerFrameEndInput.value;
        }
    }

    onMouseEnter() {
        if (this.timelineUI) {
            clearTimeout(this.timelineUI.popupCloseTimeout);
        }
    }

    onMouseLeave() {
        if (this.timelineUI) {
            this.timelineUI.scheduleHidePopup();
        }
    }

    setCallbacks(callbacks) {
        this.callbacks = callbacks;
    }
}

function scheduleHidePopup(event, nodeMgr, timeoutInMiliseconds=50) {
    clearTimeout(nodeMgr.popupCloseTimeout);
    nodeMgr.popupCloseTimeout = setTimeout(() => {
        if (nodeMgr.isMouseOverPopup && nodeMgr.isMouseOverHandler(event)) {
            hidePopup(nodeMgr);
        }
    }, timeoutInMiliseconds);
}

function hidePopup(nodeMgr) {
    if (nodeMgr.popup.isvisible) {
        nodeMgr.popup.hide();
        nodeMgr.currentPopupHandler = null;
    }
}

export { Popup, scheduleHidePopup };