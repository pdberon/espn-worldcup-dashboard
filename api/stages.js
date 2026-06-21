import base, { TABLES } from "../lib/airtable.js";

export default async function handler(req, res) {

    try {

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
        let lastDate = null;
        let earliestNoStage = null;

        matches.forEach(match => {

            const stage =
                match.fields.stage;

            const date =
                match.fields.match_date;

            if (
                stage ===
                "Group Phase - Match#1"
            ) {

                if (
                    !firstGroupDate ||
                    date < firstGroupDate
                ) {

                    firstGroupDate = date;

                }

            }

            if (
                !lastDate ||
                date > lastDate
            ) {

                lastDate = date;

            }

            if (
                !stage &&
                (
                    !earliestNoStage ||
                    date < earliestNoStage
                )
            ) {

                earliestNoStage = date;

            }

            if (!stage) {
                return;
            }

            if (!stagesMap[stage]) {

                stagesMap[stage] = {

                    stage,

                    from: date,

                    to: date

                };

            }

            if (
                date <
                stagesMap[stage].from
            ) {

                stagesMap[stage].from =
                    date;

            }

            if (
                date >
                stagesMap[stage].to
            ) {

                stagesMap[stage].to =
                    date;

            }

        });

        const stages = [];

        if (
            earliestNoStage &&
            firstGroupDate
        ) {

            const d =
                new Date(
                    firstGroupDate +
                    "T12:00:00"
                );

            d.setDate(
                d.getDate() - 1
            );

            stages.push({

                stage:
                    "Before World Cup Start",

                from:
                    earliestNoStage,

                to:
                    d.toISOString()
                     .slice(0,10)

            });

        }

        const groupStages = [

            "Group Phase - Match#1",
            "Group Phase - Match#2",
            "Group Phase - Match#3"

        ];

        const playoffStages = [

            "Round of 32 - 16vos de final",
            "Round of 16 - Octavos de Final",
            "Quarterfinals - Cuartos de final",
            "Semi-Finals - Semifinales",
            "Third Place - Tercer Puesto",
            "Final"

        ];

        const groupData =
            Object.values(stagesMap)
                .filter(
                    s =>
                        groupStages.includes(
                            s.stage
                        )
                )
                .sort(
                    (a,b) =>
                        a.from.localeCompare(
                            b.from
                        )
                );

        if (groupData.length) {

            stages.push({

                stage:
                    "Group Phase",

                from:
                    groupData[0].from,

                to:
                    groupData[
                        groupData.length - 1
                    ].to

            });

        }

        const playoffData =
            Object.values(stagesMap)
                .filter(
                    s =>
                        playoffStages.includes(
                            s.stage
                        )
                )
                .sort(
                    (a,b) =>
                        a.from.localeCompare(
                            b.from
                        )
                );

        if (playoffData.length) {

            stages.push({

                stage:
                    "Playoff Phase",

                from:
                    playoffData[0].from,

                to:
                    playoffData[
                        playoffData.length - 1
                    ].to

            });

        }

        if (
            firstGroupDate &&
            lastDate
        ) {

            stages.push({

                stage:
                    "Full World Cup",

                from:
                    firstGroupDate,

                to:
                    lastDate

            });

        }

        stages.push(

            ...Object.values(stagesMap)
                .sort(
                    (a,b) =>
                        a.from.localeCompare(
                            b.from
                        )
                )

        );

        res.status(200).json(stages);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                error.message

        });

    }

}
