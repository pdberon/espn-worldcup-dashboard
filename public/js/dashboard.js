document.addEventListener(
    "DOMContentLoaded",
    initDashboard
);

let currentData = null;
let currentFrom = null;
let currentTo = null;


async function initDashboard(){

    await loadDates();

}

async function loadDates(){

    try{

        const response =
            await fetch(
                "/api/dashboard-summary"
            );

        const summary =
            await response.json();

        const fromInput =
            document.getElementById(
                "fromDate"
            );

        const toInput =
            document.getElementById(
                "toDate"
            );

        fromInput.value =
            summary.firstDate;

        toInput.value =
            summary.latestDate;

        await loadStages();

        document
            .getElementById(
                "applyBtn"
            )
            .addEventListener(
                "click",
                () => {

                    loadDashboard(
                        fromInput.value,
                        toInput.value
                    );

                }
            );

        await loadDashboard(
            summary.firstDate,
            summary.latestDate
        );

    }
    catch(error){

        console.error(error);

    }

}

async function loadDashboard(
    from,
    to
){

    try{

        const response =
            await fetch(
                `/api/dashboard-data?from=${from}&to=${to}`
            );

        const data =
            await response.json();

        currentData = data;
        currentFrom = from;
        currentTo = to;

        renderKpis(
            data.kpis
        );

        renderSocial(
            data.socialBreakdown
        );

        renderContent(
            data.contentBreakdown
        );

        renderWebsite(
            data.websiteBreakdown
        );

        renderReferrals(
            data.referralBreakdown
        );

        renderYoutube(
            data.youtube
        );

        renderSources(
            data.dateRange
        );

    }
    catch(error){

        console.error(error);

    }

}

async function loadStages(){

    try{

        const response =
            await fetch(
                "/api/stages"
            );

        const stages =
            await response.json();

        const select =
            document.getElementById(
                "stageFilter"
            );

        stages.forEach(stage => {

            select.innerHTML += `
                <option value="${stage.stage}">
                    ${stage.stage}
                </option>
            `;

        });

        select.addEventListener(
            "change",
            () => {

                const selected =
                    stages.find(
                        s =>
                            s.stage ===
                            select.value
                    );

if(!selected){

    return;

}
                document
                    .getElementById(
                        "fromDate"
                    )
                    .value =
                    selected.from;

                document
                    .getElementById(
                        "toDate"
                    )
                    .value =
                    selected.to;

                loadDashboard(
                    selected.from,
                    selected.to
                );

            }
        );

    }
    catch(error){

        console.error(error);

    }

}





function renderKpis(kpis){

    document.getElementById(
        "kpiEngagement"
    ).innerText =
        formatNumber(
            kpis.engagement
        );

    document.getElementById(
        "kpiPosts"
    ).innerText =
        formatNumber(
            kpis.posts
        );

    
    document.getElementById(
        "kpiVideoViews"
    ).innerText =
        formatNumber(
            kpis.totalVideoViews
        );
    document.getElementById(
        "kpiPageViews"
    ).innerText =
        formatNumber(
            kpis.pageViews
        );

    document.getElementById(
        "kpiContentStarts"
    ).innerText =
        formatNumber(
            kpis.contentStarts
        );

    document.getElementById(
        "kpiUniqueVisitors"
    ).innerText =
        formatNumber(
            kpis.avgUniqueVisitors
        );

}

function renderSocial(rows){

    const table =
        document.getElementById(
            "socialTable"
        );

    table.innerHTML = "";

    rows.forEach(row => {

        const postsValue =
            row.network === "YouTube"
                ? "N/A"
                : formatNumber(row.posts);
        
        table.innerHTML += `
        <tr>
            <td>${row.network}</td>
            <td>${postsValue}</td>
            <td>${formatNumber(row.videoViews)}</td>
            <td>${formatNumber(row.engagement)}</td>
        </tr>
        `;

    });

}

function renderContent(rows){

    const table =
        document.getElementById(
            "contentTable"
        );

    table.innerHTML = "";

    rows.forEach(row => {

        table.innerHTML += `
            <tr>
                <td>${row.category}</td>
                <td>${formatNumber(row.posts)}</td>
                <td>${formatNumber(row.videoViews)}</td>
                <td>${formatNumber(row.engagement)}</td>
            </tr>
        `;

    });

}

function renderWebsite(rows){

    const table =
        document.getElementById(
            "websiteTable"
        );

    table.innerHTML = "";

    const regionalRows =
        rows.filter(
            r =>
                r.region === "SOUTH" ||
                r.region === "LATAM"
        );

    const countryRows =
        rows.filter(
            r =>
                r.region !== "SOUTH" &&
                r.region !== "LATAM"
        );

    countryRows.sort(
        (a, b) =>
            a.region.localeCompare(
                b.region
            )
    );

    [
        ...regionalRows,
        { separator: true },
        ...countryRows
    ].forEach(row => {

        if (row.separator) {

            table.innerHTML += `
                <tr>
                    <td colspan="5"
                        style="
                            border-top:2px solid rgba(255,255,255,.25);
                            height:12px;
                        ">
                    </td>
                </tr>
            `;

            return;
        }

        table.innerHTML += `
            <tr>
                <td>${row.region}</td>
                <td>${formatNumber(row.pageViews)}</td>
                <td>${formatNumber(row.pageViewsDstory)}</td>
                <td>${formatNumber(row.contentStarts)}</td>
                <td>${formatNumber(row.uniqueVisitors)}</td>
            </tr>
        `;

    });

}

function renderReferrals(rows){

    const table =
        document.getElementById(
            "referralTable"
        );

    table.innerHTML = "";

    rows.forEach(row => {

        table.innerHTML += `
            <tr>
                <td>${row.source}</td>
                <td>${formatNumber(row.video)}</td>
                <td>${formatNumber(row.story)}</td>
                <td>${formatNumber(row.total)}</td>
            </tr>
        `;

    });

}

function renderYoutube(data){

    window.youtubeViews =
    data.videoViews || 0;
    
    document.getElementById(
        "ytViews"
    ).innerText =
        formatNumber(
            data.videoViews
        );

    document.getElementById(
        "ytWatchTime"
    ).innerText =
        formatNumber(
            Math.round(
                data.watchTime
            )
        );

    document.getElementById(
        "ytLiveViews"
    ).innerText =
        formatNumber(
            data.liveViews
        );

    document.getElementById(
        "ytLiveWatchTime"
    ).innerText =
        formatNumber(
            Math.round(
                data.liveWatchTime
            )
        );

}

function renderSources(
    dateRange
){

    const start =
        formatSourceDate(
            dateRange.startDate
        );

    const end =
        formatSourceDate(
            dateRange.endDate
        );

    const range =
        start === end
            ? start
            : `${start} to ${end}`;

    document.getElementById(
        "sourcesText"
    ).innerText =

        `Sources: Sprinklr Data, YouTube Studio & Adobe Analytics | ${range} | All South Accounts`;

}

function formatNumber(value){

    if(value >= 1000000){

        return (
            value / 1000000
        ).toFixed(1) + "M";

    }

    if(value >= 1000){

        return (
            value / 1000
        ).toFixed(1) + "K";

    }

    return value;

}

function ordinal(n){

    const s = [
        "th",
        "st",
        "nd",
        "rd"
    ];

    const v = n % 100;

    return n +

        (
            s[
                (v - 20) % 10
            ] ||

            s[v] ||

            s[0]
        );

}

function formatSourceDate(dateStr){

    const [year, month, day] =
        dateStr.split('-').map(Number);

    const months = [

        "Jan.",
        "Feb.",
        "Mar.",
        "Apr.",
        "May.",
        "Jun.",
        "Jul.",
        "Aug.",
        "Sep.",
        "Oct.",
        "Nov.",
        "Dec."

    ];

    return `${months[month - 1]} ${ordinal(day)}`;

}


document
.getElementById("exportImageBtn")
?.addEventListener("click", async () => {

    const controls =
    document.querySelector('.date-range-container');

controls.style.visibility = 'hidden';

    
    const dashboard =
    document.getElementById('export-container');

const canvas =
    await html2canvas(dashboard, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: dashboard.scrollWidth,
        windowHeight: dashboard.scrollHeight
    
    });

    document
        .getElementById("exportPdfBtn")
        ?.addEventListener(
            "click",
            exportPdf
        );
    
const finalCanvas =
    document.createElement('canvas');

const ctx =
    finalCanvas.getContext('2d');

finalCanvas.width =
    canvas.width;

finalCanvas.height =
    canvas.height;

ctx.fillStyle = "#000000";

ctx.fillRect(
    0,
    0,
    finalCanvas.width,
    finalCanvas.height
);

// CAPA 2 - ONDAS

const ondas =
    new Image();

ondas.src =
    '/assets/ondas7.png';

await new Promise(resolve => {
    ondas.onload = resolve;
});

ctx.drawImage(
    ondas,
    0,
    0,
    finalCanvas.width,
    finalCanvas.height
);

// CAPA 3 - BORDE

const borde =
    new Image();

borde.src =
    '/assets/borde_colores.png';

await new Promise(resolve => {
    borde.onload = resolve;
});

ctx.drawImage(
    borde,
    0,
    0,
    finalCanvas.width,
    finalCanvas.height
);

// CAPA 4 - DASHBOARD

ctx.drawImage(
    canvas,
    0,
    0
);
    
    const link =
        document.createElement("a");

    link.download =
        `world-cup-dashboard-${Date.now()}.png`;

    link.href =
        finalCanvas.toDataURL("image/png");

    link.click();
controls.style.visibility = '';
});


document
.querySelectorAll(
    'input[type="date"]'
)

    function pdfDate(dateStr){

    const d = new Date(dateStr);

    const months = [
        "Jan.",
        "Feb.",
        "Mar.",
        "Apr.",
        "May.",
        "Jun.",
        "Jul.",
        "Aug.",
        "Sep.",
        "Oct.",
        "Nov.",
        "Dec."
    ];

    return `${months[d.getMonth()]} ${ordinal(d.getDate())}`;

}

function pdfRange(){

    return `${pdfDate(currentFrom)} to ${pdfDate(currentTo)}`;

}

function slideFooter(source){

    return `Sources: ${source} | ${pdfRange()} | All LATAM`;

}

async function exportPdf(){

    const { jsPDF } = window.jspdf;

    const pdf =
        new jsPDF(
            "landscape",
            "px",
            [1600,900]
        );

    const dashboard =
        document.getElementById(
            "export-container"
        );

    const controls =
        document.querySelector(
            ".date-range-container"
        );

    controls.style.visibility =
        "hidden";

    const canvas =
        await html2canvas(
            dashboard,
            {
                scale:2,
                useCORS:true
            }
        );

    controls.style.visibility =
        "";

    pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        1600,
        900
    );

    pdf.save(
        "ESPN_Digital_Report.pdf"
    );

}
    
.forEach(input => {

    input.addEventListener(
        "click",
        () => {

            if(
                input.showPicker
            ){

                input.showPicker();

            }

        }
    );

});
