
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

class AIAssistantService {
  constructor() {
    this.systemPrompt = `You are an expert travel assistant named Smart Travel Assistant. You help users with:
- Travel planning and itinerary creation
- Destination recommendations and hidden gems
- Weather information and best travel times
- Local culture, customs, and etiquette
- Transportation options and tips
- Accommodation suggestions
- Food and dining recommendations
- Budget planning and cost estimates
- Sustainability and eco-friendly travel options
- Safety information and travel advisories
- Local events and activities
- Language tips and basic phrases
- Visa and documentation requirements
- Health and vaccination information

Always be helpful, friendly, and provide accurate information. If you don't know something, acknowledge it and suggest where to find reliable information. Keep responses concise but informative, typically 2-4 sentences unless more detail is needed.`;

    // Initialize OpenAI client if API key is available and valid
    if (process.env.OPENAI_API_KEY && 
        process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' && 
        process.env.OPENAI_API_KEY.trim() !== '' &&
        process.env.OPENAI_API_KEY.startsWith('sk-')) {
      try {
        // Check if it's an OpenRouter key (starts with sk-or-)
        if (process.env.OPENAI_API_KEY.startsWith('sk-or-')) {
          // For OpenRouter, we still use the OpenAI SDK but with OpenRouter base URL
          this.openai = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: 'https://openrouter.ai/api/v1',
            defaultHeaders: {
              'HTTP-Referer': process.env.YOUR_SITE_URL || 'https://tourism-and-travel-tech-front.onrender.com',
              'X-Title': process.env.YOUR_SITE_NAME || 'Smart Travel Assistant',
            },
          });
          console.log('✅ OpenRouter travel assistant initialized successfully');
        } else {
          // Standard OpenAI key
          this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          console.log('✅ OpenAI travel assistant initialized successfully');
        }
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI/OpenRouter client:', error.message);
        this.openai = null;
      }
    } else {
      console.log('⚠️  OpenAI API key not found, invalid format, or placeholder. OpenAI API key should start with "sk-". Using fallback responses');
      this.openai = null;
    }
    
    // Initialize Google Gemini client if API key is available and valid
    if (process.env.GEMINI_API_KEY && 
        process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' && 
        process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        console.log('✅ Google Gemini travel assistant initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Google Gemini client:', error.message);
        this.genAI = null;
        this.model = null;
      }
    } else {
      console.log('⚠️  Google Gemini API key not found or invalid, using fallback responses');
    }
  }

  async getTravelResponse(message, language = 'en', context = {}) {
    // If OpenAI is properly configured, use it
    if (this.openai) {
      try {
        console.log(`🤖 Processing travel query: "${message.substring(0, 50)}..."`);
        
        // Build context information
        let contextInfo = '';
        if (context.destination) {
          contextInfo += `📍 Destination: ${context.destination}\n`;
        }
        if (context.weather) {
          contextInfo += `☀️  Weather: ${context.weather.description}, ${context.weather.temperature}°C\n`;
        }
        if (context.sustainabilityScore) {
          contextInfo += `🌍 Sustainability Score: ${context.sustainabilityScore}/100\n`;
        }
        if (context.crowdLevel) {
          contextInfo += `👥 Crowd Level: ${context.crowdLevel}\n`;
        }
        
        if (contextInfo) {
          contextInfo = `Context Information:\n${contextInfo}\nQuestion: `;
        }

        const prompt = `${this.systemPrompt}\n\n${contextInfo}${message}`;

        // Make API call to OpenAI
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: `${contextInfo}${message}` }
          ],
          max_tokens: 400,
          temperature: 0.7,
        });

        const response = completion.choices[0].message.content.trim();
        console.log('✅ OpenAI response generated successfully');
        
        // Determine response type for UI styling
        let type = this.determineResponseType(response, message, context);

        return {
          response,
          type,
          language,
          source: 'openai',
          timestamp: new Date().toISOString()
        };

      } catch (error) {
        console.error('❌ OpenAI API error:', error.message);
        console.error('Error details:', error);
        
        // Handle specific OpenAI API errors
        if (error.message && error.message.includes('invalid_api_key')) {
          console.error('⚠️  Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file');
        } else if (error.message && error.message.includes('insufficient_quota')) {
          console.error('⚠️  OpenAI API quota exceeded. Please check your usage limits');
        } else if (error.message && error.message.includes('rate_limit_exceeded')) {
          console.error('⚠️  OpenAI rate limit exceeded. Please slow down requests');
        }
        
        // Fallback to Google Gemini if available
        if (this.model) {
          return this.getGeminiResponse(message, language, context);
        } else {
          // Fallback to default responses
          const fallbackResult = this.getFallbackResponse(message, language, context);
          return {
            ...fallbackResult,
            source: 'fallback',
            errorMessage: error.message
          };
        }
      }
    } else if (this.model) {
      // If OpenAI is not available but Gemini is, use Gemini
      return this.getGeminiResponse(message, language, context);
    } else {
      // If neither is available, use fallback responses
      console.log('Using fallback responses due to no AI provider configured');
      return this.getFallbackResponse(message, language, context);
    }
  }
  
  async getGeminiResponse(message, language = 'en', context = {}) {
    try {
      console.log(`🤖 Processing travel query with Gemini: "${message.substring(0, 50)}..."`);
      
      // Build context information
      let contextInfo = '';
      if (context.destination) {
        contextInfo += `📍 Destination: ${context.destination}\n`;
      }
      if (context.weather) {
        contextInfo += `☀️  Weather: ${context.weather.description}, ${context.weather.temperature}°C\n`;
      }
      if (context.sustainabilityScore) {
        contextInfo += `🌍 Sustainability Score: ${context.sustainabilityScore}/100\n`;
      }
      if (context.crowdLevel) {
        contextInfo += `👥 Crowd Level: ${context.crowdLevel}\n`;
      }
      
      if (contextInfo) {
        contextInfo = `Context Information:\n${contextInfo}\nQuestion: `;
      }

      const prompt = `${this.systemPrompt}\n\n${contextInfo}${message}`;

      // Make API call to Google Gemini
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 400,
          temperature: 0.7,
        },
      });

      const response = result.response.text().trim();
      console.log('✅ Google Gemini response generated successfully');
      
      // Determine response type for UI styling
      let type = this.determineResponseType(response, message, context);

      return {
        response,
        type,
        language,
        source: 'gemini',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Google Gemini API error:', error.message);
      console.error('Error details:', error);
      
      // Handle specific Gemini API errors
      if (error.message && error.message.includes('API_KEY_INVALID')) {
        console.error('⚠️  Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file');
      } else if (error.message && error.message.includes('Quota exceeded')) {
        console.error('⚠️  Gemini API quota exceeded. Please check your usage limits');
      } else if (error.message && error.message.includes('content')) {
        console.error('⚠️  Content policy violation. The request may contain inappropriate content');
      }
      
      // Fallback to default responses
      const fallbackResult = this.getFallbackResponse(message, language, context);
      return {
        ...fallbackResult,
        source: 'fallback',
        errorMessage: error.message
      };
    }
  }

  // Enhanced method to determine response type based on content and context
  determineResponseType(response, originalMessage, context = {}) {
    const lowerResponse = response.toLowerCase();
    const lowerMessage = originalMessage.toLowerCase();
    
    // Greeting detection
    if ((lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) && 
        (lowerResponse.includes('hello') || lowerResponse.includes('welcome') || lowerResponse.includes('hi') || lowerResponse.includes('hey'))) {
      return 'greeting';
    }
    
    // Weather detection
    if (lowerResponse.includes('weather') || lowerResponse.includes('temperature') || lowerResponse.includes('forecast') || lowerResponse.includes('climate') ||
        lowerMessage.includes('weather') || lowerMessage.includes('temperature') || lowerMessage.includes('forecast')) {
      return 'weather';
    }
    
    // Sustainability detection
    if (lowerResponse.includes('sustainability') || lowerResponse.includes('eco') || lowerResponse.includes('green') || lowerResponse.includes('environment') ||
        lowerMessage.includes('sustainability') || lowerMessage.includes('eco') || lowerMessage.includes('green')) {
      return 'sustainability';
    }
    
    // Crowd detection
    if (lowerResponse.includes('crowd') || lowerResponse.includes('busy') || lowerResponse.includes('people') || lowerResponse.includes('visitors') ||
        lowerMessage.includes('crowd') || lowerMessage.includes('busy') || lowerMessage.includes('people')) {
      return 'crowd';
    }
    
    // Hidden gems detection
    if (lowerResponse.includes('hidden') || lowerResponse.includes('secret') || lowerResponse.includes('local') || lowerResponse.includes('gem') || lowerResponse.includes('offbeat') ||
        lowerMessage.includes('hidden') || lowerMessage.includes('secret') || lowerMessage.includes('local') || lowerMessage.includes('gem')) {
      return 'hiddenGems';
    }
    
    // Budget detection
    if (lowerResponse.includes('budget') || lowerResponse.includes('cost') || lowerResponse.includes('price') || lowerResponse.includes('expensive') || lowerResponse.includes('cheap') ||
        lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('expensive') || lowerMessage.includes('cheap')) {
      return 'budget';
    }
    
    // Transportation detection
    if (lowerResponse.includes('transport') || lowerResponse.includes('get around') || lowerResponse.includes('public transport') || lowerResponse.includes('taxi') ||
        lowerMessage.includes('transport') || lowerMessage.includes('get around') || lowerMessage.includes('public transport') || lowerMessage.includes('taxi')) {
      return 'transportation';
    }
    
    // Food detection
    if (lowerResponse.includes('food') || lowerResponse.includes('restaurant') || lowerResponse.includes('cuisine') || lowerResponse.includes('eat') ||
        lowerMessage.includes('food') || lowerMessage.includes('restaurant') || lowerMessage.includes('cuisine') || lowerMessage.includes('eat')) {
      return 'food';
    }
    
    // Accommodation detection
    if (lowerResponse.includes('hotel') || lowerResponse.includes('accommodation') || lowerResponse.includes('stay') || lowerResponse.includes('lodging') ||
        lowerMessage.includes('hotel') || lowerMessage.includes('accommodation') || lowerMessage.includes('stay') || lowerMessage.includes('lodging')) {
      return 'accommodation';
    }
    
    // Emergency detection
    if (lowerResponse.includes('emergency') || lowerResponse.includes('help') || lowerResponse.includes('danger') || lowerResponse.includes('safe') ||
        lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('danger') || lowerMessage.includes('safe')) {
      return 'emergency';
    }
    
    return 'general';
  }


  getFallbackResponse(message, language = 'en', context = {}) {
    const responses = {
      en: {
        greetings: [
          "Hello! I'm your Smart Travel Assistant. How can I help you plan your perfect trip?",
          "Welcome! I can help you discover hidden gems, check weather, and create personalized itineraries."
        ],
        weather: "The weather forecast shows {description} with temperatures around {temp}°C. Don't forget to pack accordingly!",
        sustainability: "Great choice! This destination has a sustainability score of {score}/100. You're helping support eco-friendly tourism.",
        crowd: "Crowd levels are {level} right now. Perfect time to visit without the rush!",
        hiddenGems: "I found some amazing hidden gems for you! These local favorites offer authentic experiences away from tourist crowds.",
        budget: "I can help you plan a budget-friendly trip! Let me know your price range and I'll suggest great options.",
        transportation: "I can help you with transportation options! What type of transport are you looking for?",
        food: "I'd love to recommend great local food spots! What type of cuisine interests you?",
        accommodation: "I can help you find the perfect place to stay! What's your budget and preferences?",
        emergency: "For emergencies, please contact local authorities. I'm here to help with travel information.",
        default: "I'd be happy to help! You can ask me about weather, attractions, local events, or sustainability tips for your destination."
      },
      es: {
        greetings: [
          "¡Hola! Soy tu Asistente de Viajes Inteligente. ¿Cómo puedo ayudarte a planificar tu viaje perfecto?",
          "¡Bienvenido! Puedo ayudarte a descubrir joyas ocultas, consultar el clima y crear itinerarios personalizados."
        ],
        weather: "El pronóstico del tiempo muestra {description} con temperaturas alrededor de {temp}°C. ¡No olvides empacar adecuadamente!",
        sustainability: "¡Excelente elección! Este destino tiene una puntuación de sostenibilidad de {score}/100. Estás ayudando a apoyar el turismo ecológico.",
        crowd: "Los niveles de multitud son {level} ahora mismo. ¡Momento perfecto para visitar sin aglomeraciones!",
        hiddenGems: "¡Encontré algunas joyas ocultas increíbles para ti! Estos favoritos locales ofrecen experiencias auténticas lejos de las multitudes turísticas.",
        budget: "¡Puedo ayudarte a planificar un viaje económico! Dime tu rango de precios y te sugeriré excelentes opciones.",
        transportation: "¡Puedo ayudarte con opciones de transporte! ¿Qué tipo de transporte buscas?",
        food: "¡Me encantaría recomendarte excelentes lugares de comida local! ¿Qué tipo de cocina te interesa?",
        accommodation: "¡Puedo ayudarte a encontrar el lugar perfecto para alojarte! ¿Cuál es tu presupuesto y preferencias?",
        emergency: "Para emergencias, por favor contacta a las autoridades locales. Estoy aquí para ayudar con información de viaje.",
        default: "¡Con gusto te ayudo! Puedes preguntarme sobre el clima, atracciones, eventos locales o consejos de sostenibilidad para tu destino."
      },
      fr: {
        greetings: [
          "Bonjour! Je suis votre Assistant de Voyage Intelligent. Comment puis-je vous aider à planifier votre voyage parfait?",
          "Bienvenue! Je peux vous aider à découvrir des trésors cachés, vérifier la météo et créer des itineraires personnalisés."
        ],
        weather: "Les prévisions météorologiques montrent {description} avec des températures autour de {temp}°C. N'oubliez pas de faire vos bagages en conséquence!",
        sustainability: "Excellent choix! Cette destination a un score de durabilité de {score}/100. Vous contribuez à soutenir le tourisme écologique.",
        crowd: "Les niveaux de foule sont {level} en ce moment. Moment parfait pour visiter sans bousculade!",
        hiddenGems: "J'ai trouvé des trésors cachés incroyables pour vous! Ces favoris locaux offrent des expériences authentiques loin des foules touristiques.",
        budget: "Je peux vous aider à planifier un voyage économique! Dites-moi votre fourchette de prix et je vous suggérerai d'excellentes options.",
        transportation: "Je peux vous aider avec les options de transport! Quel type de transport recherchez-vous?",
        food: "J'adorerais vous recommander d'excellents endroits de cuisine locale! Quel type de cuisine vous intéresse?",
        accommodation: "Je peux vous aider à trouver le lieu parfait pour séjourner! Quel est votre budget et vos préférences?",
        emergency: "Pour les urgences, veuillez contacter les autorités locales. Je suis ici pour aider avec les informations de voyage.",
        default: "Je serais ravi de vous aider! Vous pouvez me demander des informations sur la météo, les attractions, les événements locaux ou les conseils de durabilité pour votre destination."
      },
      de: {
        greetings: [
          "Hallo! Ich bin Ihr Intelligenter Reiseassistent. Wie kann ich Ihnen bei der Planung Ihrer perfekten Reise helfen?",
          "Willkommen! Ich kann Ihnen helfen, versteckte Schätze zu entdecken, das Wetter zu überprüfen und personalisierte Reiserouten zu erstellen."
        ],
        weather: "Die Wettervorhersage zeigt {description} mit Temperaturen um {temp}°C. Vergessen Sie nicht, entsprechend zu packen!",
        sustainability: "Ausgezeichnete Wahl! Dieses Reiseziel hat eine Nachhaltigkeitsbewertung von {score}/100. Sie helfen dabei, umweltfreundlichen Tourismus zu unterstützen.",
        crowd: "Die Besucherzahlen sind momentan {level}. Perfekte Zeit zum Besuchen ohne Gedränge!",
        hiddenGems: "Ich habe einige erstaunliche Geheimtipps für Sie gefunden! Diese lokalen Favoriten bieten authentische Erfahrungen fernab der Touristenmassen.",
        budget: "Ich kann Ihnen helfen, eine budgetfreundliche Reise zu planen! Teilen Sie mir Ihre Preisspanne mit und ich schlage Ihnen großartige Optionen vor.",
        transportation: "Ich kann Ihnen bei den Transportoptionen helfen! Welche Art von Transport suchen Sie?",
        food: "Ich würde Ihnen gerne großartige lokale Essensstellen empfehlen! Welche Art von Küche interessiert Sie?",
        accommodation: "Ich kann Ihnen helfen, den perfekten Ort zum Übernachten zu finden! Was ist Ihr Budget und Ihre Vorlieben?",
        emergency: "Bei Notfällen wenden Sie sich bitte an die lokalen Behörden. Ich helfe Ihnen gerne bei Reiseinformationen.",
        default: "Ich helfe Ihnen gerne! Sie können mich nach dem Wetter, Sehenswürdigkeiten, lokalen Veranstaltungen oder Nachhaltigkeitstipps für Ihr Reiseziel fragen."
      }
    };

    const lang = responses[language] ? language : 'en';
    const langResponses = responses[lang];

    let response = langResponses.default;
    let type = 'default';

    const lowerMessage = message.toLowerCase();

    // Simple intent detection
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hola') || lowerMessage.includes('bonjour')) {
      response = langResponses.greetings[Math.floor(Math.random() * langResponses.greetings.length)];
      type = 'greeting';
    } else if (lowerMessage.includes('weather') || lowerMessage.includes('clima') || lowerMessage.includes('météo') || lowerMessage.includes('wetter')) {
      response = langResponses.weather
        .replace('{description}', context.weather?.description || 'pleasant')
        .replace('{temp}', context.weather?.temperature || '20');
      type = 'weather';
    } else if (lowerMessage.includes('sustainability') || lowerMessage.includes('eco') || lowerMessage.includes('green')) {
      response = langResponses.sustainability.replace('{score}', context.sustainabilityScore || '75');
      type = 'sustainability';
    } else if (lowerMessage.includes('crowd') || lowerMessage.includes('busy') || lowerMessage.includes('people')) {
      response = langResponses.crowd.replace('{level}', context.crowdLevel || 'low');
      type = 'crowd';
    } else if (lowerMessage.includes('hidden') || lowerMessage.includes('secret') || lowerMessage.includes('local') || lowerMessage.includes('gem')) {
      response = langResponses.hiddenGems;
      type = 'hiddenGems';
    } else if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('expensive') || lowerMessage.includes('cheap')) {
      response = langResponses.budget;
      type = 'budget';
    } else if (lowerMessage.includes('transport') || lowerMessage.includes('get around') || lowerMessage.includes('public transport') || lowerMessage.includes('taxi')) {
      response = langResponses.transportation;
      type = 'transportation';
    } else if (lowerMessage.includes('food') || lowerMessage.includes('restaurant') || lowerMessage.includes('cuisine') || lowerMessage.includes('eat')) {
      response = langResponses.food;
      type = 'food';
    } else if (lowerMessage.includes('hotel') || lowerMessage.includes('accommodation') || lowerMessage.includes('stay') || lowerMessage.includes('lodging')) {
      response = langResponses.accommodation;
      type = 'accommodation';
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('danger') || lowerMessage.includes('safe')) {
      response = langResponses.emergency;
      type = 'emergency';
    }

    return {
      response,
      type,
      language: lang,
      source: 'fallback'
    };
  }

  // Get intelligent suggestions based on destination and context
  async getSuggestions(destination, language = 'en', context = {}) {
    // If OpenAI is available, use it
    if (this.openai) {
      try {
        const prompt = `Generate 4 travel-related questions or suggestions for someone visiting ${destination}. Make them specific and helpful. Return as a JSON array of strings.`;

        const systemPrompt = "You are a travel expert. Generate exactly 4 helpful travel questions or suggestions as a JSON array. Example: [\"What's the best time to visit?\", \"What are the must-see attractions?\", \"What's the local cuisine like?\", \"How do I get around?\"]";
        
        const fullPrompt = `${systemPrompt}

${prompt}`;

        // Make API call to OpenAI
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 150,
          temperature: 0.8,
        });

        let suggestions;
        try {
          // Parse the JSON response
          const responseText = completion.choices[0].message.content.trim();
          // Extract JSON array from response if it contains other text
          const jsonMatch = responseText.match(/\[.*\]/s);
          if (jsonMatch) {
            suggestions = JSON.parse(jsonMatch[0]);
          } else {
            // If no JSON array found, use fallback
            suggestions = this.getFallbackSuggestions(destination, language);
          }
        } catch (parseError) {
          // If JSON parsing fails, use fallback
          suggestions = this.getFallbackSuggestions(destination, language);
        }

        return suggestions;

      } catch (error) {
        console.error('OpenAI suggestions error:', error.message);
        
        // Handle specific OpenAI API errors
        if (error.message && error.message.includes('invalid_api_key')) {
          console.error('⚠️  Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file');
        } else if (error.message && error.message.includes('insufficient_quota')) {
          console.error('⚠️  OpenAI API quota exceeded. Please check your usage limits');
        } else if (error.message && error.message.includes('rate_limit_exceeded')) {
          console.error('⚠️  OpenAI rate limit exceeded. Please slow down requests');
        }
        
        // Fallback to Google Gemini if available
        if (this.model) {
          return this.getGeminiSuggestions(destination, language, context);
        } else {
          return this.getFallbackSuggestions(destination, language);
        }
      }
    } else if (this.model) {
      // If OpenAI is not available but Gemini is, use Gemini
      return this.getGeminiSuggestions(destination, language, context);
    } else {
      // If neither is available, use fallback
      return this.getFallbackSuggestions(destination, language);
    }
  }
  
  async getGeminiSuggestions(destination, language = 'en', context = {}) {
    try {
      const prompt = `Generate 4 travel-related questions or suggestions for someone visiting ${destination}. Make them specific and helpful. Return as a JSON array of strings.`;

      const systemPrompt = "You are a travel expert. Generate exactly 4 helpful travel questions or suggestions as a JSON array. Example: [\"What's the best time to visit?\", \"What are the must-see attractions?\", \"What's the local cuisine like?\", \"How do I get around?\"]";
      
      const fullPrompt = `${systemPrompt}

${prompt}`;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.8,
        },
      });

      let suggestions;
      try {
        suggestions = JSON.parse(result.response.text().trim());
      } catch (parseError) {
        // If JSON parsing fails, use fallback
        suggestions = this.getFallbackSuggestions(destination, language);
      }

      return suggestions;

    } catch (error) {
      console.error('Google Gemini suggestions error:', error.message);
      
      // Handle specific Gemini API errors
      if (error.message && error.message.includes('API_KEY_INVALID')) {
        console.error('⚠️  Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file');
      } else if (error.message && error.message.includes('Quota exceeded')) {
        console.error('⚠️  Gemini API quota exceeded. Please check your usage limits');
      } else if (error.message && error.message.includes('content')) {
        console.error('⚠️  Content policy violation. The request may contain inappropriate content');
      }
      
      return this.getFallbackSuggestions(destination, language);
    }
  }

  getFallbackSuggestions(destination, language = 'en') {
    const suggestions = {
      en: [
        `What's the weather like in ${destination}?`,
        "Show me hidden gems",
        "Tell me about sustainability",
        "What are the crowd levels?"
      ],
      es: [
        `¿Cómo está el clima en ${destination}?`,
        "Muéstrame joyas ocultas",
        "Cuéntame sobre sostenibilidad",
        "¿Cuáles son los niveles de multitudes?"
      ],
      fr: [
        `Quel temps fait-il à ${destination}?`,
        "Montrez-moi des trésors cachés",
        "Parlez-moi de durabilité",
        "Quels sont les niveles de foule?"
      ],
      de: [
        `Wie ist das Wetter in ${destination}?`,
        "Zeigen Sie mir versteckte Schätze",
        "Erzählen Sie mir von Nachhaltigkeit",
        "Wie hoch sind die Besucherzahlen?"
      ]
    };

    const lang = suggestions[language] ? language : 'en';
    return suggestions[lang];
  }
}

module.exports = new AIAssistantService();