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

    const hasSocial =
        state.socialGeneral.length > 0;

    const hasWebsite =
        state.website.length > 0;

    const hasYoutube =
        state.youtube.length > 0;

    if(
        !hasSocial &&
        !hasWebsite &&
        !hasYoutube
    ){

        addValidationError(
            "No files selected"
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
        await parseWebsiteAdobe(
            file
        );

    const websiteRows =
        rows.filter(
            r => r.section === "WEBSITE"
        );

    const referralRows =
        rows.filter(
            r => r.section === "REFERRAL"
        );

    html += `
        <p>
            <b>${file.name}</b><br>
            Regions:
            ${websiteRows.length}<br>
            Referrals:
            ${referralRows.length}
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
    uploadData
);

 async function uploadData(){

    if(!state.validation.ready){

        alert(
            state.validation.errors.join("\n")
        );

        return;

    }

    try{

        uploadBtn.disabled = true;

        uploadBtn.innerText =
            "Uploading...";

        let socialResult = null;
        let categoriesResult = null;
        let websiteResult = null;
        let youtubeResult = null;   

        if(
            state.socialGeneral.length > 0
        ){

            socialResult =
                await uploadSocialGeneral();

        }

        if(
            state.socialCategories.length > 0
        ){

            categoriesResult =
                await uploadSocialCategories();

        }

      if(
    state.website.length > 0
){

    websiteResult =
        await uploadWebsite();

}

if(
    state.youtube.length > 0
){

    youtubeResult =
        await uploadYoutube();

}

        alert(`
SOCIAL GENERAL

Created:
${socialResult?.created || 0}

Updated:
${socialResult?.updated || 0}

SOCIAL CATEGORIES

Files:
${categoriesResult?.filesProcessed || 0}

Created:
${categoriesResult?.created || 0}

Updated:
${categoriesResult?.updated || 0}

YOUTUBE

Created:
${youtubeResult?.created || 0}

Updated:
${youtubeResult?.updated || 0}

WEBSITE

Created:
${websiteResult?.websiteCreated || 0}

Updated:
${websiteResult?.websiteUpdated || 0}

REFERRALS

Created:
${websiteResult?.referralCreated || 0}

Updated:
${websiteResult?.referralUpdated || 0}
`);

    }
    catch(error){

        console.error(error);

        alert(
            error.message
        );

    }
    finally{

        uploadBtn.disabled =
            false;

        uploadBtn.innerText =
            "UPLOAD TO AIRTABLE";

    }

}

   async function uploadSocialGeneral(){

    const allRows = [];

    for(const file of state.socialGeneral){

        const rows =
            await parseCsv(file);

        allRows.push(
            ...rows
        );

    }

    const matches =
        await getMatches(
            state.dataDate
        );

    const response =
        await fetch(
            "/api/upload-social",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                        "application/json"
                },

                body:JSON.stringify({

                    uploadDate:
                        state.dataDate,

                    matches,

                    records:
                        allRows

                })
            }
        );

    return await response.json();

}
           async function uploadSocialCategories(){

    const matches =
        await getMatches(
            state.dataDate
        );

    let totalCreated = 0;
    let totalUpdated = 0;
    let filesProcessed = 0;

    for(const file of state.socialCategories){

        const rows =
            await parseCsv(file);

        if(rows.length === 0){

            continue;

        }

        const category =
            detectCategory(
                file.name
            );

        const response =
            await fetch(
                "/api/upload-social-categories",
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                            "application/json"
                    },

                    body:JSON.stringify({

                        uploadDate:
                            state.dataDate,

                        matches,

                        category,

                        records:
                            rows

                    })
                }
            );

        const result =
            await response.json();

        filesProcessed++;

        totalCreated +=
            result.created || 0;

        totalUpdated +=
            result.updated || 0;

    }

    return {

        filesProcessed,
        created:
            totalCreated,
        updated:
            totalUpdated

    };

}

    async function uploadWebsite(){

    const matches =
        await getMatches(
            state.dataDate
        );

    const allRows = [];

    for(const file of state.website){

        const rows =
            await parseWebsiteAdobe(
                file
            );

        allRows.push(
            ...rows
        );

    }

    const response =
        await fetch(
            "/api/upload-website",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                        "application/json"
                },

                body:JSON.stringify({

                    uploadDate:
                        state.dataDate,

                    matches,

                    records:
                        allRows

                })
            }
        );

    return await response.json();

}

       async function parseWebsiteAdobe(file){

    const text =
        await file.text();

    const lines =
        text.split("\n");

    const records = [];

    for(let i=0;i<lines.length;i++){

        const line =
            lines[i].trim();

        if(
            !line.startsWith("# ")
        ){
            continue;
        }

        const title =
            line
                .replace("# ","")
                .trim()
                .toUpperCase();

        // REFFERAL VIDEO

        if(
            title.includes("REFFERAL VIDEO")
        ){

            const region =
                title.replace(
                    "REFFERAL VIDEO",
                    ""
                ).trim();

            const values =
                lines[i+5]
                ?.trim()
                ?.split(",");

            if(values?.length >= 6){

                records.push({

                    section:"REFERRAL",

                    region,

                    referral_type:
                        "REFFERAL VIDEO",

                    ref_search:
                        Number(values[1]),

                    ref_direct:
                        Number(values[2]),

                    ref_social:
                        Number(values[3]),

                    ref_other:
                        Number(values[4]),

                    ref_internal:
                        Number(values[5])

                });

            }

            continue;

        }

        // REFFERAL STORY

        if(
            title.includes("REFFERAL STORY")
        ){

            const region =
                title.replace(
                    "REFFERAL STORY",
                    ""
                ).trim();

            const values =
                lines[i+6]
                ?.trim()
                ?.split(",");

            if(values?.length >= 6){

                records.push({

                    section:"REFERRAL",

                    region,

                    referral_type:
                        "REFFERAL STORY",

                    ref_search:
                        Number(values[1]),

                    ref_direct:
                        Number(values[2]),

                    ref_social:
                        Number(values[3]),

                    ref_other:
                        Number(values[4]),

                    ref_internal:
                        Number(values[5])

                });

            }

            continue;

        }

        // IGNORAR CABECERAS

        if(
            title.includes("REPORT SUITE") ||
            title.includes("SEGMENTS") ||
            title.includes("DATE") ||
            title.includes("EXPORT DATA")
        ){
            continue;
        }

        // WEBSITE

        const values =
            lines[i+12]
            ?.trim()
            ?.split(",");

        if(values?.length >= 5){

            records.push({

                section:"WEBSITE",

                region:title,

                page_views:
                    Number(values[1]),

                page_views_dstory:
                    Number(values[2]),

                video_starts:
                    Number(values[3]),

                unique_visitors:
                    Number(values[4])

            });

        }

    }

    return records;

}

        async function uploadYoutube(){

    const matches =
        await getMatches(
            state.dataDate
        );

    const metrics = {

        videoViewsTotal:0,
        watchTimeTotal:0,
        liveVideoViews:0,
        liveWatchTime:0

    };

    for(const file of state.youtube){

        const rows =
            await parseCsv(file);

        if(!rows.length){
            continue;
        }

        const firstRow =
            rows[0];

        const name =
            file.name.toLowerCase();

        if(
            name.includes("views") &&
            !name.includes("live")
        ){

            metrics.videoViewsTotal =
                Number(
                    Object.values(
                        firstRow
                    )[1]
                );

        }

        if(
            name.includes("watch") &&
            !name.includes("live")
        ){

            metrics.watchTimeTotal =
                Number(
                    Object.values(
                        firstRow
                    )[1]
                );

        }

        if(
            name.includes("live") &&
            name.includes("views")
        ){

            metrics.liveVideoViews =
                Number(
                    Object.values(
                        firstRow
                    )[1]
                );

        }

        if(
            name.includes("live") &&
            name.includes("watch")
        ){

            metrics.liveWatchTime =
                Number(
                    Object.values(
                        firstRow
                    )[1]
                );

        }

    }

    const response =
        await fetch(
            "/api/upload-youtube",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                        "application/json"
                },

                body:JSON.stringify({

                    uploadDate:
                        state.dataDate,

                    matches,

                    metrics

                })
            }
        );

    return await response.json();

}
