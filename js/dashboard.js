function ordinal(n) {

    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;

    return (
        n +
        (
            s[(v - 20) % 10] ||
            s[v] ||
            s[0]
        )
    );

}

function formatSourceDate(dateStr) {

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

const sourceText =

`Sources: Sprinklr Data, YouTube Studio & Adobe Analytics, ${formatSourceDate(firstDate)} to ${formatSourceDate(lastDate)}, All South Accounts`;
