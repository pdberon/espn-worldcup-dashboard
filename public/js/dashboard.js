document.addEventListener(
    "DOMContentLoaded",
    initDashboard
);

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

        table.innerHTML += `
            <tr>
                <td>${row.network}</td>
                <td>${formatNumber(row.posts)}</td>
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

    rows.forEach(row => {

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

function formatSourceDate(
    dateStr
){

    const d =
        new Date(dateStr);

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


document
.getElementById("exportImageBtn")
?.addEventListener("click", async () => {

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

    const link =
        document.createElement("a");

    link.download =
        `world-cup-dashboard-${Date.now()}.png`;

    link.href =
        canvas.toDataURL("image/png");

    link.click();

});


document
.querySelectorAll(
    'input[type="date"]'
)
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
