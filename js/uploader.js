const state = {
    dataDate: null,

    socialGeneral: [],
    socialCategories: [],
    website: [],
    youtube: [],

    validation: {
        ready: true,
        errors: []
    }
};

const socialGeneralDrop =
    document.getElementById("socialGeneralDrop");

const socialCategoriesDrop =
    document.getElementById("socialCategoriesDrop");

const websiteDrop =
    document.getElementById("websiteDrop");

const youtubeDrop =
    document.getElementById("youtubeDrop");

const previewBtn =
    document.getElementById("previewBtn");

const uploadBtn =
    document.getElementById("uploadBtn");

const previewContainer =
    document.getElementById("previewContainer");

const dataDate =
    document.getElementById("dataDate");

dataDate.addEventListener("change", () => {
    state.dataDate = dataDate.value;
});

setupDropZone(
    socialGeneralDrop,
    "socialGeneral",
    "socialGeneralFiles"
);

setupDropZone(
    socialCategoriesDrop,
    "socialCategories",
    "socialCategoriesFiles"
);

setupDropZone(
    websiteDrop,
    "website",
    "websiteFiles"
);

setupDropZone(
    youtubeDrop,
    "youtube",
    "youtubeFiles"
);

function setupDropZone(
    element,
    stateKey,
    listId
){

    element.addEventListener(
        "dragover",
        e => {
            e.preventDefault();
        }
    );

    element.addEventListener(
        "drop",
        e => {

            e.preventDefault();

            const files =
                Array.from(
                    e.dataTransfer.files
                );

            state[stateKey] = files;

            renderFileList(
                files,
                listId
            );

        }
    );

    element.addEventListener(
        "click",
        () => {

            const input =
                document.createElement("input");

            input.type = "file";

            input.multiple = true;

            input.accept = ".csv";

            input.onchange = () => {

                const files =
                    Array.from(
                        input.files
                    );

                state[stateKey] = files;

                renderFileList(
                    files,
                    listId
                );

            };

            input.click();

        }
    );

}

function renderFileList(
    files,
    listId
){

    const container =
        document.getElementById(
            listId
        );

    container.innerHTML = "";

    files.forEach(file => {

        const div =
            document.createElement("div");

        div.innerText =
            file.name;

        container.appendChild(div);

    });

}

function resetValidation(){

    state.validation.ready = true;
    state.validation.errors = [];

}

function addValidationError(message){

    state.validation.ready = false;
    state.validation.errors.push(message);

}

function validateRequiredFiles(){

    if(state.socialGeneral.length === 0){

        addValidationError(
            "Missing Social General file"
        );

    }

    if(state.website.length === 0){

        addValidationError(
            "Missing Website file"
        );

    }

    if(state.youtube.length === 0){

        addValidationError(
            "Missing YouTube files"
        );

    }

}

function validateCategories(){

    for(const file of state.socialCategories){

        const category =
            detectCategory(
                file.name
            );

        if(category === "UNKNOWN"){

            addValidationError(
                `Unknown category: ${file.name}`
            );

        }

    }

}

previewBtn.addEventListener(
    "click",
    generatePreview
);

async function generatePreview(){

    previewContainer.innerHTML =
        "Generating preview...";

    if(!state.dataDate){

        previewContainer.innerHTML =
            "Please select Data Date";

        return;

    }

    resetValidation();

    validateRequiredFiles();

    validateCategories();

    const matches =
        await getMatches(
            state.dataDate
        );

    let html = "";

    html += `
        <h3>Date</h3>
        <p>${state.dataDate}</p>
    `;

    html += `
        <h3>Matches</h3>
    `;

    if(matches.length){

        html += "<ul>";

        matches.forEach(match => {

            html += `
                <li>
                    ${match.match_name}
                </li>
            `;

        });

        html += "</ul>";

    }else{

        html += `
            <p>No matches found</p>
        `;

    }

    html += `
        <hr>
        <h3>Social General</h3>
    `;

    for(const file of state.socialGeneral){

        const rows =
            await parseCsv(file);

        html += `
            <p>
                <b>${file.name}</b><br>
                Rows: ${rows.length}<br>
                Account: ${detectAccount(file.name)}
            </p>
        `;

    }

    html += `
        <hr>
        <h3>Social Categories</h3>
    `;

    for(const file of state.socialCategories){

        const rows =
            await parseCsv(file);

        html += `
            <p>
                <b>${file.name}</b><br>
                Category:
                ${detectCategory(file.name)}<br>
                Rows:
                ${rows.length}
            </p>
        `;

    }

    html += `
        <hr>
        <h3>Website</h3>
    `;

    for(const file of state.website){

        const rows =
            await parseCsv(file);

        html += `
            <p>
                <b>${file.name}</b><br>
                Rows:
                ${rows.length}
            </p>
        `;

    }

    html += `
        <hr>
        <h3>YouTube</h3>
    `;

    for(const file of state.youtube){

        const rows =
            await parseCsv(file);

        html += `
            <p>
                <b>${file.name}</b><br>
                Rows:
                ${rows.length}
            </p>
        `;

    }

    html += `
        <hr>
        <h3>Validation</h3>
    `;

    if(state.validation.ready){

        html += `
            <p style="
                color:#00ff88;
                font-weight:bold;
            ">
                READY
            </p>
        `;

    }else{

        html += `
            <p style="
                color:#ff4444;
                font-weight:bold;
            ">
                ERROR
            </p>
        `;

        html += "<ul>";

        state.validation.errors
            .forEach(error => {

                html += `
                    <li>${error}</li>
                `;

            });

        html += "</ul>";

    }

    previewContainer.innerHTML =
        html;

}

async function getMatches(date){

    try{

        const response =
            await fetch(
                `/api/matches?date=${date}`
            );

        return await response.json();

    }
    catch(error){

        console.error(error);

        return [];

    }

}

async function parseCsv(file){

    return new Promise((resolve,reject)=>{

        Papa.parse(file,{

            header:true,

            skipEmptyLines:true,

            complete:(results)=>{

                resolve(
                    results.data
                );

            },

            error:(error)=>{

                reject(error);

            }

        });

    });

}

function detectCategory(fileName){

    const name =
        fileName.toLowerCase();

    if(name.includes("shows"))
        return "SHOWS";

    if(name.includes("accion"))
        return "ACCION";

    if(name.includes("acción"))
        return "ACCION";

    if(name.includes("aura"))
        return "AURA_CAST";

    if(name.includes("cobra"))
        return "LA_COBRA";

    if(name.includes("luzu"))
        return "LUZU";

    if(name.includes("casadelkun"))
        return "LA_CASA_DEL_KUN";

    if(name.includes("kun"))
        return "LA_CASA_DEL_KUN";

    if(name.includes("original"))
        return "CONTENIDO_ORIGINAL";

    if(name.includes("onlyphotos"))
        return "ONLY_PHOTOS";

    return "UNKNOWN";

}

function detectAccount(fileName){

    const name =
        fileName.toLowerCase();

    if(name.includes("espnmundial"))
        return "ESPN Mundial";

    if(name.includes("onlyphotos"))
        return "Only Photos";

    return fileName;

}

async function loadUploadLog(){

    try{

        const container =
            document.getElementById(
                "uploadLog"
            );

        container.innerHTML =
            "Coming Soon";

    }
    catch(error){

        console.error(error);

    }

}

loadUploadLog();

uploadBtn.addEventListener(
    "click",
    () => {

        alert(
            "Upload Engine Coming Soon"
        );

    }
);
