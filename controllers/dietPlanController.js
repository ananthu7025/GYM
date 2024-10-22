const DietPlan = require("../models/DietPlan");
const Member = require("../models/Member");
const path = require("path");
const puppeteer = require("puppeteer"); // Ensure puppeteer is installed
const { sendEmail } = require("../services/mailer");
// Add new diet plan
exports.createDietPlan = async (req, res, next) => {
  try {
    const { name, category, nutritionDetails } = req.body;

    // Creating new diet plan
    const newDietPlan = new DietPlan({
      name,           // Include the name field
      category,      // Include the category field
      nutritionDetails,
    });

    await newDietPlan.save();

    res.status(201).json({
      message: "Diet plan created successfully",
      data: newDietPlan,
      saveStatus: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDietPlan = async (req, res, next) => {
  try {
    const { name, category, nutritionDetails } = req.body; // Include name and category

    const updatedDietPlan = await DietPlan.findByIdAndUpdate(
      req.params.id,
      { name, category, nutritionDetails }, // Update the new fields along with nutrition details
      { new: true }
    );

    if (!updatedDietPlan) {
      return res.status(404).json({ message: "Diet plan not found" });
    }

    res.status(200).json({
      message: "Diet plan updated successfully",
      data: updatedDietPlan,
      saveStatus: true,
    });
  } catch (error) {
    next(error);
  }
};

// Get all diet plans
exports.getDietPlans = async (req, res, next) => {
  try {
    const dietPlans = await DietPlan.find();
    res.status(200).json(dietPlans);
  } catch (error) {
    next(error);
  }
};

// Get a single diet plan by ID
exports.getDietPlanById = async (req, res, next) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id);
    if (!dietPlan) {
      return res.status(404).json({ message: "Diet plan not found" });
    }
    res.status(200).json(dietPlan);
  } catch (error) {
    next(error);
  }
};


// Delete a diet plan by ID
exports.deleteDietPlan = async (req, res) => {
  try {
    const deletedDietPlan = await DietPlan.findByIdAndDelete(req.params.id);

    if (!deletedDietPlan) {
      return res.status(404).json({ message: "Diet plan not found" });
    }

    res.status(200).json({ message: "Diet plan deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete diet plan", error: error.message });
  }
};
exports.assignDietPlanToMember = async (req, res, next) => {
  try {
    const { memberId, dietPlanId } = req.body;

    // Check if the member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Check if the diet plan exists
    const dietPlan = await DietPlan.findById(dietPlanId);
    if (!dietPlan) {
      return res.status(404).json({ message: "Diet plan not found" });
    }

    // Assign diet plan to member
    member.assignedDietPlan = dietPlanId;
    await member.save();
    const convertedDietPlan = convertNutritionDetails(
      dietPlan.nutritionDetails
    );
    // Generate the diet plan PDF
    const pdfFilePath = await generateDietPlanPDF(
      convertedDietPlan,
      member.name
    );

    // Send email with PDF attachment
    const subject = "Your Diet Plan";
    const text = `Hi ${member.name},\n\nYour diet plan is attached as a PDF. Please check it out and let us know if you have any questions.`;
    await sendEmail(member.email, subject, text, pdfFilePath);

    res.status(200).json({
      message: "Diet plan assigned and email sent successfully",
      member,
    });
  } catch (error) {
    next(error);
  }
};
function convertNutritionDetails(nutritionDetails) {
  const plainNutritionDetails = nutritionDetails.toObject(); // Convert Mongoose object to plain object
  return Object.entries(plainNutritionDetails).map(([day, meals]) => {
    const mealDetails = {};

    Object.entries(meals).forEach(([meal, data]) => {
      if (data.details) {
        mealDetails[meal] = data.details;
      } else {
        mealDetails[meal] = ""; // If details are empty, keep it empty
      }
    });

    return {
      day,
      meals: mealDetails,
    };
  });
}

const generateDietPlanPDF = async (dietPlan, memberName) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Create the HTML content for the PDF
    const content = `
        <html>
<head>
    <title>Diet Plan</title>
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
        .schedule {
            margin-top: 20px;
        }
        .day {
            background-color: #f5f5f5;
            padding: 10px;
            margin-bottom: 10px;
        }
        .day h2 {
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DIET PLAN</h1>
        </div>
        <div class="info">
            <h2>Member: ${memberName}</h2>
        </div>
      <div class="schedule">
  ${dietPlan
    .map(
      (dayPlan) => `
    <div class="day">
      <h2>${dayPlan.day}</h2>
      <table>
        <tr>
          <th>Meal</th>
          <th>Details</th>
        </tr>
        ${Object.keys(dayPlan.meals)
          .map(
            (mealName) => `
          <tr>
            <td>${mealName}</td>
            <td>${
              dayPlan.meals[mealName] ? dayPlan.meals[mealName] : "N/A"
            }</td>
          </tr>
        `
          )
          .join("")}
      </table>
    </div>
  `
    )
    .join("")}
</div>

        </div>
    </div>
</body>
</html>
        `;

    await page.setContent(content, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    const filePath = path.join(__dirname, `${memberName}_diet_plan.pdf`);

    // Generate the PDF
    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return filePath;
  } catch (err) {
    console.error("Error generating diet plan PDF:", err);
    throw err; // Rethrow the error for further handling
  }
};
