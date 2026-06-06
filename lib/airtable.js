import Airtable from "airtable";

const base = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN
}).base(process.env.AIRTABLE_BASE_ID);

export default base;

export const TABLES = {
  social: "tbl1mS2oV7IQgAjv5",
  youtube: "tblpGZTVf3Z02YWc8",
  website: "tblDAqCKi02acc2Nf",
  websiteRef: "tblHVgjnGwuFhUiGd",
  socialCategories: "tblUM5tCn6PqEve2p",
  matches: "tblmZRYEe1g2oPCwQ",
  uploadLog: "tblV1LedkP720UBW1"
};
