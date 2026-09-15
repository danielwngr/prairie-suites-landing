const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const {
    name,
    email,
    phone,
    experience,
    employment_type,
    portfolio_url,
    timeline,
    client_base,
    services,
    referral_source,
    message,
    company,
  } = body;

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

  // services arrives as an array of checkbox values from the form; guard
  // against anything else (bad client, bot, manual API hit) before it hits
  // a text[] column.
  const cleanServices = Array.isArray(services)
    ? services.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim())
    : [];

  // This page is solely a tenant/lease interest form now (no more "just
  // keep me updated" audience), so every row is a tenant lead by definition.
  const { error } = await supabase.from("leads").insert({
    name: name.trim(),
    email: email.trim(),
    phone: phone ? String(phone).trim() : null,
    interest_type: "tenant",
    experience: experience ? String(experience).trim() : null,
    employment_type: employment_type ? String(employment_type).trim() : null,
    portfolio_url: portfolio_url ? String(portfolio_url).trim() : null,
    timeline: timeline ? String(timeline).trim() : null,
    client_base: client_base ? String(client_base).trim() : null,
    services: cleanServices,
    referral_source: referral_source ? String(referral_source).trim() : null,
    message: message ? String(message).trim() : null,
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: "Could not save your submission. Please try again." });
  }

  return res.status(200).json({ ok: true });
};
