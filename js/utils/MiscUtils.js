const out = (message) => {
    console.log(`Timeline-UI: ${message}`);
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

export { out, uuid, loadCSS };