document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("clockCanvas");
  const ctx = canvas.getContext("2d");

  let currentHours = 0;
  let currentMinutes = 0;

  function drawClock(hours, minutes) {
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Move origin to the center
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Keep a 40px margin around the clock.
    const radius = canvas.width / 2 - 40; // => 360

    // 1) Draw the outer circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 16; // or ctx.lineWidth = radius * 0.03; // e.g. 3% of the radius
    ctx.strokeStyle = "black";
    ctx.stroke();

    // 2) Draw the numbers (1–12)
    //    Slightly smaller font, placed inward to avoid clashing with minute marks
    ctx.font = `${0.13 * radius}px Arial`; // ~46px if radius=360
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // e.g. place the numbers at 80% of the radius
    const numberPlacement = radius * 0.8; // ~288

    for (let i = 1; i <= 12; i++) {
      const angle = i * 30 * (Math.PI / 180);
      const x = Math.sin(angle) * numberPlacement;
      const y = -Math.cos(angle) * numberPlacement;
      ctx.fillText(i, x, y + 4); // added 4 to shift numbers downwards by 4px to fix the minor alignment issue of 3
    }

    // 3) Draw minute marks (0–59) closer to the circle
    //    outerTick ~ 95% of radius => 342 (Updated to 97%)
    //    innerTick slightly less, depending on hour vs. minute
    for (let i = 0; i < 60; i++) {
      const angle = i * 6 * (Math.PI / 180);

      const outerTick = radius * 0.97; // ~342
      const innerTick = i % 5 === 0 ? radius * 0.9 : radius * 0.93; // hour mark : minute mark

      ctx.lineWidth = i % 5 === 0 ? 4 : 2;

      const x1 = Math.sin(angle) * outerTick;
      const y1 = -Math.cos(angle) * outerTick;
      const x2 = Math.sin(angle) * innerTick;
      const y2 = -Math.cos(angle) * innerTick;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = "black";
      ctx.stroke();
    }

    // 4) Hour hand
    //    (hours % 12) * 30 + fraction from minutes => degrees
    const hourAngle =
      ((hours % 12) * 30 + (minutes / 60) * 30) * (Math.PI / 180);
    // Use ~2% of radius => ~7.2px
    ctx.lineWidth = radius * 0.02;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Hour hand extends ~50% of radius => 180px
    ctx.lineTo(
      Math.sin(hourAngle) * (radius * 0.5),
      -Math.cos(hourAngle) * (radius * 0.5)
    );
    ctx.strokeStyle = "red";
    ctx.stroke();

    // 5) Minute hand
    const minuteAngle = minutes * 6 * (Math.PI / 180);
    // Slightly thinner => 1.3% => ~4.68px
    ctx.lineWidth = radius * 0.013;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Minute hand extends ~75% of radius => 270px
    ctx.lineTo(
      Math.sin(minuteAngle) * (radius * 0.9),
      -Math.cos(minuteAngle) * (radius * 0.9)
    );
    ctx.strokeStyle = "blue";
    ctx.stroke();

    ctx.restore();
  }

  function generateRandomTime() {
    const level = document.getElementById("levelSelect").value;
    currentHours = Math.floor(Math.random() * 12);

    switch (level) {
      case "1":
        currentMinutes = 0;
        break;
      case "2":
        currentMinutes = Math.floor(Math.random() * 4) * 15;
        break;
      case "3":
        currentMinutes = Math.floor(Math.random() * 12) * 5;
        break;
      case "4":
        currentMinutes = Math.floor(Math.random() * 60);
        break;
      default:
        currentMinutes = Math.floor(Math.random() * 60);
    }

    drawClock(currentHours, currentMinutes);
    resetUI();
  }

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  function validateTime() {
    const userInput = document.getElementById("timeInput").value;
    const correctAnswer = `${String(currentHours == 0 ? 12 : currentHours).padStart(2, "0")}:${String(currentMinutes).padStart(2, "0")}`;
    const playerName = new URLSearchParams(window.location.search).get("name");

    if (!userInput) return;

    document.getElementById("validateBtn").style.display = "none";

    const [inputHours, inputMinutes] = userInput.split(":").map(Number);
    const isCorrect = parseInt(inputHours) % 12 === currentHours && parseInt(inputMinutes) === currentMinutes

    if (
      parseInt(inputHours) % 12 === currentHours &&
      parseInt(inputMinutes) === currentMinutes
    ) {
      document.getElementById("message").innerText = "Wohoo that was correct!";
      document.getElementById("message").style.color = "green";
      document.getElementById("message").style.display = "block";
      document.getElementById("tryAgain").style.display = "block";

      document.getElementById("viewAnswer").style.display = "none";
      document.getElementById("retry").style.display = "none";
    } else {
      document.getElementById("message").innerText =
        "Oops! your answer was incorrect.";
      document.getElementById("message").style.color = "red";
      document.getElementById("message").style.display = "block";

      document.getElementById("viewAnswer").style.display = "block";
      document.getElementById("retry").style.display = "block";
      document.getElementById("tryAgain").style.display = "block";
    }

    // Log the data to the backend
    fetch("/log/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRFToken": getCookie("csrftoken"), // Ensure CSRF token is included
      },
      body: new URLSearchParams({
        player_name: playerName,
        correct_answer: correctAnswer,
        player_answer: userInput,
        is_correct: isCorrect,
      }),
    });
  }

  function showAnswer() {
    document.getElementById("viewAnswer").innerText = `${String(
      currentHours == 0 ? 12 : currentHours
    ).padStart(2, "0")}:${String(currentMinutes).padStart(2, "0")}`;
  }

  function resetUI() {
    document.getElementById("message").style.display = "none";
    document.getElementById("validateBtn").style.display = "block";
    document.getElementById("viewAnswer").style.display = "none";
    document.getElementById("viewAnswer").innerText = "View Answer";
    document.getElementById("retry").style.display = "none";
    document.getElementById("tryAgain").style.display = "none";
    document.getElementById("timeInput").value = "";
  }

  function retrySameTime() {
    drawClock(currentHours, currentMinutes);
    resetUI();
  }

  // Initialize a random clock on page load
  window.onload = generateRandomTime;

  // Expose functions to global scope
  window.generateRandomTime = generateRandomTime;
  window.validateTime = validateTime;
  window.showAnswer = showAnswer;
  window.resetUI = resetUI;
  window.retrySameTime = retrySameTime;
});
