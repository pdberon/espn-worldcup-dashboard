import base, { TABLES } from "../lib/airtable.js";

export default async function handler(req,res){

    try{

        const [
            social,
            website,
            youtube,
            matches
        ] = await Promise.all([

            base(TABLES.social)
            .select()
            .all(),

            base(TABLES.website)
            .select()
            .all(),

            base(TABLES.youtube)
            .select()
            .all(),

            base(TABLES.matches)
            .select({
                sort:[
                    {
                        field:"match_date",
                        direction:"desc"
                    }
                ]
            })
            .all()

        ]);

        const totalEngagement =
            social.reduce(
                (sum,row)=>
                    sum +
                    (
                        row.fields
                        .engagement || 0
                    ),
                0
            );

        const totalPosts =
            social.reduce(
                (sum,row)=>
                    sum +
                    (
                        row.fields.posts || 0
                    ),
                0
            );

        const totalSocialViews =
            social.reduce(
                (sum,row)=>
                    sum +
                    (
                        row.fields.video_views || 0
                    ),
                0
            );

        const totalPageViews =
            website.reduce(
                (sum,row)=>
                    sum +
                    (
                        row.fields.page_views || 0
                    ),
                0
            );

        const totalContentStarts =
            website.reduce(
                (sum,row)=>
                    sum +
                    (
                        row.fields.video_starts || 0
                    ),
                0
            );

        const totalUniqueVisitors =
            website.reduce(
                (sum,row)=>
                    sum +
                    (
                        row.fields.unique_visitors || 0
                    ),
                0
            );

        const avgUniqueVisitors =
            website.length
                ? Math.round(
                    totalUniqueVisitors /
                    website.length
                )
                : 0;

        const totalYoutubeViews =
            youtube.reduce(
                (sum,row)=>
                    sum +
                    (
                        row.fields
                        .video_views_total || 0
                    ),
                0
            );

        const totalWatchTime =
            youtube.reduce(
                (sum,row)=>
                    sum +
                    (
                        row.fields
                        .watch_time_hours_total || 0
                    ),
                0
            );

        const totalLiveViews =
            youtube.reduce(
                (sum,row)=>
                    sum +
                    (
                        row.fields
                        .live_video_views || 0
                    ),
                0
            );

        const latestYoutube =
            youtube
            .sort(
                (
                    a,
                    b
                )=>
                    new Date(
                        b.fields.fecha
                    ) -
                    new Date(
                        a.fields.fecha
                    )
            )[0];

        const latestDate =
            latestYoutube?.fields
            ?.fecha;

        const todayMatches =
            matches
            .filter(
                m =>
                    m.fields.match_date ===
                    latestDate
            )
            .map(
                m =>
                    m.fields.match_name
            );

        res.status(200).json({

            latestDate,

            tournamentDay:
                latestYoutube
                ?.fields
                ?.tournament_day || null,

            stage:
                latestYoutube
                ?.fields
                ?.stage || null,

            totalEngagement,

            totalPosts,

            totalVideoViews:
                totalSocialViews +
                totalYoutubeViews +
                totalContentStarts,

            totalPageViews,

            avgUniqueVisitors,

            totalWatchTime:
                Math.round(
                    totalWatchTime
                ),

            totalContentStarts,

            totalLiveViews,

            todayMatches

        });

    }
    catch(error){

        console.error(error);

        res.status(500).json({

            error:error.message

        });

    }

}
