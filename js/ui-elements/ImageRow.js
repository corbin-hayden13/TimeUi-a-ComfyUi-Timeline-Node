import { SVG_UPLOAD_IMAGE, SVG_REMOVE_ROW, SVG_ADD_ROW } from '../utils/index.js';
import { Handler } from './Handler.js';

export class ImageRow {
    constructor(options = {}) {
        this.rowIndex = options.rowIndex || 1;
        this.element = this.createElement();
        this.setupEventListeners();
    }

    createElement() {
        const row = document.createElement("section");
        row.className = "timeline-row";
        row.id = `timeline-row-${this.rowIndex}`;
        row.innerHTML = this.generateRowHTML();
        return row;
    }

    generateRowHTML() {
        return `
            <div class="timeline-controls">
                <div class="image-upload">
                    ${SVG_UPLOAD_IMAGE}
                    <input type="file" class="image-input" accept="image/*">
                </div>
                <div class="button-image-row">
                    <button class="btn remove-row">${SVG_REMOVE_ROW}</button>
                    <button class="btn add-row">${SVG_ADD_ROW}</button>
                </div>
            </div>
            <div class="timeline"></div>
            <div class="rearrange-handle"></div>
        `;
    }

    setupEventListeners() {
        const imageInput = this.element.querySelector('.image-input');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
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
                uploadContainer.innerHTML = '';
                uploadContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    }

    addHandler(options = {}) {
        const timeline = this.element.querySelector('.timeline');
        const handler = new Handler(options);
        timeline.appendChild(handler.element);
        return handler;  // This should return an object with an 'element' property
    }

    setRowIndex(index) {
        this.rowIndex = index;
        this.element.id = `timeline-row-${this.rowIndex}`;
    }
}