import base, { TABLES } from "../lib/airtable.js";

export async function createUploadLog(data) {

  const record =
    await base(TABLES.uploadLog)
      .create([
        {
          fields: data
        }
      ]);

  return record;
}
