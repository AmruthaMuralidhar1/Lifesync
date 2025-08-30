# LifeSync AI: Your Autonomous Personal Task & Chore Orchestrator

**LifeSync AI** is a sophisticated, context-aware scheduling agent designed to intelligently manage your daily tasks, chores, and appointments. It goes beyond a simple to-do list by leveraging cutting-edge AI to understand your priorities, environment, and schedule, creating an optimized and dynamic plan for your day.

---

## ✨ Key Features

This application is built with a suite of advanced, AI-driven features to provide a seamless and intelligent user experience:

*   **🧠 Intelligent Task Prioritization:** Leverages AI to analyze tasks based on due dates, user-defined importance, urgency, and even contextual factors like location. It automatically sorts your to-do list to ensure you're always focused on what matters most.

*   **🤖 Automated Task Scheduling:** Once your tasks are prioritized, the AI generates an optimized daily schedule. It intelligently slots tasks into your day, considering estimated durations and user preferences (e.g., "morning person" vs. "night owl").

*   **⚡ Real-time Rescheduling:** Life doesn't always go according to plan. When a disruption occurs (like a meeting running late), you can notify the AI. It will instantly re-evaluate your entire schedule and provide an optimized new plan on the fly.

*   **⏱️ Smart Task Duration Estimation:** Not sure how long a task will take? Describe it to the AI, and it will provide an estimated duration based on the task's complexity, type, and historical user data, along with its reasoning.

*   **📍 Context-Aware Suggestions:** The application simulates location awareness. A "Contextual Tasks" panel intelligently surfaces tasks that you can complete at your current location (e.g., "At Sahakar Nagar? You can drop off the dry cleaning now.").

*   **🗓️ Unified Calendar View:** Aggregates events from various sources (simulated Google Calendar, Outlook, and LifeSync AI) into a single, cohesive timeline for a complete overview of your day.

*   **🔔 Proactive AI Insights:** The assistant provides intelligent nudges, reminders, and alerts based on your schedule and external factors (like simulated traffic reports).

---

## 🚀 How It Works

The user experience is designed to be a guided, stage-by-stage process, making it intuitive and powerful:

1.  **Task Orchestration:** Begin by adding all your tasks. You can specify details like urgency, importance, location, and even ask the AI to estimate the duration.
2.  **AI Prioritization:** With a single click, the AI analyzes your entire task list and reorders it, presenting a clear, prioritized action plan with explanations for its decisions.
3.  **Schedule Generation:** Transform your prioritized list into a concrete, timed schedule for the day, which respects your existing calendar events.
4.  **Adapt & Overcome:** If disruptions occur, use the real-time rescheduling feature to instantly adapt your plan.

---

## 🏃 Getting Started

To run the project locally, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    The application uses `concurrently` to run the Next.js app and the Genkit flows simultaneously.
    ```bash
    npm run dev
    ```
    This will start the main application on `http://localhost:9002` and the Genkit development server.

3.  **Open the Application:**
    Navigate to [http://localhost:9002](http://localhost:9002) in your browser to start using LifeSync AI.

*   `automated-task-scheduling.ts`: Creates an optimized daily schedule from a list of tasks.
*   `real-time-rescheduling.ts`: Adjusts the schedule in response to real-world disruptions.
*   `smart-task-duration-estimation.ts`: Predicts how long a task will take based on its description.
