import base, { TABLES } from "../lib/airtable.js";

export default async function handler(req, res){

    try{

        const matches =
            await base(TABLES.matches)
                .select({
                    sort: [
                        {
                            field: "match_date",
                            direction: "asc"
                        }
                    ]
                })
                .all();

        const stagesMap = {};

        let firstGroupDate = null;

        matches.forEach(match => {

            const stage =
                match.fields.stage;

            const date =
                match.fields.match_date;

            if(
                stage ===
                "Group Phase - Match#1"
            ){

                if(
                    !firstGroupDate ||
                    date < firstGroupDate
                ){

                    firstGroupDate = date;

                }

            }

        });

        matches.forEach(match => {

            const stage =
                match.fields.stage;

            const date =
                match.fields.match_date;

            if(!stage){

                return;

            }

            if(!stagesMap[stage]){

                stagesMap[stage] = {

                    stage,

                    from: date,

                    to: date

                };

            }

            if(date < stagesMap[stage].from){

                stagesMap[stage].from = date;

            }

            if(date > stagesMap[stage].to){

                stagesMap[stage].to = date;

            }

        });

        const stages = [];

             if(firstGroupDate){

    const d =
        new Date(
            firstGroupDate +
            "T12:00:00"
        );

    d.setDate(
        d.getDate() - 1
    );

    const beforeDate =
        d.toISOString()
         .slice(0,10);

    let earliestDate = null;

    matches.forEach(match => {

        const stage =
            match.fields.stage;

        const date =
            match.fields.match_date;

        if(
            !stage &&
            (
                !earliestDate ||
                date < earliestDate
            )
        ){

            earliestDate = date;

        }

    });

    stages.push({

        stage:
            "Before World Cup Start",

        from:
            earliestDate,

        to:
            beforeDate

    });

}

     stages.push(
    ...Object.values(stagesMap)
        .sort(
            (a, b) =>
                a.from.localeCompare(
                    b.from
                )
        )
);

        res.status(200).json(stages);

    }
    catch(error){

        console.error(error);

        res.status(500).json({

            error:
                error.message

        });

    }

}
