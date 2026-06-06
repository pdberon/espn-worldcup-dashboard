import base, { TABLES } from "../lib/airtable.js";

export default async function handler(req, res) {

  try {

    const date = req.query.date;

    const records = await base(TABLES.matches)
      .select({
        filterByFormula: `{match_date}="${date}"`
      })
      .all();

    const result = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

    return res.status(200).json(result);

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }

}
