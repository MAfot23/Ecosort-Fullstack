# EcoSort — Quick Q&A Defense Sheet

---

### 1. What does EcoSort do?
> **Answer:** It tells users which bin (Organic, Recyclable, or Residual) their trash belongs to by pointing their camera or tapping from a list.

---

### 2. Why did we build this?
> **Answer:** Because most people want to segregate waste properly, but they get confused about which item goes into which bin. EcoSort removes the guesswork.

---

### 3. Why did we use React for the frontend?
> **Answer:** It makes the website fast and smooth. Pages, camera scans, and counters update instantly without refreshing the screen.

---

### 4. Why did we use Laravel for the backend?
> **Answer:** To make the system secure and reliable. The server decides the correct bin, securely manages accounts, and protects the database.

---

### 5. Why do we run AI in the browser (TensorFlow.js)?
> **Answer:** It scans items instantly, keeps user camera feeds private, and doesn't overload the server with heavy video files.

---

### 6. Why did we add the Scan Counter?
> **Answer:** To track how many times the system is used in real time and show the community's environmental impact.

---

### 7. Why did we create an Admin Login & Dashboard?
> **Answer:** So admins can monitor live scan logs, manage users, and add or edit items in the database without touching code.

---

### 8. How is the Admin account protected?
> **Answer:** Non-admin accounts are blocked both on the frontend and on the server. If someone tries to access admin routes without permission, the server returns an access denied error (403 Forbidden).

---

### 9. What database are we using?
> **Answer:** SQLite managed through Laravel. It stores user accounts, waste items, scores, and a log of every scan.

---

### 10. Why did we include games and quizzes?
> **Answer:** To make learning fun. People remember waste sorting rules better when they practice through interactive games.

---

### 11. Why did we deploy with Docker on Render?
> **Answer:** Docker packages the whole backend so it runs anywhere without errors. Render provides free and reliable cloud hosting directly from GitHub.
