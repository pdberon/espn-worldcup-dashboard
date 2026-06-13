import base, { TABLES } from "../lib/airtable.js";

export default async function handler(req,res){

    if(req.method !== "POST"){

        return res.status(405).json({
            error:"Method not allowed"
        });

    }

    try{

        const {
            uploadDate,
            matches,
            metrics
        } = req.body;

        const primaryKey =
            `${uploadDate}_ESPN_Fans`;

        const tournamentDay =
            matches?.[0]?.tournament_day || null;

        const matchday =
            matches?.[0]?.matchday || null;

        const stage =
            matches?.[0]?.stage || null;

        console.log(
            "MATCH DATA",
            JSON.stringify(matches?.[0], null, 2)
        );

        
        const fields = {

            primary_key:
                primaryKey,

            account:
                "ESPN Fans",

            fecha:
                uploadDate,

            video_views_total:
                metrics.videoViewsTotal,

            watch_time_hours_total:
                metrics.watchTimeTotal,

            live_video_views:
                metrics.liveVideoViews,

            live_watch_time_hours:
                metrics.liveWatchTime,

            non_live_video_views:
                metrics.videoViewsTotal -
                metrics.liveVideoViews,

            non_live_watch_time_hours:
                metrics.watchTimeTotal -
                metrics.liveWatchTime,

            tournament_day:
                tournamentDay,

matchday:
    null,

            stage:
                stage

        };

        const existing =
            await base(TABLES.youtube)
            .select({

                filterByFormula:
                    `{primary_key}="${primaryKey}"`

            })
            .firstPage();

        if(existing.length){

            await base(TABLES.youtube)
            .update([
                {
                    id:existing[0].id,
                    fields
                }
            ]);

            return res.status(200).json({

                success:true,
                created:0,
                updated:1

            });

        }

        await base(TABLES.youtube)
        .create([
            {
                fields
            }
        ]);

        return res.status(200).json({

            success:true,
            created:1,
            updated:0

        });

    }
    catch(error){

        console.error(error);

        return res.status(500).json({

            success:false,
            error:error.message

        });

    }

}
