import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import api from "../../services/api";
import getPregnancyWeekContent from "../../data/pregnancyWeekContent";
import { pregnancyNutritionData } from "../../data/pregnancyNutritionData";
import { mealDatabase } from "../../data/mealDatabase";
import { foodSafetyDataset } from "../../data/foodSafetyDataset";
import { getNutritionRecommendations } from "../../services/pregnancyPersonalizationService";
import PregnancyVideoSection from "../../components/PregnancyVideoSection";
import "./NutritionWellnessTips.css";

const RECOMMENDED_FOODS = [
  { icon: "🥬", title: "Spinach & Leafy Greens", subtitle: "High in iron and folate" },
  { icon: "🐟", title: "Salmon", subtitle: "Rich in omega-3 fatty acids" },
  { icon: "🥛", title: "Greek Yogurt", subtitle: "Calcium and protein" },
  { icon: "🥚", title: "Eggs", subtitle: "Protein and choline" },
  { icon: "🫐", title: "Berries", subtitle: "Antioxidants and fiber" },
  { icon: "🫘", title: "Lentils", subtitle: "Iron, folate, and fiber" },
  { icon: "🍠", title: "Sweet Potatoes", subtitle: "Vitamin A and fiber" },
  { icon: "🥜", title: "Nuts & Seeds", subtitle: "Healthy fats and protein" },
];

const FOODS_TO_AVOID_LEFT = [
  "Raw or undercooked meat",
  "High-mercury fish (shark, swordfish)",
  "Excessive caffeine (>200mg/day)",
  "Raw sprouts",
];

const FOODS_TO_AVOID_RIGHT = [
  "Raw eggs and unpasteurized dairy",
  "Unwashed produce",
  "Alcohol",
  "Deli meats (unless heated)",
];

const MEAL_SUGGESTIONS = [
  {
    day: "Monday",
    breakfast: "Greek yogurt with berries and granola",
    lunch: "Grilled chicken salad with quinoa",
    dinner: "Baked salmon with sweet potato and broccoli",
    snack: "Apple slices with almond butter",
  },
  {
    day: "Tuesday",
    breakfast: "Scrambled eggs with whole grain toast",
    lunch: "Lentil soup with whole wheat roll",
    dinner: "Turkey meatballs with zucchini noodles",
    snack: "Carrot sticks with hummus",
  },
  {
    day: "Wednesday",
    breakfast: "Oatmeal with walnuts and banana",
    lunch: "Spinach and feta wrap with vegetables",
    dinner: "Grilled chicken with brown rice and green beans",
    snack: "Mixed nuts and dried fruit",
  },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const toTrimester = (week) => {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
};

export default function NutritionWellnessTips({ currentWeek: currentWeekProp }) {
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(currentWeekProp || 24);
  const [weekContent, setWeekContent] = useState(getPregnancyWeekContent(currentWeekProp || 24));
  const [healthData, setHealthData] = useState({});
  const [dietPreference, setDietPreference] = useState("vegetarian");
  const [mealPlan, setMealPlan] = useState([]);
  const [foodSearch, setFoodSearch] = useState("");
  const [foodSafetyResult, setFoodSafetyResult] = useState(null);

  const calculateNutritionScore = (input = {}) => {
    const water = Number(input.waterIntake) || 0;
    const meals = Number(input.mealsEaten) || 0;
    const ironSignals = Number(input.ironRichFoodIntake) || (Array.isArray(input.supplements) && input.supplements.length ? 1 : 0);
    const proteinSignals = Number(input.proteinIntake) || (input.exercise ? 1 : 0);

    const waterScore = Math.min(30, Math.round((water / 2.5) * 30));
    const mealRegularityScore = Math.min(25, meals >= 3 ? 25 : meals === 2 ? 16 : 8);
    const ironScore = Math.min(25, ironSignals > 1 ? 25 : ironSignals === 1 ? 17 : 8);
    const proteinScore = Math.min(20, proteinSignals > 1 ? 20 : proteinSignals === 1 ? 14 : 7);
    return Math.max(0, Math.min(100, waterScore + mealRegularityScore + ironScore + proteinScore));
  };

  useEffect(() => {
    const loadWeek = async () => {
      try {
        setLoading(true);
        const [weekResponse, logsResponse] = await Promise.allSettled([
          api.get("/pregnancy/current-week"),
          api.get("/pregnancy/logs?limit=14"),
        ]);
        const resolvedWeek =
          currentWeekProp ||
          (weekResponse.status === "fulfilled" ? weekResponse.value.data?.currentWeek : null) ||
          24;
        setCurrentWeek(resolvedWeek);
        setWeekContent(getPregnancyWeekContent(resolvedWeek));

        if (logsResponse.status === "fulfilled") {
          const latestLog = Array.isArray(logsResponse.value.data?.logs) ? logsResponse.value.data.logs[0] : {};
          setHealthData(latestLog || {});
        }
      } catch (error) {
        console.error("Failed to load pregnancy insights:", error);
        setWeekContent(getPregnancyWeekContent(currentWeekProp || 24));
      } finally {
        setLoading(false);
      }
    };

    loadWeek();
  }, [currentWeekProp]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const logsResponse = await api.get("/pregnancy/logs?limit=1");
        const latestLog = Array.isArray(logsResponse.data?.logs) ? logsResponse.data.logs[0] : {};
        setHealthData(latestLog || {});
      } catch (error) {
        // Keep current recommendations if refresh fails.
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const weekNutrition = useMemo(() => pregnancyNutritionData[currentWeek] || pregnancyNutritionData[20], [currentWeek]);

  const nutritionScore = useMemo(() => calculateNutritionScore(healthData), [healthData]);
  const scoreBand = nutritionScore >= 75 ? "good" : nutritionScore >= 50 ? "improve" : "poor";
  const trackedSymptoms = useMemo(
    () =>
      Array.isArray(healthData?.symptoms)
        ? healthData.symptoms.map((item) => String(item?.name || item).toLowerCase())
        : [],
    [healthData]
  );
  const personalizedNutrition = useMemo(
    () => getNutritionRecommendations(currentWeek, trackedSymptoms),
    [currentWeek, trackedSymptoms]
  );

  const aiRecommendation = useMemo(() => {
    const bloodDataLow = Number(healthData.hemoglobin || healthData.hb || 0) > 0 &&
      Number(healthData.hemoglobin || healthData.hb || 0) < 11;
    const lowWater = Number(healthData.waterIntake || 0) < 2;
    const recommendation = [
      `Week ${currentWeek} focus: ${weekNutrition.nutrientFocus}.`,
      `Include foods like ${weekNutrition.recommendedFoods.slice(0, 3).join(", ")}.`,
      personalizedNutrition.recommendations[0],
    ];

    if (lowWater) recommendation.push("Your water intake seems low. Aim for at least 2-2.5L daily.");
    if (bloodDataLow) recommendation.push("Your hemoglobin trend appears low. Increase iron-rich foods and follow supplement guidance.");
    if (trackedSymptoms.some((sym) => sym.includes("fatigue"))) recommendation.push("Fatigue detected: add protein-rich snacks and maintain regular meal timing.");
    if (trackedSymptoms.some((sym) => sym.includes("nausea"))) recommendation.push("For nausea, use small frequent meals and dry snacks.");

    return recommendation.join(" ");
  }, [currentWeek, weekNutrition, healthData, trackedSymptoms, personalizedNutrition]);

  const generateMealPlan = () => {
    const trimester = toTrimester(currentWeek);
    const filtered = mealDatabase.filter(
      (meal) => meal.trimester.includes(trimester) && (dietPreference === "non-veg" || meal.diet === "vegetarian")
    );
    const byType = (type) => filtered.filter((item) => item.mealType === type);

    const pick = (arr, idx) => (arr.length ? arr[idx % arr.length] : null);

    const breakfasts = byType("breakfast");
    const lunches = byType("lunch");
    const dinners = byType("dinner");
    const snacks = byType("snack");

    const plan = DAYS.map((day, idx) => ({
      day,
      breakfast: pick(breakfasts, idx),
      lunch: pick(lunches, idx + 1),
      dinner: pick(dinners, idx + 2),
      snack: pick(snacks, idx + 3),
    }));
    setMealPlan(plan);
  };

  const groceryList = useMemo(() => {
    const ingredients = new Set();
    mealPlan.forEach((day) => {
      [day.breakfast, day.lunch, day.dinner, day.snack].forEach((meal) => {
        (meal?.ingredients || []).forEach((ing) => ingredients.add(ing));
      });
    });
    return [...ingredients];
  }, [mealPlan]);

  const downloadGroceryPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("SafeHer Pregnancy Grocery List", 14, 16);
    doc.setFontSize(11);
    doc.text(`Week ${currentWeek} • ${dietPreference === "vegetarian" ? "Vegetarian" : "Non-Veg"}`, 14, 24);
    let y = 34;
    groceryList.forEach((item, idx) => {
      doc.text(`${idx + 1}. ${item}`, 14, y);
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 16;
      }
    });
    doc.save(`safeher-grocery-week-${currentWeek}.pdf`);
  };

  useEffect(() => {
    if (!foodSearch.trim()) {
      setFoodSafetyResult(null);
      return;
    }
    const query = foodSearch.toLowerCase();
    const found = foodSafetyDataset.find((item) => item.food.toLowerCase().includes(query));
    setFoodSafetyResult(found || { food: foodSearch, safety: "Unknown", advice: "No direct dataset match. Please consult your doctor for personalized food safety advice." });
  }, [foodSearch]);

  return (
    <section className="nutrition-tips-page">
      <header className="nutrition-tips-header">
        <h1>Nutrition & Wellness</h1>
        <p>Healthy eating guide for your pregnancy</p>
      </header>

      <article className="ai-recommendation-card">
        <div className="ai-icon">💬</div>
        <div>
          <h2>AI Nutrition Recommendation</h2>
          <p>{aiRecommendation}</p>
          <span className="ai-pill">Personalized for Week {currentWeek}</span>
        </div>
      </article>

      <section className="nutrition-panel">
        <h3>📊 Nutrition Health Score</h3>
        <div className={`nutrition-score-card ${scoreBand}`}>
          <strong>Nutrition Score: {nutritionScore} / 100</strong>
          <span>
            {scoreBand === "good" ? "Good" : scoreBand === "improve" ? "Needs Improvement" : "Poor"}
          </span>
        </div>
      </section>

      <section className="nutrition-panel">
        <h3>🛡 Recommended Foods</h3>
        <div className="food-grid">
          {(weekNutrition.recommendedFoods?.length
            ? weekNutrition.recommendedFoods.map((item) => ({ icon: "🥗", title: item, subtitle: `Focus: ${weekNutrition.nutrientFocus}` }))
            : weekContent.nutrition.recommendedFoods?.length
              ? weekContent.nutrition.recommendedFoods
              : RECOMMENDED_FOODS).map((food) => (
            <article className="food-card" key={food.title}>
              <div className="food-icon">{food.icon}</div>
              <div>
                <h4>{food.title}</h4>
                <p>{food.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="nutrition-panel">
        <h3>🎯 Personalized Nutrition Guidance</h3>
        <div className="grocery-list">
          {personalizedNutrition.recommendations.map((tip) => (
            <p key={tip}>• {tip}</p>
          ))}
          {personalizedNutrition.avoid.map((item) => (
            <p key={item}>• Avoid: {item}</p>
          ))}
        </div>
      </section>

      <section className="nutrition-panel">
        <PregnancyVideoSection
          category="nutrition"
          week={currentWeek}
          title="🎥 Healthy Pregnancy Recipes"
        />
      </section>

      <section className="nutrition-panel">
        <h3>🧠 Weekly Meal Plan Generator</h3>
        <div className="meal-generator-controls">
          <label>
            Diet Preference
            <select value={dietPreference} onChange={(e) => setDietPreference(e.target.value)}>
              <option value="vegetarian">Vegetarian</option>
              <option value="non-veg">Non-Veg</option>
            </select>
          </label>
          <button type="button" className="generate-btn" onClick={generateMealPlan}>
            Generate Personalized Meal Plan
          </button>
        </div>
      </section>

      <section className="nutrition-panel">
        <h3>🍽 Weekly Meal Plan</h3>
        <div className="meal-days">
          {(mealPlan.length ? mealPlan : weekContent.nutrition.mealSuggestions?.length ? weekContent.nutrition.mealSuggestions : MEAL_SUGGESTIONS).map((meal) => (
            <article className="meal-day-card" key={meal.day}>
              <h4>{meal.day}</h4>
              <div className="meal-grid">
                <div className="meal-item breakfast">
                  <span>Breakfast</span>
                  <p>{meal.breakfast?.name || meal.breakfast}</p>
                </div>
                <div className="meal-item dinner">
                  <span>Dinner</span>
                  <p>{meal.dinner?.name || meal.dinner}</p>
                </div>
                <div className="meal-item lunch">
                  <span>Lunch</span>
                  <p>{meal.lunch?.name || meal.lunch}</p>
                </div>
                <div className="meal-item snack">
                  <span>Snack</span>
                  <p>{meal.snack?.name || meal.snack}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="nutrition-panel">
        <h3>🛒 Grocery List</h3>
        {groceryList.length ? (
          <>
            <div className="grocery-list">
              {groceryList.map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </div>
            <button type="button" className="generate-btn" onClick={downloadGroceryPDF}>
              Download Grocery List PDF
            </button>
          </>
        ) : (
          <p className="muted-note">Generate a personalized meal plan to create your grocery list.</p>
        )}
      </section>

      <section className="nutrition-panel">
        <h3>🔎 Food Safety Search</h3>
        <div className="food-safety-search">
          <input
            type="text"
            value={foodSearch}
            onChange={(e) => setFoodSearch(e.target.value)}
            placeholder="Can I eat this food during pregnancy?"
          />
          {foodSafetyResult ? (
            <article className={`food-safety-result ${String(foodSafetyResult.safety).toLowerCase().includes("avoid") ? "warn" : ""}`}>
              <h4>{foodSafetyResult.food}</h4>
              <strong>{foodSafetyResult.safety}</strong>
              <p>{foodSafetyResult.advice}</p>
            </article>
          ) : null}
        </div>
      </section>

      <section className="nutrition-panel">
        <h3>⚠ Foods to Avoid During Pregnancy</h3>
        <div className="avoid-grid">
          <div className="avoid-col">
            {(weekContent.nutrition.avoidFoods?.length ? weekContent.nutrition.avoidFoods : [...FOODS_TO_AVOID_LEFT, ...FOODS_TO_AVOID_RIGHT])
              .filter((_, idx) => idx % 2 === 0)
              .map((item) => (
                <p key={item}>• {item}</p>
              ))}
          </div>
          <div className="avoid-col">
            {(weekContent.nutrition.avoidFoods?.length ? weekContent.nutrition.avoidFoods : [...FOODS_TO_AVOID_LEFT, ...FOODS_TO_AVOID_RIGHT])
              .filter((_, idx) => idx % 2 === 1)
              .map((item) => (
                <p key={item}>• {item}</p>
              ))}
          </div>
        </div>
      </section>

      <footer className="hydration-strip">
        <div className="drop">💧</div>
        <div>
          <h4>Stay Hydrated!</h4>
          <p>
            Aim for 10-12 glasses (80-96 oz) of water daily. Proper hydration supports increased
            blood volume, prevents constipation, and reduces swelling.
          </p>
        </div>
      </footer>

      {loading ? (
        <div className="nutrition-loading-overlay">
          <div className="loader" />
          <span>Loading nutrition insights...</span>
        </div>
      ) : null}
    </section>
  );
}
