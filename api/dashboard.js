// vercel function placeholder
import base, { TABLES } from "../lib/airtable.js";

export default async function handler(req, res) {

  try {

    const social =
      await base(TABLES.social)
        .select()
        .all();

    const youtube =
      await base(TABLES.youtube)
        .select()
        .all();

    const website =
      await base(TABLES.website)
        .select()
        .all();

    return res.status(200).json({

      socialCount: social.length,

      youtubeCount: youtube.length,

      websiteCount: website.length

    });

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }

}
