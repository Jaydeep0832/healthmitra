import re
from typing import Dict, Any


def get_emergency_response(language: str) -> Dict[str, Any]:
    lang = language.lower()
    if lang in ("gujarati", "gu"):
        return {
            "response": (
                "⚠️ આ લક્ષણો તાકીદની કટોકટી હોઈ શકે છે. વિલંબ કર્યા વગર તુરંત ૧૦૮ (108) એમ્બ્યુલન્સ અથવા "
                "૧૧૨ (112) પર કોલ કરો, જાતે વાહન ન ચલાવો અને નજીકની હોસ્પિટલના ઇમરજન્સી વિભાગમાં પહોંચો. "
                "આ AI માર્ગદર્શન છે, વ્યાવસાયિક તબીબી સારવાર નથી."
            ),
            "confidence": 1.0,
            "should_escalate": True,
            "ai_diagnosis": "કટોકટી સંભવિત (Medical Emergency Alert)",
            "recommended_action": "૧૦૮ પર તાત્કાલિક કૉલ કરો અને નજીકની હોસ્પિટલ પહોંચો"
        }
    elif lang in ("hindi", "hi"):
        return {
            "response": (
                "⚠️ यह लक्षण आपातकालीन हो सकते हैं। कृपया तुरंत 108 या 112 पर कॉल करें, "
                "खुद गाड़ी न चलाएं और निकटतम अस्पताल के आपातकालीन विभाग में तुरंत जाएं। "
                "यह AI द्वारा उत्पन्न स्वास्थ्य मार्गदर्शन है, डॉक्टरी सलाह नहीं।"
            ),
            "confidence": 1.0,
            "should_escalate": True,
            "ai_diagnosis": "आपातकालीन स्थिति (Medical Emergency)",
            "recommended_action": "तुरंत 108 या 112 पर कॉल करें"
        }
    else:
        return {
            "response": (
                "⚠️ These symptoms may indicate a medical emergency. Please call 108 or 112 immediately, "
                "do not drive yourself, and seek emergency care at the nearest hospital without delay. "
                "This is AI health guidance, not a substitute for professional medical care."
            ),
            "confidence": 1.0,
            "should_escalate": True,
            "ai_diagnosis": "Potential Medical Emergency",
            "recommended_action": "Call 108 or 112 immediately"
        }


def get_clinical_fallback_response(query: str, language: str) -> Dict[str, Any]:
    """Generates an accurate, empathetic, and medically sound response in the user's language

    when external LLM APIs are unreachable or rate-limited.
    """
    text = query.lower()
    lang = language.lower()
    is_gu = lang in ("gujarati", "gu")
    is_hi = lang in ("hindi", "hi")

    # 1. Fever & Headache (તાવ અને માથાનો દુખાવો / बुखार और सिरदर्द)
    if any(k in text for k in ["તાવ", "માથ", "દુખાવો", "fever", "headache", "temperature", "बुखार", "सिरदर्द", "bodyache"]):
        if is_gu:
            return {
                "response": (
                    "તાવ અને માથાનો દુખાવો સામાન્ય રીતે વાયરલ ઇન્ફેક્શન, થાક અથવા મોસમી ફેરફારને કારણે હોઈ શકે છે.\n\n"
                    "ઘરે આ સાવચેતીઓ રાખો:\n"
                    "૧. **પૂરતો આરામ**: શરીરને રિકવર થવા માટે પૂરતી ઊંઘ અને આરામ આપો.\n"
                    "૨. **પુષ્કળ પ્રવાહી**: દિવસ દરમિયાન સ્વચ્છ ઉકાળેલું પાણી, નાળિયેર પાણી, લીંબુ પાણી અથવા સૂપ પીવો.\n"
                    "૩. **ઠંડા પાણીના પોતા**: તાવ વધુ હોય તો કપાળ પર સામાન્ય ઠંડા પાણીના પોતા મૂકો.\n"
                    "૪. **હળવો ખોરાક**: ખીચડી, મગનું પાણી અથવા દાળ-ભાત જેવો સુપાચ્ય ખોરાક લો.\n\n"
                    "જો તાવ ૧૦૨°F થી વધુ હોય, ૩ દિવસથી વધુ ચાલે, અથવા ગરદન અકડાઈ જાય, તો નજીકના પ્રાથમિક આરોગ્ય કેન્દ્ર (PHC) કે ડૉક્ટરની મુલાકાત લો."
                ),
                "confidence": 0.88,
                "should_escalate": False,
                "ai_diagnosis": "વાયરલ તાવ / મોસમી ચેપ (Viral Fever / Headache)",
                "recommended_action": "આરામ, પુષ્કળ પ્રવાહી અને લક્ષણો વધે તો ડૉક્ટરની સલાહ"
            }
        elif is_hi:
            return {
                "response": (
                    "बुखार और सिरदर्द अक्सर वायरल संक्रमण, थकान या मौसमी बदलाव के कारण हो सकता है।\n\n"
                    "घरेलू देखभाल एवं सुझाव:\n"
                    "1. **पर्याप्त आराम**: शरीर को ठीक होने के लिए भरपूर आराम और नींद दें।\n"
                    "2. **तरल पदार्थों का सेवन**: उबला हुआ पानी, ओआरएस (ORS), नारियल पानी या सूप पिएं।\n"
                    "3. **ठंडी पट्टी**: यदि बुखार ज्यादा हो तो माथे पर सामान्य पानी की ठंडी पट्टी रखें।\n"
                    "4. **हल्का सुपाच्य भोजन**: दलिया, खिचड़ी या मूंग की दाल लें।\n\n"
                    "यदि बुखार 3 दिन से अधिक रहे या बहुत तेज हो, तो तुरंत नजदीकी डॉक्टर या प्राथमिक स्वास्थ्य केंद्र पर जाएं।"
                ),
                "confidence": 0.88,
                "should_escalate": False,
                "ai_diagnosis": "वायरल बुखार एवं सिरदर्द (Viral Fever)",
                "recommended_action": "आराम, हाइड्रेशन और डॉक्टर से परामर्श"
            }
        else:
            return {
                "response": (
                    "Fever and headache are commonly caused by viral infections, seasonal flu, or physical exhaustion.\n\n"
                    "Recommended self-care steps:\n"
                    "1. **Adequate Rest**: Allow your body time to recover with proper sleep.\n"
                    "2. **Hydration**: Drink plenty of clean boiled water, ORS, coconut water, or warm soups.\n"
                    "3. **Cool Sponge**: Apply a damp, cool cloth to your forehead if body temperature is high.\n"
                    "4. **Light Meals**: Eat easy-to-digest food like khichdi, porridge, or fresh fruits.\n\n"
                    "Seek medical evaluation if fever exceeds 102°F, persists for more than 3 days, or is accompanied by stiff neck or vomiting."
                ),
                "confidence": 0.88,
                "should_escalate": False,
                "ai_diagnosis": "Mild Viral Infection / Headache",
                "recommended_action": "Rest, hydration, and doctor consultation if persistent"
            }

    # 2. Healthy Diet & Daily Nutrition (રોજિંદા આહાર / સ્વસ્થ રહેવા / ડાયેટ / दैनिक आहार)
    if any(k in text for k in ["આહાર", "ખોરાક", "ખાવું", "ડાયેટ", "સ્વસ્થ", "diet", "food", "nutrition", "eat", "healthy", "आहार", "भोजन", "खाना"]):
        if is_gu:
            return {
                "response": (
                    "સ્વસ્થ અને તંદુરસ્ત રહેવા માટે તમારા રોજિંદા આહારમાં નીચેની બાબતો સામેલ કરો:\n\n"
                    "૧. **તાજા શાકભાજી અને ફળો**: લીલા શાકભાજી (પાલક, મેથી, દૂધી) અને મોસમી ફળો (પપૈયું, કેળા, સફરજન) નિયમિત ખાઓ.\n"
                    "૨. **પ્રોટીન યુક્ત ખોરાક**: કઠોળ (મગ, ચણા, તુવેર દાળ), દૂધ, દહીં અથવા પનીર રોજિંદા ભોજનમાં રાખો.\n"
                    "૩. **આખા અનાજ**: ઘઉં, બાજરી, જુવાર અને બ્રાઉન રાઈસ ફાયબરથી ભરપૂર હોય છે અને પાચન સુધારે છે.\n"
                    "૪. **પર્યાપ્ત પાણી**: દિવસ દરમિયાન ૮ થી ૧૦ ગ્લાસ ચોખ્ખું પાણી અચૂક પીવો.\n"
                    "૫. **શું ટાળવું**: અતિશય તેલવાળું, તળેલું, વધારે પડતું મીઠું અને પેકેટવાળો પ્રોસેસ્ડ ખોરાક ઓછો ખાવો."
                ),
                "confidence": 0.90,
                "should_escalate": False,
                "ai_diagnosis": "સ્વસ્થ આહાર અને પોષણ માર્ગદર્શન (Healthy Nutrition Guidance)",
                "recommended_action": "સંતુલિત આહાર, લીલા શાકભાજી અને પૂરતું પાણી"
            }
        elif is_hi:
            return {
                "response": (
                    "स्वस्थ और ऊर्जावान रहने के लिए दैनिक आहार में निम्नलिखित खाद्य पदार्थों को शामिल करें:\n\n"
                    "1. **हरी सब्जियां और मौसमी फल**: पालक, लौकी, बीन्स और मौसमी फल नियमित रूप से खाएं।\n"
                    "2. **प्रोटीन युक्त आहार**: दालें (मूंग, चना, अरहर), दूध, दही और अंकुरित अनाज लें।\n"
                    "3. **मोटा अनाज**: गेहूं, बाजरा, ज्वार और दलिया पाचन तंत्र को मजबूत रखते हैं।\n"
                    "4. **भरपूर पानी**: रोजाना कम से कम 8 से 10 गिलास साफ पानी पिएं।\n"
                    "5. **परहेज**: ज्यादा तला-भुना, अत्यधिक नमक और पैकेज्ड प्रोसेस्ड फूड से बचें।"
                ),
                "confidence": 0.90,
                "should_escalate": False,
                "ai_diagnosis": "दैनिक स्वस्थ आहार एवं पोषण (Balanced Diet Guidance)",
                "recommended_action": "संतुलित आहार, दालें, ताजी सब्जियां और पर्याप्त पानी"
            }
        else:
            return {
                "response": (
                    "To maintain overall health and vitality, include these staples in your daily diet:\n\n"
                    "1. **Fresh Vegetables & Fruits**: Eat a variety of green leafy vegetables and seasonal fruits daily.\n"
                    "2. **Adequate Protein**: Include pulses (lentils, chickpeas), milk, yogurt, and sprouted grains.\n"
                    "3. **Whole Grains**: Whole wheat, millet (bajra/jowar), and brown rice provide essential dietary fiber.\n"
                    "4. **Hydration**: Drink 8–10 glasses of clean water throughout the day.\n"
                    "5. **Moderation**: Minimize processed junk food, deep-fried items, and excess refined sugar/salt."
                ),
                "confidence": 0.90,
                "should_escalate": False,
                "ai_diagnosis": "Healthy Daily Nutrition Guidance",
                "recommended_action": "Balanced diet rich in fiber, whole grains, and hydration"
            }

    # 3. Cough, Cold & Throat (શરદી, ખાંસી, ગળામાં દુખાવો / खांसी और जुकाम)
    if any(k in text for k in ["શરદી", "ખાંસી", "ગળું", "છીંક", "cough", "cold", "throat", "sneeze", "खांसी", "जुकाम", "गला"]):
        if is_gu:
            return {
                "response": (
                    "શરદી અને ખાંસી માટે અસરકારક ઘરેલું ઉપાય:\n\n"
                    "૧. **મીઠાના ગરમ પાણીના કોગળા**: દિવસમાં ૨ થી ૩ વખત નવશેકા ગરમ પાણીમાં મીઠું નાખીને કોગળા કરો.\n"
                    "૨. **વરાળ (Steam)**: ગરમ પાણીની વરાળ લેવાથી બંધ નાક અને છાતીમાં આરામ મળે છે.\n"
                    "૩. **ગરમ પીણાં**: આદુ-તુલસીનો ઉકાળો અથવા હળદરવાળું ગરમ દૂધ લો.\n"
                    "૪. ઠંડા પીણાં અને ફ્રિજનું ઠંડું પાણી પીવાનું ટાળો.\n\n"
                    "જો ખાંસી ૧ અઠવાડિયાથી વધુ ચાલે અથવા શ્વાસ લેવામાં તકલીફ થાય તો ડૉક્ટરને બતાવો."
                ),
                "confidence": 0.88,
                "should_escalate": False,
                "ai_diagnosis": "સામાન્ય શરદી અને ખાંસી (Common Cold & Cough)",
                "recommended_action": "વરાળ, ગરમ પાણીના કોગળા અને આરામ"
            }
        elif is_hi:
            return {
                "response": (
                    "खांसी और जुकाम में राहत के लिए प्रमुख घरेलू उपाय:\n\n"
                    "1. **नमक के गुनगुने पानी से गरारे**: दिन में 2-3 बार गरारे करने से गले की खराश कम होती है।\n"
                    "2. **भाप (Steam) लें**: गर्म पानी की भाप लेने से बंद नाक और छाती में जमाव खुलता है।\n"
                    "3. **गर्म तरल**: अदरक-तुलसी की चाय या हल्दी वाला गर्म दूध पिएं।\n"
                    "4. ठंडे पानी और ठंडी चीजों से परहेज करें।\n\n"
                    "यदि खांसी एक सप्ताह से अधिक रहे या सांस फूलने लगे तो डॉक्टर को दिखाएं।"
                ),
                "confidence": 0.88,
                "should_escalate": False,
                "ai_diagnosis": "सामान्य जुकाम एवं खांसी (Common Cold)",
                "recommended_action": "भाप, गरारे और आराम"
            }
        else:
            return {
                "response": (
                    "For common cold and cough relief:\n\n"
                    "1. **Warm Salt Water Gargle**: Gargle 2-3 times daily to soothe throat irritation.\n"
                    "2. **Steam Inhalation**: Inhaling steam relieves nasal congestion.\n"
                    "3. **Warm Fluids**: Sip warm ginger-honey tea or warm turmeric milk.\n"
                    "4. Avoid cold water and chilled beverages.\n\n"
                    "Consult a physician if symptoms persist beyond one week or if breathing becomes labored."
                ),
                "confidence": 0.88,
                "should_escalate": False,
                "ai_diagnosis": "Common Cold & Cough",
                "recommended_action": "Steam inhalation, warm gargles, and rest"
            }

    # 4. Stomach / Digestion / Acidity / Gas (પેટનો દુખાવો / ગેસ / એસિડિટી / पेट दर्द)
    if any(k in text for k in ["પેટ", "એસિડિટી", "ગેસ", "ઝાડા", "ઉલટી", "stomach", "acidity", "gas", "diarrhea", "vomit", "digestion", "पेट"]):
        if is_gu:
            return {
                "response": (
                    "પાચન સંબંધી તકલીફ અથવા પેટના દુખાવા માટે માર્ગદર્શન:\n\n"
                    "૧. **હળવો ખોરાક**: ખીચડી, મોળી છાશ અથવા દહીં લો.\n"
                    "૨. **હાઇડ્રેશન**: ઝાડા કે ઉલટી હોય તો ORS નું દ્રાવણ અથવા લીંબુ-મીઠાનું પાણી ઘૂંટડે ઘૂંટડે પીવો.\n"
                    "૩. અતિશય તેલ, મરચું, મસાલા અને ચા-કોફીનું પ્રમાણ ઘટાડો.\n"
                    "૪. જમ્યા પછી તરત સૂઈ ન જતાં ૧૦ મિનિટ હળવું ચાલો.\n\n"
                    "જો પેટમાં અસહ્ય દુખાવો થાય અથવા ૨૪ કલાકમાં સુધારો ન થાય તો તાત્કાલિક ડૉક્ટરની મુલાકાત લો."
                ),
                "confidence": 0.86,
                "should_escalate": False,
                "ai_diagnosis": "પાચન સંબંધી તકલીફ / હળવો પેટનો દુખાવો (Gastric Discomfort)",
                "recommended_action": "હળવો ખોરાક, ORS/છાશ અને આરામ"
            }
        else:
            return {
                "response": (
                    "For stomach discomfort or digestive issues:\n\n"
                    "1. **Light Diet**: Consume easily digestible food such as plain rice, porridge, or buttermilk.\n"
                    "2. **Electrolytes / ORS**: If diarrhea or nausea occurs, take ORS solution frequently.\n"
                    "3. Avoid deep-fried, heavily spiced foods, and excessive tea or caffeine.\n"
                    "4. Walk gently for 10 minutes after meals.\n\n"
                    "Seek medical care if pain is severe, accompanied by fever, or does not improve within 24 hours."
                ),
                "confidence": 0.86,
                "should_escalate": False,
                "ai_diagnosis": "Mild Gastric Discomfort",
                "recommended_action": "Hydration with ORS, light diet, and rest"
            }

    # 5. Default General Healthcare Fallback
    if is_gu:
        return {
            "response": (
                "હેલ્થમિત્ર AI તરફથી સ્વાસ્થ્ય સલાહ:\n\n"
                "તમારી સુખાકારી માટે નિયમિત પૂરતો આરામ, સંતુલિત પૌષ્ટિક આહાર અને સ્વચ્છ પાણી પીવું અત્યંત જરૂરી છે.\n\n"
                "• જો તમને કોઈ ચોક્કસ લક્ષણો (જેમ કે તાવ, ઉધરસ, દુખાવો) હોય તો વિગત જણાવો જેથી યોગ્ય માર્ગદર્શન મળી શકે.\n"
                "• કટોકટીના સંજોગોમાં હંમેશા ૧૦૮ એમ્બ્યુલન્સ અથવા તમારા નજીકના આરોગ્ય કેન્દ્ર (PHC/CHC) નો સંપર્ક કરો."
            ),
            "confidence": 0.85,
            "should_escalate": False,
            "ai_diagnosis": "સામાન્ય સ્વાસ્થ્ય માર્ગદર્શન (General Health Guidance)",
            "recommended_action": "નિયમિત સ્વાસ્થ્ય તપાસ અને સ્વસ્થ જીવનશૈલી"
        }
    elif is_hi:
        return {
            "response": (
                "हेल्थमित्र AI स्वास्थ्य मार्गदर्शन:\n\n"
                "स्वस्थ रहने के लिए पर्याप्त नींद, संतुलित पौष्टिक आहार और नियमित व्यायाम बहुत जरूरी हैं।\n\n"
                "• यदि आपको बुखार, दर्द या कोई विशेष समस्या है, तो कृपया विस्तार से बताएं।\n"
                "• किसी भी गंभीर स्थिति में हमेशा 108 एम्बुलेंस या नजदीकी स्वास्थ्य केंद्र से संपर्क करें।"
            ),
            "confidence": 0.85,
            "should_escalate": False,
            "ai_diagnosis": "सामान्य स्वास्थ्य मार्गदर्शन (General Health Guidance)",
            "recommended_action": "संतुलित दिनचर्या एवं नियमित स्वास्थ्य जांच"
        }
    else:
        return {
            "response": (
                "HealthMitra AI Guidance:\n\n"
                "For overall health and well-being, prioritize balanced nutrition, adequate rest, and daily hydration.\n\n"
                "• If you are experiencing specific symptoms (such as fever, cough, pain, or nausea), please describe them so we can provide more tailored guidance.\n"
                "• In case of severe discomfort or emergencies, contact 108 or visit your nearest primary healthcare centre."
            ),
            "confidence": 0.85,
            "should_escalate": False,
            "ai_diagnosis": "General Health Guidance",
            "recommended_action": "Healthy lifestyle, hydration, and doctor consult if unwell"
        }
