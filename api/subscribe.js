const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_INTEREST_TYPES = ["tenant", "updates", "other"];

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  }
  body = body || {};

  const { name, email, phone, interest_type, message, company } = body;

  // Honeypot: real users never fill this in. Bots often do.
  // Pretend success so the bot doesn't learn anything, but don't write to the DB.
  if (company && String(company).trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: "A valid email is required" });
  }

  const cleanInterestType = ALLOWED_INTEREST_TYPES.includes(interest_type)
    ? interest_type
    : "other";

  const { error } = await supabase.from("leads").insert({
    name: name.trim(),
    email: email.trim(),
    phone: phone ? String(phone).trim() : null,
    interest_type: cleanInterestType,
    message: message ? String(message).trim() : null,
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: "Could not save your submission. Please try again." });
  }

  return res.status(200).json({ ok: true });
};
