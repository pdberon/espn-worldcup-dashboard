import base, { TABLES } from "../lib/airtable.js";

export default async function handler(req, res) {

    if(req.method !== "POST"){

        return res.status(405).json({
            error: "Method not allowed"
        });

    }

    try{

        const {
            records,
            uploadDate,
            matches,
            tournamentDay
        } = req.body;

        if(!records || !records.length){

            return res.status(400).json({
                error: "No records supplied"
            });

        }

        let created = 0;
        let updated = 0;

        for(const row of records){

            const primaryKey =
                buildPrimaryKey(row);

            const existing =
                await findExisting(
                    primaryKey
                );

            const fields = {

                primary_key:
                    primaryKey,

                fecha:
                    uploadDate,

                account_name:
                    row.account_name,

                network:
                    row.network,

                media_type:
                    row.media_type,

                posts:
                    Number(row.posts || 0),

                video_views:
                    Number(row.video_views || 0),

                engagement:
                    Number(row.engagement || 0),

                is_sports_account:
                    Boolean(
                        row.is_sports_account
                    ),

                tournament_day:
                    tournamentDay || null
            };

            if(existing){

                await base(
                    TABLES.social
                ).update([
                    {
                        id: existing.id,
                        fields
                    }
                ]);

                updated++;

            }else{

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

        await writeUploadLog({

            uploadType:
                "SOCIAL",

            created,

            updated,

            recordsFound:
                records.length

        });

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

function buildPrimaryKey(row){

    const date =
        row.fecha
            .replaceAll("-","");

    const account =
        sanitize(
            row.account_name
        );

    const network =
        sanitize(
            row.network
        );

    const mediaType =
        sanitize(
            row.media_type
        );

    return `${date}_${account}_${network}_${mediaType}`;

}

function sanitize(value){

    return String(value || "")
        .toUpperCase()
        .replaceAll(" ","_");

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
                `{primary_key}='${primaryKey}'`

        })
        .firstPage();

    return records[0] || null;

}

async function writeUploadLog(data){

    const timestamp =
        new Date()
        .toISOString();

    await base(
        TABLES.uploadLog
    ).create([{

        fields:{

            primary_key:
                `UPLOAD_${timestamp}`,

            upload_batch_id:
                timestamp,

            upload_type:
                data.uploadType,

            upload_date:
                timestamp,

            records_found:
                data.recordsFound,

            records_created:
                data.created,

            records_updated:
                data.updated,

            records_failed:
                0,

            status:
                "SUCCESS"

        }

    }]);

}
