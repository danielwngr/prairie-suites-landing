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
    current_workplace,
    portfolio_url,
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

  // This page is solely a tenant/lease interest form now (no more "just
  // keep me updated" audience), so every row is a tenant lead by definition.
  const { error } = await supabase.from("leads").insert({
    name: name.trim(),
    email: email.trim(),
    phone: phone ? String(phone).trim() : null,
    interest_type: "tenant",
    experience: experience ? String(experience).trim() : null,
    current_workplace: current_workplace ? String(current_workplace).trim() : null,
    portfolio_url: portfolio_url ? String(portfolio_url).trim() : null,
    message: message ? String(message).trim() : null,
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: "Could not save your submission. Please try again." });
  }

  return res.status(200).json({ ok: true });
};
