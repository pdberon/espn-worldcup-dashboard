import base, { TABLES } from "../lib/airtable.js";

export default async function handler(req, res) {

    try {

        const date = req.query.date;

        const records = await base(TABLES.matches)
            .select()
            .all();

        const matches = records.filter(record => {

            const matchDate =
                record.fields.match_date;

            return matchDate === date;

        });

        return res.status(200).json(

            matches.map(record => ({
                id: record.id,
                ...record.fields
            }))

        );

    }
    catch(error){

        return res.status(500).json({
            error: error.message
        });

    }

}
