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

        let created = 0;

        let updated = 0;

        for(const row of records){

            const primaryKey =
                buildPrimaryKey(
                    uploadDate,
                    row
                );

            const existing =
                await findExisting(
                    primaryKey
                );

            const fields = {

                primary_key:
                    primaryKey,

                fecha:
                    uploadDate,

                network:
                    row["Social Network"],

                media_type:
                    row["Media Type"],

                posts:
                    Number(
                        row["Volume of Published Messages (SUM)"] || 0
                    ),

                video_views:
                    Number(
                        row["Total Video Views Cross Platform - BI (SUM)"] || 0
                    ),

                engagement:
                    Number(
                        row["Total Engagements Cross-Platform - BI (SUM)"] || 0
                    ),

                account_name:
                    row["Accounts"] ||
                    row["Account"] ||
                    "",

                tournament_day:
                    matches?.[0]?.tournament_day || null,

                matchday:
                    matches?.[0]?.matchday || null,

                stage:
                    matches?.[0]?.stage || null

            };

            if(existing){

                await base(
                    TABLES.social
                ).update([
                    {
                        id:existing.id,
                        fields
                    }
                ]);

                updated++;

            }
            else{

                await base(
                    TABLES.social
                ).create([
                    {
                        fields
                    }
                ]);

                created++;

            }

        }

        return res.status(200).json({

            success:true,

            created,

            updated

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

function buildPrimaryKey(
    uploadDate,
    row
){

    return `${uploadDate}_ESPNMUNDIAL_${row["Social Network"]}_${row["Media Type"]}`;

}

async function findExisting(
    primaryKey
){

    const records =
        await base(
            TABLES.social
        )
        .select({

            filterByFormula:
                `{primary_key}="${primaryKey}"`

        })
        .firstPage();

    return records[0] || null;

}
