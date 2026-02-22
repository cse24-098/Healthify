const db = require('./database');

async function checkDatabase() {
    console.log("=".repeat(50));
    console.log(" CHECKING DATABASE");
    console.log("=".repeat(50));
    
    try {
        const chats = await db.getRecentChats(20);
        
        if (chats.length === 0) {
            console.log("📭 No chats found in database yet.");
            console.log("\n To add data:");
            console.log("1. Make sure server is running: node server.js");
            console.log("2. Open http://localhost:3000/chatbot-test.html");
            console.log("3. Click any test button");
            console.log("4. Run this file again");
        } else {
            console.log(` Found ${chats.length} chats in database\n`);
            
            chats.forEach((chat, i) => {
                console.log(`--- CHAT ${i+1} ---`);
                console.log(` ID: ${chat.id}`);
                console.log(` Symptoms: ${chat.symptoms}`);
                console.log(` Age: ${chat.age}, Gender: ${chat.gender}`);
                console.log(`Type: ${chat.assessment_type}`);
                console.log(`Date: ${chat.created_at}`);
                console.log(`Assessment preview: ${(chat.risk_assessment || '').substring(0, 150)}...`);
                console.log("-".repeat(40));
            });
        }
    } catch (error) {
        console.error(" Error checking database:", error.message);
    }
    
    db.close();
}

checkDatabase();