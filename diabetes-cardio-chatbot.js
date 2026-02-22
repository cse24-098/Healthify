const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Get API key from environment variable
const API_KEY = process.env.NURSE_PAM_API_KEY; 

if (!API_KEY) {
    console.error("❌ NURSE_PAM_API_KEY not found in environment variables");
    process.exit(1);
}

console.log("✅ API Key found, initializing Gemini...");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
    }
});

console.log("✅ Gemini initialized successfully");

/**
 * Specialized Medical Chatbot for Diabetes and Cardiovascular Diseases
 */
async function diabetesCardioChatbot(patientInfo) {
    try {
        console.log("📝 Processing request with patient info:", patientInfo);
        
        // Extract patient information
        const {
            symptoms,        // e.g., "frequent urination, excessive thirst"
            age,             // e.g., 52
            gender,          // e.g., "male", "female"
            familyHistory,   // e.g., "father had diabetes", "mother had heart attack"
            bloodPressure,   // e.g., "140/90"
            bloodSugar,      // e.g., "180 mg/dL"
            weight,          // e.g., "85 kg"
            height,          // e.g., "175 cm"
            lifestyle        // e.g., "sedentary, smoker, poor diet"
        } = patientInfo;

        // Build the specialized prompt
        const prompt = `You are a medical AI specializing in DIABETES and CARDIOVASCULAR DISEASES. 
Analyze the patient information and provide a detailed risk assessment.

PATIENT INFORMATION:
- Age: ${age || 'Not provided'} years
- Gender: ${gender || 'Not provided'}
- Symptoms: ${symptoms || 'Not provided'}
- Family History: ${familyHistory || 'Not provided'}
- Blood Pressure: ${bloodPressure || 'Not provided'}
- Blood Sugar: ${bloodSugar || 'Not provided'}
- Weight: ${weight || 'Not provided'}
- Height: ${height || 'Not provided'}
- Lifestyle Factors: ${lifestyle || 'Not provided'}

Based on the information above, provide a structured assessment including:

DIABETES RISK ASSESSMENT
- Risk level (Low/Moderate/High)
- Key diabetes symptoms detected
- Predicted probability (if applicable)
- Recommendations for diabetes management

CARDIOVASCULAR RISK ASSESSMENT
- Risk level (Low/Moderate/High)
- Key heart disease symptoms detected
- Predicted probability (if applicable)
- Recommendations for heart health

SYMPTOM ANALYSIS
- Which diabetes-specific symptoms are present?
- Which cardiovascular-specific symptoms are present?
- Any overlapping symptoms?

NEXT STEPS
- When to see a doctor
- Lifestyle modifications
- Monitoring recommendations

RED FLAGS (symptoms requiring immediate medical attention)

Remember: This is for educational purposes and not a substitute for professional medical advice. Always include a disclaimer.`;

        console.log("📤 Sending prompt to Gemini...");
        
        // Get response from Gemini
        const result = await model.generateContent(prompt);
        console.log("📥 Received response from Gemini");
        
        const response = await result.response;
        return response.text();
        
    } catch (error) {
        console.error("❌ Detailed error in diabetesCardioChatbot:", error);
        
        // Return a more specific error message
        if (error.message.includes("API key")) {
            return "There's an issue with the API key. Please check that it's valid.";
        } else if (error.message.includes("quota")) {
            return "API quota exceeded. Please try again later.";
        } else if (error.message.includes("network")) {
            return "Network error. Please check your internet connection.";
        } else {
            return `Error: ${error.message}`;
        }
    }
}

/**
 * Quick symptom checker - just enter symptoms for fast assessment
 */
async function quickCheck(symptoms, age = "", gender = "") {
    return diabetesCardioChatbot({
        symptoms: symptoms,
        age: age,
        gender: gender,
        familyHistory: "",
        bloodPressure: "",
        bloodSugar: "",
        weight: "",
        height: "",
        lifestyle: ""
    });
}

/**
 * Comprehensive health assessment - use when you have more data
 */
async function comprehensiveAssessment(patientData) {
    return diabetesCardioChatbot(patientData);
}

// Export the functions for use in your project
module.exports = {
    diabetesCardioChatbot,
    quickCheck,
    comprehensiveAssessment
};