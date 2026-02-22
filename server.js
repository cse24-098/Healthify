const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { quickCheck, comprehensiveAssessment } = require('./diabetes-cardio-chatbot.js');
const db = require('./database'); 

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); 

// API endpoint for chatbot
app.post('/api/chat', async (req, res) => {
    console.log("📨 Received request at /api/chat");
    console.log("Request body:", req.body);
    
    try {
        const { symptoms, age, gender, type, ...rest } = req.body;
        
        let result;
        if (type === 'comprehensive') {
            console.log("📊 Using comprehensive assessment");
            result = await comprehensiveAssessment(req.body);
            
            // comprehensive assessment to database
            try {
                await db.saveRiskAssessment(1, { // Assuming user_id = 1 for now
                    diabetesRisk: "Based on assessment",
                    cardioRisk: "Based on assessment",
                    bloodPressure: rest.bloodPressure || 'Not provided',
                    bloodSugar: rest.bloodSugar || 'Not provided',
                    weight: rest.weight || 'Not provided',
                    height: rest.height || 'Not provided',
                    lifestyle: rest.lifestyle || 'Not provided'
                });
                console.log("✅ Risk assessment saved to database");
            } catch (dbError) {
                console.error("Failed to save to database:", dbError.message);
            }
        } else {
            console.log("🔍 Using quick check");
            result = await quickCheck(symptoms, age, gender);
            
            // Save quick check to database
            try {
                await db.saveChat(1, symptoms, age, gender, result.substring(0, 500)); // Save first 500 chars
                console.log(" Chat saved to database");
            } catch (dbError) {
                console.error(" Failed to save to database:", dbError.message);
            }
        }
        
        console.log("✅ Sending response back to client");
        res.json({ success: true, response: result });
    } catch (error) {
        console.error(" Error in /api/chat:", error);
        res.json({ success: false, response: "Error processing request: " + error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${3001}`);
    console.log(` Open http://localhost:${3001}/chatbot-test.html in your browser`);
});