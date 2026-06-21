import stages from "../lib/stages.js";

export default function handler(req, res) {
    res.status(200).json(stages);
}
