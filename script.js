// Update this URL if your FastAPI server runs on a different host or port
const API_URL = "https://mental-health-score-predictor-atct.onrender.com";

const form = document.getElementById("prediction-form");
const submitBtn = document.getElementById("submit-btn");
const resultCard = document.getElementById("result-card");
const scoreValue = document.getElementById("score-value");
const scoreContext = document.getElementById("score-context");
const errorBox = document.getElementById("error-box");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Reset UI states
  errorBox.classList.add("hidden");
  resultCard.classList.add("hidden");
  submitBtn.disabled = true;
  submitBtn.textContent = "Calculating...";

  // Build payload matching the exact FastAPI StudentData schema
  const payload = {
    age: parseInt(document.getElementById("age").value, 10),
    gender: document.getElementById("gender").value,
    country: document.getElementById("country").value.trim(),
    academic_level: document.getElementById("academic_level").value,
    most_used_platform: document.getElementById("most_used_platform").value,
    purpose_of_use: document.getElementById("purpose_of_use").value,
    avg_daily_usage_hours: parseFloat(
      document.getElementById("avg_daily_usage_hours").value,
    ),
    daily_unlocks: parseInt(document.getElementById("daily_unlocks").value, 10),
    study_hours: parseFloat(document.getElementById("study_hours").value),
    physical_activity_hours: parseFloat(
      document.getElementById("physical_activity_hours").value,
    ),
    sleep_hours_per_night: parseFloat(
      document.getElementById("sleep_hours_per_night").value,
    ),
    stress_level: document.getElementById("stress_level").value,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      // Extract FastAPI Pydantic validation messages if present
      if (errorData && Array.isArray(errorData.detail)) {
        const messages = errorData.detail
          .map((err) => `${err.loc.slice(1).join(".")}: ${err.msg}`)
          .join(" | ");
        throw new Error(`Validation Error: ${messages}`);
      }
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    const score = Number(data.predicted_mental_health_score);

    scoreValue.textContent = score.toFixed(2);
    scoreContext.textContent = `Based on ${payload.sleep_hours_per_night}h sleep, ${payload.avg_daily_usage_hours}h screen time, and ${payload.stress_level.toLowerCase()} stress.`;
    resultCard.classList.remove("hidden");
  } catch (err) {
    errorBox.textContent =
      err.message === "Failed to fetch"
        ? "Could not connect to the FastAPI server. Make sure uvicorn is running at " +
          API_URL
        : err.message;
    errorBox.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Predict Mental Health Score";
  }
});
