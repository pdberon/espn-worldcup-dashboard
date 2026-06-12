import base, { TABLES } from "../lib/airtable.js";

export default async function handler(req, res) {

    try {

        const from = req.query.from;
        const to = req.query.to;
        
        if (!from || !to) {
        
            return res.status(400).json({
                error: "from and to parameters required"
            });
        
        }

        const [
    social,
    categories,
    website,
    websiteRef,
    youtube
] = await Promise.all([

    base(TABLES.social)
        .select({
            filterByFormula:
                `AND(   DATETIME_FORMAT({fecha}, 'YYYY-MM-DD') >= '${from}',   
                DATETIME_FORMAT({fecha}, 'YYYY-MM-DD') <= '${to}' )`
        })
        .all(),

    base(TABLES.socialCategories)
        .select({
            filterByFormula:
                `AND(
  DATETIME_FORMAT({fecha}, 'YYYY-MM-DD') >= '${from}',
  DATETIME_FORMAT({fecha}, 'YYYY-MM-DD') <= '${to}'
)`
        })
        .all(),

    base(TABLES.website)
        .select({
            filterByFormula:
                `AND(
  DATETIME_FORMAT({fecha}, 'YYYY-MM-DD') >= '${from}',
  DATETIME_FORMAT({fecha}, 'YYYY-MM-DD') <= '${to}'
)`
        })
        .all(),

    base(TABLES.websiteRef)
        .select({
            filterByFormula:
                `AND(   DATETIME_FORMAT({fecha}, 'YYYY-MM-DD') >= '${from}',   
                DATETIME_FORMAT({fecha}, 'YYYY-MM-DD') <= '${to}' )`
        })
        .all(),

    base(TABLES.youtube)
        .select({
            filterByFormula:
                `AND(   DATETIME_FORMAT({fecha}, 'YYYY-MM-DD') >= '${from}',   
                DATETIME_FORMAT({fecha}, 'YYYY-MM-DD') <= '${to}' )`
        })
        .all()

]);


        const latamRows =
            website.filter(
                r =>
                    r.fields.region === "LATAM"
            );
        
        const latamPageViews =
            latamRows.reduce(
                (s, r) =>
                    s + (r.fields.page_views || 0),
                0
            );
        
        const latamUniqueVisitors =
            latamRows.length
                ? latamRows.reduce(
                      (s, r) =>
                          s + (r.fields.unique_visitors || 0),
                      0
                  ) / latamRows.length
                : 0;
        
        const latamContentStarts =
            latamRows.reduce(
                (s, r) =>
                    s + (r.fields.video_starts || 0),
                0
            );
        
        const latamPageViewsDstory =
            latamRows.reduce(
                (s, r) =>
                    s + (r.fields.page_views_dstory || 0),
                0
            );
        
        const kpis = {

            engagement:
                social.reduce(
                    (s, r) => s + (r.fields.engagement || 0),
                    0
                ),

            posts:
                social.reduce(
                    (s, r) => s + (r.fields.posts || 0),
                    0
                ),

            socialVideoViews:
                social.reduce(
                    (s, r) => s + (r.fields.video_views || 0),
                    0
                ),

           pageViews:
                latamPageViews,

            contentStarts:
                latamContentStarts,

            avgUniqueVisitors:
                latamUniqueVisitors,


            youtubeViews:
                youtube.reduce(
                    (s, r) =>
                        s + (r.fields.video_views_total || 0),
                    0
                ),

            youtubeWatchTime:
                youtube.reduce(
                    (s, r) =>
                        s + (r.fields.watch_time_hours_total || 0),
                    0
                ),

            liveViews:
                youtube.reduce(
                    (s, r) =>
                        s + (r.fields.live_video_views || 0),
                    0
                ),
            
            totalVideoViews:
            
                social.reduce(
                    (s, r) =>
                        s + (r.fields.video_views || 0),
                    0
                )
            
                +
            
                website.reduce(
                    (s, r) =>
                        s + (r.fields.video_starts || 0),
                    0
                )
            
                +
            
                youtube.reduce(
                    (s, r) =>
                        s + (r.fields.video_views_total || 0),
                    0
                )

        };

        const socialBreakdownMap = {};

        social.forEach(row => {

            const network =
                row.fields.network || "Unknown";

            if (!socialBreakdownMap[network]) {

                socialBreakdownMap[network] = {
                    network,
                    posts: 0,
                    videoViews: 0,
                    engagement: 0
                };

            }

            socialBreakdownMap[network].posts +=
                row.fields.posts || 0;

            socialBreakdownMap[network].videoViews +=
                row.fields.video_views || 0;

            socialBreakdownMap[network].engagement +=
                row.fields.engagement || 0;

        });

        const youtubeViewsTotal =
            youtube.reduce(
                (s, r) =>
                    s + (r.fields.video_views_total || 0),
                0
            );
        
        if (socialBreakdownMap["YouTube"]) {
        
            socialBreakdownMap["YouTube"].videoViews =
                youtubeViewsTotal;
        
        }

        
        const contentBreakdownMap = {};

        categories.forEach(row => {

            const category =
                row.fields.content_category || "Unknown";

            if (!contentBreakdownMap[category]) {

                contentBreakdownMap[category] = {
                    category,
                    posts: 0,
                    videoViews: 0,
                    engagement: 0
                };

            }

            contentBreakdownMap[category].posts +=
                row.fields.posts || 0;

            contentBreakdownMap[category].videoViews +=
                row.fields.video_views || 0;

            contentBreakdownMap[category].engagement +=
                row.fields.engagement || 0;

        });

        const websiteBreakdownMap = {};

website.forEach(row => {

    const region = row.fields.region || "Unknown";

            if (!websiteBreakdownMap[region]) {
        
                websiteBreakdownMap[region] = {
                    region,
                    pageViews: 0,
                    pageViewsDstory: 0,
                    contentStarts: 0,
                    uniqueVisitors: 0,
                    days: 0
                };
        
            }
        
            websiteBreakdownMap[region].pageViews +=
                row.fields.page_views || 0;

            websiteBreakdownMap[region].pageViewsDstory +=
                row.fields.page_views_dstory || 0;
    
            websiteBreakdownMap[region].contentStarts +=
                row.fields.video_starts || 0;
        
            websiteBreakdownMap[region].uniqueVisitors +=
                row.fields.unique_visitors || 0;
            
            websiteBreakdownMap[region].days += 1;
        
        });
        
            const websiteBreakdown =
                Object.values(websiteBreakdownMap)
                    .map(row => ({
            
                        ...row,
            
                        uniqueVisitors:
                            row.days
                                ? row.uniqueVisitors / row.days
                                : 0
            
                    }));

        const referralTotals = {

            SEARCH: {
                video: 0,
                story: 0
            },

            DIRECT: {
                video: 0,
                story: 0
            },

            SOCIAL: {
                video: 0,
                story: 0
            },

            OTHER: {
                video: 0,
                story: 0
            },

            INTERNAL: {
                video: 0,
                story: 0
            }

        };

        websiteRef.forEach(row => {

            const type =
                row.fields.referral_type;

            const bucket =
                type === "REFFERAL VIDEO"
                    ? "video"
                    : "story";

            referralTotals.SEARCH[bucket] +=
                row.fields.ref_search || 0;

            referralTotals.DIRECT[bucket] +=
                row.fields.ref_direct || 0;

            referralTotals.SOCIAL[bucket] +=
                row.fields.ref_social || 0;

            referralTotals.OTHER[bucket] +=
                row.fields.ref_other || 0;

            referralTotals.INTERNAL[bucket] +=
                row.fields.ref_internal || 0;

        });

        const referralBreakdown =
            Object.keys(referralTotals)
                .map(source => ({

                    source,

                    video:
                        referralTotals[source].video,

                    story:
                        referralTotals[source].story,

                    total:
                        referralTotals[source].video +
                        referralTotals[source].story

                }));

        
        console.log({

    social: social.length,

    categories: categories.length,

    website: website.length,

    websiteRef: websiteRef.length,

    youtube: youtube.length

});

      return res.status(200).json({

    kpis,

    pageViews:
    latamPageViews,

    contentStarts:
        latamContentStarts,
    
    avgUniqueVisitors:
        latamUniqueVisitors,

    socialBreakdown:
        Object.values(
            socialBreakdownMap
        ),

    contentBreakdown:
        Object.values(
            contentBreakdownMap
        ),

    websiteBreakdown,

    referralBreakdown,

    dateRange: {

        startDate: from,

        endDate: to

    },

    youtube: {

        videoViews:
            youtube.reduce(
                (s, r) =>
                    s + (r.fields.video_views_total || 0),
                0
            ),

        watchTime:
            youtube.reduce(
                (s, r) =>
                    s + (r.fields.watch_time_hours_total || 0),
                0
            ),

        liveViews:
            youtube.reduce(
                (s, r) =>
                    s + (r.fields.live_video_views || 0),
                0
            ),

        liveWatchTime:
            youtube.reduce(
                (s, r) =>
                    s + (r.fields.live_watch_time_hours || 0),
                0
            )

    }

});

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({

            error: error.message

        });

    }

}
