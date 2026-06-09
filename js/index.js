document.addEventListener(
    "DOMContentLoaded",
    loadDashboardSummary
);

async function loadDashboardSummary(){

    try{

        const response =
            await fetch(
                "/api/dashboard-summary"
            );

        const data =
            await response.json();

        document.getElementById(
            "tournamentDay"
        ).innerText =
            data.tournamentDay
            ? `Tournament Day ${data.tournamentDay}`
            : "World Cup 2026";

        document.getElementById(
            "stage"
        ).innerText =
            data.stage || "";

        document.getElementById(
            "latestDate"
        ).innerText =
            data.latestDate || "";

        document.getElementById(
            "totalEngagement"
        ).innerText =
            formatNumber(
                data.totalEngagement
            );

        document.getElementById(
            "totalVideoViews"
        ).innerText =
            formatNumber(
                data.totalVideoViews
            );

        document.getElementById(
            "totalPageViews"
        ).innerText =
            formatNumber(
                data.totalPageViews
            );

        document.getElementById(
            "avgUniqueVisitors"
        ).innerText =
            formatNumber(
                data.avgUniqueVisitors
            );

        document.getElementById(
            "totalPosts"
        ).innerText =
            formatNumber(
                data.totalPosts
            );

        document.getElementById(
            "totalWatchTime"
        ).innerText =
            formatNumber(
                data.totalWatchTime
            );

        document.getElementById(
            "totalContentStarts"
        ).innerText =
            formatNumber(
                data.totalContentStarts
            );

        document.getElementById(
            "totalLiveViews"
        ).innerText =
            formatNumber(
                data.totalLiveViews
            );

        const matchesContainer =
            document.getElementById(
                "matchesContainer"
            );

        matchesContainer.innerHTML =
            "";

        data.todayMatches.forEach(
            match => {

                matchesContainer.innerHTML += `
                    <div class="match-card">
                        ${match}
                    </div>
                `;

            }
        );

    }
    catch(error){

        console.error(error);

    }

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
