import base, { TABLES } from "../lib/airtable.js";

export default async function handler(req, res) {

    try {

        const {
            table,
            date
        } = req.query;

        const records =
            await base(table)
                .select()
                .all();

        const filtered =
            records.filter(record => {

                return (
                    record.fields.fecha === date
                );

            });

        return res.status(200).json({

            count: filtered.length

        });

    }
    catch(error){

        return res.status(500).json({
            error:error.message
        });

    }

}
