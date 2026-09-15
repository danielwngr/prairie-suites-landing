document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("interest-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();

  if (!name || !email) {
    statusEl.textContent = "Please fill in your name and email.";
    statusEl.className = "error";
    return;
  }

  const payload = {
    name,
    email,
    phone: form.phone.value.trim(),
    experience: form.experience.value,
    current_workplace: form.current_workplace.value.trim(),
    portfolio_url: form.portfolio_url.value.trim(),
    message: form.message.value.trim(),
    company: form.company.value.trim(), // honeypot, should stay empty
  };

  submitBtn.disabled = true;
  statusEl.textContent = "Submitting...";
  statusEl.className = "";

  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong. Please try again.");
    }

    statusEl.textContent = "Thanks! We'll be in touch.";
    statusEl.className = "success";
    form.reset();
  } catch (err) {
    statusEl.textContent = err.message || "Something went wrong. Please try again.";
    statusEl.className = "error";
  } finally {
    submitBtn.disabled = false;
  }
});
