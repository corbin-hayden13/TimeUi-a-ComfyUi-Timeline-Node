const out = (message, type="log") => {
    switch (type) {
        case "log":
            console.log(`Timeline-UI: ${message}`);
            break;
        case "warn":
            console.warn(`WARNING Timeline-UI: ${message}`);
            break;
        case "error":
            console.error(`ERROR Timeline-UI: ${message}`);
            break;
        default: break;
    }
};

const createUUIDGenerator = () => {
    let currUUID = 0;
    return () => currUUID++;
};
const uuid = createUUIDGenerator();

const loadCSS = function(filename="timeline-styles.css") {
    const currScript = document.currentScript;
    let estimatedPath = `.\\extensions\\TimeUi-a-ComfyUi-Timeline-Node\\${filename}`;
    if (currScript) {
        const scriptURL = new URL(currScript.src);
        const scriptDirectory = scriptUrl.pathname.substring(0, scriptUrl.pathname.lastIndexOf('/'));
        out(`scriptDirectory=${scriptDirectory}`);
        estimatedPath = `${scriptDirectory}/${fileName}`;
    }
    else {
        out("No currentScript from utils/MiscUtils.js, using estimated relative path instead");
    }

    const linkElem = document.createElement("link");
    linkElem.rel = "stylesheet";
    linkElem.href = estimatedPath;
    document.head.appendChild(linkElem);
}

function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/** Changing input.value makes a call to input.oninput creating an infinite loop, so use this method to safely change the value without looping */
function safeSetValue(input, value) {
    const emptyFunc = () => {};

    const origOnInput = input.oninput || emptyFunc;
    const origOnChange = input.onchange || emptyFunc;

    input.oninput = emptyFunc;
    input.onchange = emptyFunc;

    input.value = value;

    input.oninput = origOnInput;
    input.onchange = origOnChange;
}

export { out, uuid, loadCSS, debounce, safeSetValue };