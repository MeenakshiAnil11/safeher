// backend/controllers/pregnancyChatController.js
import PregnancyChat from "../models/PregnancyChat.js";
import crypto from "crypto";

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const sessionId = req.headers['session-id'] || crypto.randomUUID();
    
    let chat = await PregnancyChat.findOne({ 
      user: req.userId, 
      sessionId 
    });

    if (!chat) {
      chat = await PregnancyChat.create({
        user: req.userId,
        sessionId,
        messages: []
      });
    }

    res.json({ success: true, chatHistory: chat.messages });
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch chat history" });
  }
};

// Send message and get AI response
export const sendMessage = async (req, res) => {
  try {
    const { message, userId } = req.body;
    const sessionId = req.headers['session-id'] || crypto.randomUUID();

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Message is required" 
      });
    }

    // Find or create chat session
    let chat = await PregnancyChat.findOne({ 
      user: req.userId, 
      sessionId 
    });

    if (!chat) {
      chat = await PregnancyChat.create({
        user: req.userId,
        sessionId,
        messages: []
      });
    }

    // Add user message
    chat.messages.push({
      type: "user",
      message: message.trim(),
      timestamp: new Date()
    });

    // Generate AI response (simplified for demo)
    const aiResponse = generateAIResponse(message.trim(), req.userId);

    // Add AI response
    chat.messages.push({
      type: "ai",
      message: aiResponse,
      timestamp: new Date()
    });

    await chat.save();

    res.json({ success: true, aiResponse });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

// Clear chat history
export const clearChatHistory = async (req, res) => {
  try {
    const sessionId = req.headers['session-id'];
    
    if (sessionId) {
      await PregnancyChat.findOneAndDelete({ 
        user: req.userId, 
        sessionId 
      });
    } else {
      await PregnancyChat.deleteMany({ user: req.userId });
    }

    res.json({ success: true, message: "Chat history cleared successfully" });
  } catch (error) {
    console.error("Clear chat history error:", error);
    res.status(500).json({ success: false, message: "Failed to clear chat history" });
  }
};

// Generate AI response (simplified for demo)
function generateAIResponse(message, userId) {
  const lowerMessage = message.toLowerCase();
  
  // Simple keyword-based responses
  if (lowerMessage.includes('nausea') || lowerMessage.includes('morning sickness')) {
    return "Morning sickness is very common in early pregnancy. Try eating small, frequent meals, ginger tea, or crackers before getting out of bed. If it's severe, consult your healthcare provider about safe medications.";
  }
  
  if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
    return "Exercise during pregnancy is generally safe and beneficial! Walking, swimming, and prenatal yoga are excellent choices. Avoid high-impact activities and always consult your healthcare provider before starting any new exercise routine.";
  }
  
  if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('diet')) {
    return "Focus on a balanced diet with plenty of fruits, vegetables, lean proteins, and whole grains. Avoid raw fish, unpasteurized dairy, and limit caffeine to 200mg per day. Prenatal vitamins are also important!";
  }
  
  if (lowerMessage.includes('sleep') || lowerMessage.includes('tired')) {
    return "Fatigue is very common during pregnancy, especially in the first and third trimesters. Try to maintain a regular sleep schedule, use pregnancy pillows for comfort, and don't hesitate to take naps when needed.";
  }
  
  if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
    return "Some discomfort is normal during pregnancy, but always consult your healthcare provider about any pain you're experiencing. They can help determine if it's normal pregnancy discomfort or something that needs attention.";
  }
  
  if (lowerMessage.includes('baby') || lowerMessage.includes('movement')) {
    return "Feeling your baby move is one of the most amazing parts of pregnancy! Most women feel their first movements between 16-25 weeks. If you're concerned about decreased movement, contact your healthcare provider.";
  }
  
  if (lowerMessage.includes('appointment') || lowerMessage.includes('doctor')) {
    return "Regular prenatal appointments are crucial for monitoring your health and your baby's development. Keep track of your appointments and don't hesitate to call your healthcare provider with any questions or concerns.";
  }
  
  if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
    return "It's completely normal to feel anxious during pregnancy. Try relaxation techniques like deep breathing, meditation, or gentle yoga. If anxiety becomes overwhelming, consider talking to a mental health professional.";
  }
  
  if (lowerMessage.includes('weight') || lowerMessage.includes('gain')) {
    return "Weight gain during pregnancy is normal and necessary for your baby's healthy development. The amount varies by individual, but your healthcare provider can guide you on healthy weight gain goals.";
  }
  
  if (lowerMessage.includes('labor') || lowerMessage.includes('birth') || lowerMessage.includes('delivery')) {
    return "Labor and delivery can feel overwhelming, but you're stronger than you know! Consider taking childbirth classes, creating a birth plan, and discussing your preferences with your healthcare provider.";
  }
  
  // Default response
  return "Thank you for your question! I'm here to provide general information and support during your pregnancy journey. Remember, I'm not a substitute for professional medical advice - always consult your healthcare provider for medical concerns. Is there anything specific about your pregnancy you'd like to know more about?";
}
