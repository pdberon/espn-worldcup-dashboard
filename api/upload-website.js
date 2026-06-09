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
            records
        } = req.body;

        let websiteCreated = 0;
        let websiteUpdated = 0;

        let referralCreated = 0;
        let referralUpdated = 0;

        const tournamentDay =
            matches?.[0]?.tournament_day || null;

        const matchday =
            matches?.[0]?.matchday || null;

        const stage =
            matches?.[0]?.stage || null;

        for(const row of records){

            const section =
                row.section || "";

            if(section === "WEBSITE"){

                const primaryKey =
                    `${uploadDate}_${row.region}`;

                const existing =
                    await findExisting(
                        TABLES.website,
                        primaryKey
                    );

                const fields = {

                    primary_key:
                        primaryKey,

                    fecha:
                        uploadDate,

                    region:
                        row.region,

                    page_views:
                        row.page_views,

                    page_views_dstory:
                        row.page_views_dstory,

                    video_starts:
                        row.video_starts,

                    unique_visitors:
                        row.unique_visitors,

                    tournament_day:
                        tournamentDay,

                    matchday:
                        matchday,

                    stage:
                        stage

                };

                if(existing){

                    await base(
                        TABLES.website
                    ).update([
                        {
                            id:existing.id,
                            fields
                        }
                    ]);

                    websiteUpdated++;

                }else{

                    await base(
                        TABLES.website
                    ).create([
                        {
                            fields
                        }
                    ]);

                    websiteCreated++;

                }

            }

            if(section === "REFERRAL"){

                const primaryKey =
                    `${uploadDate}_${row.region}_${row.referral_type}`;

                const existing =
                    await findExisting(
                        TABLES.websiteRef,
                        primaryKey
                    );

                const fields = {

                    primary_key:
                        primaryKey,

                    fecha:
                        uploadDate,

                    region:
                        row.region,

                    referral_type:
                        row.referral_type,

                    ref_search:
                        row.ref_search,

                    ref_direct:
                        row.ref_direct,

                    ref_social:
                        row.ref_social,

                    ref_other:
                        row.ref_other,

                    ref_internal:
                        row.ref_internal,

                    tournament_day:
                        tournamentDay,

                    matchday:
                        matchday,

                    stage:
                        stage

                };

                if(existing){

                    await base(
                        TABLES.websiteRef
                    ).update([
                        {
                            id:existing.id,
                            fields
                        }
                    ]);

                    referralUpdated++;

                }else{

                    await base(
                        TABLES.websiteRef
                    ).create([
                        {
                            fields
                        }
                    ]);

                    referralCreated++;

                }

            }

        }

        return res.status(200).json({

            success:true,

            websiteCreated,
            websiteUpdated,

            referralCreated,
            referralUpdated

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

async function findExisting(
    table,
    primaryKey
){

    const records =
        await base(table)
        .select({

            filterByFormula:
                `{primary_key}="${primaryKey}"`

        })
        .firstPage();

    return records[0] || null;

}
