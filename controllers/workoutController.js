const Roles = require("../enums/rolesEnum");
const Franchise = require("../models/Franchise");
const Gym = require("../models/Gym");
const Member = require("../models/Member");
const WeeklyWorkoutPlan = require("../models/Workoutplan"); // Ensure this path is correct
const jwt = require("jsonwebtoken");
const puppeteer = require("puppeteer");
const path = require("path");

const { sendEmail } = require("../services/mailer");

// Create a new weekly workout plan with category
exports.createWeeklyWorkoutPlan = async (req, res, next) => {
  try {
    const { workoutTemplateName, weeklyPlan, category, gym } = req.body;
    // Validate input
    if (!workoutTemplateName || typeof workoutTemplateName !== "string") {
      return res.status(400).json({
        message: "Workout template name is required and should be a string",
      });
    }

    if (!category || typeof category !== "string") {
      return res
        .status(400)
        .json({ message: "Category is required and should be a string" });
    }

    if (!Array.isArray(weeklyPlan) || weeklyPlan.length === 0) {
      return res.status(400).json({ message: "Weekly plan is required" });
    }

    // Validate that each day has a valid name and at least one workout
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    for (const dayPlan of weeklyPlan) {
      if (!validDays.includes(dayPlan.day)) {
        return res.status(400).json({ message: `Invalid day: ${dayPlan.day}` });
      }
      if (!Array.isArray(dayPlan.workouts) || dayPlan.workouts.length === 0) {
        return res
          .status(400)
          .json({ message: `${dayPlan.day} should have at least one workout` });
      }
    }

    // Create and save the new weekly workout plan
    const newWeeklyWorkoutPlan = new WeeklyWorkoutPlan({
      workoutTemplateName,
      weeklyPlan,
      category,
      gym,
    });
    await newWeeklyWorkoutPlan.save();

    res.status(201).json(newWeeklyWorkoutPlan);
  } catch (error) {
    next(error);
  }
};

// Get all weekly workout plans
exports.getWeeklyWorkoutPlans = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const UserId = decodedToken.id;
    const userRole = decodedToken.role;

    // Variable to hold the user's associated gym
    let gymId;

    if (userRole === Roles.GYM_ADMIN) {
      // Find the gym associated with the gym admin
      const gym = await Gym.findOne({ gymAdmin: UserId });
      gymId = gym._id; // Get the gym ID
    } else if (userRole === Roles.FRANCHISE_ADMIN) {
      // If it's a franchise admin, get gyms under the franchise
      const franchise = await Franchise.findOne({ franchiseAdmin: UserId });
      const gyms = await Gym.find({ franchise: franchise._id });
      gymId = gyms.map((gym) => gym._id); // Get all gym IDs under the franchise
    } else {
      // For other roles, you can choose to return an empty array or handle differently
      return res.status(403).json({ message: "Unauthorized access." });
    }

    // Query the workout plans associated with the user's gym
    const workoutPlans = await WeeklyWorkoutPlan.find({ gym: gymId });

    res.status(200).json(workoutPlans);
  } catch (error) {
    next(error);
  }
};

// Get a single workout plan by ID
exports.getWeeklyWorkoutPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workoutPlan = await WeeklyWorkoutPlan.findById(id);

    if (!workoutPlan) {
      return res.status(404).json({ message: "Workout plan not found" });
    }

    res.status(200).json(workoutPlan);
  } catch (error) {
    next(error);
  }
};

// Update a weekly workout plan by ID
exports.updateWeeklyWorkoutPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { workoutTemplateName, weeklyPlan, category } = req.body;

    // Validate input
    if (!workoutTemplateName || typeof workoutTemplateName !== "string") {
      return res.status(400).json({
        message: "Workout template name is required and should be a string",
      });
    }

    if (!category || typeof category !== "string") {
      return res
        .status(400)
        .json({ message: "Category is required and should be a string" });
    }

    if (!Array.isArray(weeklyPlan) || weeklyPlan.length === 0) {
      return res.status(400).json({ message: "Weekly plan is required" });
    }

    // Validate that each day has a valid name and at least one workout
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    for (const dayPlan of weeklyPlan) {
      if (!validDays.includes(dayPlan.day)) {
        return res.status(400).json({ message: `Invalid day: ${dayPlan.day}` });
      }
      if (!Array.isArray(dayPlan.workouts) || dayPlan.workouts.length === 0) {
        return res
          .status(400)
          .json({ message: `${dayPlan.day} should have at least one workout` });
      }
    }

    // Find and update the workout plan
    const updatedWorkoutPlan = await WeeklyWorkoutPlan.findByIdAndUpdate(
      id,
      { workoutTemplateName, weeklyPlan, category },
      { new: true, runValidators: true }
    );

    if (!updatedWorkoutPlan) {
      return res.status(404).json({ message: "Workout plan not found" });
    }

    res.status(200).json(updatedWorkoutPlan);
  } catch (error) {
    next(error);
  }
};

// Delete a workout plan by ID
exports.deleteWeeklyWorkoutPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedWorkoutPlan = await WeeklyWorkoutPlan.findByIdAndDelete(id);

    if (!deletedWorkoutPlan) {
      return res.status(404).json({ message: "Workout plan not found" });
    }

    res.status(200).json({ message: "Workout plan deleted successfully" });
  } catch (error) {
    next(error);
  }
};
// exports.assignWorkoutPlanToMember = async (req, res, next) => {
//   try {
//     const { memberId, workoutPlanId } = req.body;

//     // Find the member
//     const member = await Member.findById(memberId);
//     if (!member) {
//       return res.status(404).json({ message: "Member not found" });
//     }

//     // Find the workout plan
//     const workoutPlan = await WeeklyWorkoutPlan.findById(workoutPlanId);
//     if (!workoutPlan) {
//       return res.status(404).json({ message: "Workout plan not found" });
//     }

//     // Assign the workout plan to the member
//     member.assignedWorkoutPlan = workoutPlanId;
//     await member.save();

//     res.status(200).json({ message: "Workout plan assigned successfully", member });
//     const subject = "Workout plan";
//     const text = `Hi ${member?.name},\n\nYour diet plan is attached to this mail please open.`;
//     await sendEmail(member?.email, subject, text);
//   } catch (error) {
//     next(error);
//   }
// }
// Get a single workout plan by ID
exports.getWeeklyWorkoutPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userRole = decodedToken.role;

    // Optionally, you can check the user's role here
    // if (userRole !== Roles.GYM_ADMIN && userRole !== Roles.FRANCHISE_ADMIN) {
    //   return res.status(403).json({ message: "Unauthorized access." });
    // }

    // Fetch the workout plan
    const workoutPlan = await WeeklyWorkoutPlan.findById(id);

    if (!workoutPlan) {
      return res.status(404).json({ message: "Workout plan not found" });
    }

    // Optionally check if the workout plan is associated with the user's gym
    const gym = await Gym.findById(workoutPlan.gym);
    if (
      !gym ||
      (userRole === Roles.GYM_ADMIN &&
        gym.gymAdmin.toString() !== decodedToken.id)
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this workout plan." });
    }

    res.status(200).json(workoutPlan);
  } catch (error) {
    console.error("Error retrieving workout plan:", error); // Log the error for debugging
    next(error); // Pass the error to the error handling middleware
  }
};
exports.assignWorkoutPlanToMember = async (req, res, next) => {
  try {
    const { memberId, workoutPlanId } = req.body;

    // Find the member
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Find the workout plan
    const workoutPlan = await WeeklyWorkoutPlan.findById(workoutPlanId);
    if (!workoutPlan) {
      return res.status(404).json({ message: "Workout plan not found" });
    }
    console.log(workoutPlan);

    // Assign the workout plan to the member
    member.assignedWorkoutPlan = workoutPlanId;
    await member.save();

    // Generate the workout plan PDF
    const pdfFilePath = await generateWorkoutPlanPDF(workoutPlan, member.name);

    // Send email with PDF attachment
    const subject = "Your Workout Plan";
    const text = `Hi ${member.name},\n\nYour workout plan is attached as a PDF. Please check it out and let us know if you have any questions.`;
    await sendEmail(member.email, subject, text, pdfFilePath);

    res.status(200).json({
      message: "Workout plan assigned and email sent successfully",
      member,
    });
  } catch (error) {
    next(error);
  }
};

const generateWorkoutPlanPDF = async (workoutPlan, memberName) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Create the HTML content for the PDF
    const content = `
    <html>
<head>
    <title>Workout Plan</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 1000px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border: 1px solid #ddd;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #d2b48c;
            padding: 10px;
            color: #fff;
        }
        .header h1 {
            margin: 0;
            font-size: 36px;
        }
        .info {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
        }
        .info div {
            width: 48%;
        }
        .info div input {
            width: 100%;
            padding: 5px;
            margin-top: 5px;
            border: 1px solid #ccc;
        }
        .calendar {
            display: flex;
            justify-content: space-between;
        }
        .calendar .month {
            width: 48%;
        }
        .calendar .month table {
            width: 100%;
            border-collapse: collapse;
        }
        .calendar .month th, .calendar .month td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: center;
        }
        .calendar .month th {
            background-color: #d2b48c;
            color: #fff;
        }
        .calendar .month .highlight {
            background-color: #f4a460;
            color: #fff;
        }
        .tips {
            background-color: #d2b48c;
            padding: 10px;
            color: #fff;
            margin-top: 20px;
        }
        .tips p {
            margin: 0;
        }
        .schedule {
            margin-top: 20px;
        }
        .schedule .day {
            background-color: #f5f5f5;
            padding: 10px;
            margin-bottom: 10px;
        }
        .schedule .day h2 {
            margin: 0;
            font-family: 'Georgia', serif;
            font-size: 24px;
            color: #8b4513;
        }
        .schedule table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .schedule th, .schedule td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        .schedule th {
            background-color: #d2b48c;
            color: #fff;
        }
        .intensity-low {
            background-color: #d3d3d3;
            color: #000;
        }
        .intensity-moderate {
            background-color: #90ee90;
            color: #000;
        }
        .intensity-high {
            background-color: #ffcccb;
            color: #000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>WORKOUT PLAN</h1>
        </div>
        <div class="info">
            <div>
                <label>Name:</label>
                <input type="text" value="${memberName}" readonly>
            </div>
            <div>
                <label>Workout Template Name:</label>
                <input type="text" value="${
                  workoutPlan.workoutTemplateName
                }" readonly>
            </div>
            <div>
                <label>Category:</label>
                <input type="text" value="${workoutPlan.category}" readonly>
            </div>
            <div>
                <label>Created At:</label>
                <input type="text" value="${new Date(
                  workoutPlan.createdAt
                ).toLocaleDateString()}" readonly>
            </div>
        </div>
        <div class="schedule">
            ${workoutPlan.weeklyPlan
              .map(
                (day) => `
            <div class="day">
                <h2>${day.day}</h2>
                <table>
                    <tr>
                        <th>Workout</th>
                        <th>Sets</th>
                        <th>Reps</th>
                        <th>Kg</th>
                        <th>Rest Time</th>
                    </tr>
                    ${day.workouts
                      .map(
                        (workout) => `
                    <tr>
                        <td>${workout.workoutName || "N/A"}</td>
                        <td>${workout.sets || "N/A"}</td>
                        <td>${workout.reps || "N/A"}</td>
                        <td>${workout.kg || "N/A"}</td>
                        <td>${workout.restTime || "N/A"}</td>
                    </tr>`
                      )
                      .join("")}
                </table>
            </div>`
              )
              .join("")}
        </div>
    </div>
</body>
</html>
  `;

    try {
      await page.setContent(content, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });
    } catch (error) {
      console.error("Error setting content:", error);
    }

    const filePath = path.join(__dirname, `${memberName}_workout_plan.pdf`);

    // Generate the PDF
    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return filePath;
  } catch (err) {
    console.log(err);
  }
};
