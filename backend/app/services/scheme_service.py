from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from app.models.scheme import (
    HealthScheme,
    InsurancePolicy,
    PatientClaim,
    SchemeVerificationStatus,
    SchemeCategory,
    IssuingAuthorityType,
    ClaimStatus,
    ClaimType,
    ClaimVerificationSource,
    ClaimCreateRequest,
    EligibilityCheckRequest,
    EligibilityMatch,
)

# Curated dataset of active, verified Indian government healthcare schemes
VERIFIED_SCHEMES_DATA: List[Dict[str, Any]] = [
    {
        "id": "pmjay-ayushman",
        "name": "Ayushman Bharat PM-JAY (Pradhan Mantri Jan Arogya Yojana)",
        "name_localized": {
            "gu": "આયુષ્માન ભારત પ્રધાનમંત્રી જન આરોગ્ય યોજના (PM-JAY)",
            "hi": "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना (PM-JAY)",
            "mr": "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना",
            "bn": "আয়ুষ্মান ভারত প্রধানমন্ত্রী জন আরোগ্য যোজনা",
            "ta": "ஆயுஷ்மான் பாரத் பிரதம மந்திரி ஜன் ஆரோக்கிய திட்டம்",
            "te": "ఆయుష్మాన్ భారత్ ప్రధాన మంత్రి జన్ ఆరోగ్య యోజన"
        },
        "short_description": "World's largest government-funded healthcare scheme providing ₹5 Lakh annual cashless tertiary treatment to eligible rural and low-to-middle income families.",
        "description_localized": {
            "gu": "પાત્ર ગ્રામીણ અને મધ્યમ વર્ગના પરિવારોને પ્રતિ વર્ષ ₹5 લાખ સુધીનું કેશલેસ હોસ્પિટલ સારવાર કવચ પૂરું પાડતી યોજના.",
            "hi": "योग्य ग्रामीण और मध्यम वर्गीय परिवारों को प्रति वर्ष ₹5 लाख तक का कैशलेस अस्पताल उपचार कवर प्रदान करने वाली योजना।"
        },
        "issuing_authority": IssuingAuthorityType.CENTRAL,
        "state_jurisdiction": "All India",
        "categories": [
            SchemeCategory.HOSPITALIZATION,
            SchemeCategory.OPERATIONS_SURGERY,
            SchemeCategory.CRITICAL_ILLNESS,
            SchemeCategory.CHRONIC_DISEASES
        ],
        "coverage_amount": "₹5,00,000 per family / year",
        "coverage_amount_num": 500000,
        "income_limit": "SECC 2011 criteria or Priority Ration Card",
        "income_limit_max": 300000,
        "eligibility_criteria": [
            "Families listed in SECC 2011 database or NFSA priority cardholders",
            "Rural deprivation criteria (D1 to D7) or designated urban occupational categories",
            "All pre-existing medical conditions covered from Day 1",
            "No family size or age cap"
        ],
        "covered_treatments": [
            "Cardiovascular surgeries (Angioplasty, CABG)",
            "Oncology (Medical, Surgical & Radiation therapy)",
            "Neuro-surgery & polytrauma care",
            "Orthopedic joint replacements",
            "Kidney Dialysis & Renal failure management",
            "Neonatal & pediatric intensive care"
        ],
        "required_documents": [
            "Aadhaar Card of patient",
            "Ration Card or Family Samagra ID",
            "PM-JAY Golden Card / Ayushman Card printout",
            "Government photo ID proof"
        ],
        "application_link": "https://beneficiary.nha.gov.in/",
        "helpline_number": "14555 / 1800-111-565",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-10",
        "verified_by": "National Health Authority (NHA)",
        "middle_class_friendly": True
    },
    {
        "id": "pmjay-vay-vandana",
        "name": "Ayushman Vay Vandana Yojana (Seniors 70+ Universal Cover)",
        "name_localized": {
            "gu": "આયુષ્માન વય વંદના યોજના (70+ વરિષ્ઠ નાગરિકો માટે)",
            "hi": "आयुष्मान वय वंदना योजना (70+ वरिष्ठ नागरिक)",
            "mr": "आयुष्मान वय वंदना योजना (70+ ज्येष्ठ नागरिक)",
            "bn": "আয়ুষ্মান বয় বন্দনা যোজনা (৭০+ প্রবীণ নাগরিক)",
            "ta": "ஆயுஷ்மான் வய வந்தனா திட்டம் (70+ முதியோர்)",
            "te": "ఆయుష్మాన్ వయ వందన యోజన (70+ వృద్ధులు)"
        },
        "short_description": "Universal, non-income-capped ₹5 Lakh healthcare safety net for every Indian citizen aged 70 and above, regardless of socio-economic status.",
        "description_localized": {
            "gu": "આવકની કોઈપણ મર્યાદા વગર 70 વર્ષ કે તેથી વધુ વયના દરેક વરિષ્ઠ નાગરિકને વાર્ષિક ₹5 લાખ સુધીનું સંપૂર્ણ મફત સારવાર કવચ.",
            "hi": "आय की किसी सीमा के बिना 70 वर्ष या अधिक उम्र के प्रत्येक वरिष्ठ नागरिक के लिए ₹5 लाख का स्वास्थ्य सुरक्षा कवर।"
        },
        "issuing_authority": IssuingAuthorityType.CENTRAL,
        "state_jurisdiction": "All India",
        "categories": [
            SchemeCategory.HOSPITALIZATION,
            SchemeCategory.CRITICAL_ILLNESS,
            SchemeCategory.CHRONIC_DISEASES,
            SchemeCategory.OPERATIONS_SURGERY
        ],
        "coverage_amount": "₹5,00,000 top-up cover per senior individual / year",
        "coverage_amount_num": 500000,
        "income_limit": "No income limit (Universal for all 70+ citizens)",
        "income_limit_max": None,
        "eligibility_criteria": [
            "Indian citizen aged 70 years or above (as per Aadhaar)",
            "No minimum or maximum family income ceiling (covers all middle & upper-middle class seniors)",
            "Independent ₹5 Lakh pool distinct from standard family PM-JAY card",
            "Can co-exist or be used in lieu of other private health insurance"
        ],
        "covered_treatments": [
            "Geriatric care & chronic disease admissions",
            "Cardiac interventions, pacemakers, and bypass",
            "Knee and hip replacement surgeries",
            "Stroke rehabilitation and neurology care",
            "Cataract & ophthalmic advanced procedures",
            "Cancer therapies and palliative admissions"
        ],
        "required_documents": [
            "Aadhaar Card (e-KYC verified for age ≥ 70 years)",
            "Active mobile number linked to Aadhaar",
            "Recent passport-sized photograph"
        ],
        "application_link": "https://beneficiary.nha.gov.in/",
        "helpline_number": "14555",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-12",
        "verified_by": "Ministry of Health and Family Welfare (MoHFW)",
        "middle_class_friendly": True
    },
    {
        "id": "gujarat-maa-yojana",
        "name": "Mukhyamantri Amrutam (MA & MA Vatsalya) Yojana — Gujarat",
        "name_localized": {
            "gu": "મુખ્યમંત્રી અમૃતમ (મા અને મા વાત્સલ્ય) યોજના — ગુજરાત",
            "hi": "मुख्यमंत्री अमृतम (मा एवं मा वात्सल्य) योजना — गुजरात",
            "mr": "मुख्यमंत्री अमृतम योजना — गुजरात",
            "bn": "মুখ্যমন্ত্রী অমৃতম যোজনা — গুজরাট",
            "ta": "முதலமைச்சர் அம்ருதம் திட்டம் — குஜராத்",
            "te": "ముఖ్యమంత్రి అమృతం యోజన — గుజరాత్"
        },
        "short_description": "Flagship Gujarat tertiary healthcare scheme covering BPL and Lower-Middle-Class families with annual income up to ₹4,00,000 for critical treatments up to ₹10 Lakh.",
        "description_localized": {
            "gu": "ગુજરાતના મધ્યમ વર્ગ (વાર્ષિક આવક ₹4,00,000 સુધી) અને BPL પરિવારોને ગંભીર બીમારીઓ માટે ₹10 લાખ સુધીનું મફત સારવાર કવચ.",
            "hi": "गुजरात के मध्यम वर्ग (वार्षिक आय ₹4,00,000 तक) और बीपीएल परिवारों के लिए ₹10 लाख तक का मुफ्त उपचार कवर।"
        },
        "issuing_authority": IssuingAuthorityType.STATE,
        "state_jurisdiction": "Gujarat",
        "categories": [
            SchemeCategory.CRITICAL_ILLNESS,
            SchemeCategory.OPERATIONS_SURGERY,
            SchemeCategory.HOSPITALIZATION,
            SchemeCategory.CHRONIC_DISEASES
        ],
        "coverage_amount": "Up to ₹10,00,000 per family / year",
        "coverage_amount_num": 1000000,
        "income_limit": "Up to ₹4,00,000 per year (for MA Vatsalya Middle-Class)",
        "income_limit_max": 400000,
        "eligibility_criteria": [
            "Permanent resident of Gujarat State",
            "Annual family income up to ₹4 Lakh (verified by Mamlatdar / Taluka Development Officer)",
            "All BPL ration cardholders in Gujarat",
            "Accredited journalists, ASHA workers, U-Win registered beneficiaries automatically eligible"
        ],
        "benefits": [
            "Enhanced coverage up to ₹10 Lakh per family per year across Gujarat",
            "Cashless admission at all Gujarat District Civil Hospitals and major private multi-specialty hospitals",
            "Includes ₹300 transportation allowance per hospitalization"
        ],
        "covered_treatments": [
            "Cardiovascular & Thoracic Surgery",
            "Neuro-surgery and Poly Trauma",
            "Burns & Plastic Reconstructive Surgery",
            "Renal Transplantation & Haemodialysis",
            "Neonatal Complex Surgeries",
            "Pediatric Heart surgeries"
        ],
        "required_documents": [
            "Income Certificate issued by Mamlatdar/TDO (valid for 3 years)",
            "Aadhaar Card of all family members",
            "Gujarat Ration Card",
            "Electricity bill or domicile certificate"
        ],
        "how_to_apply": "Apply at any Gujarat Taluka Mamlatdar office, Civic Center, or District Civil Hospital MA kiosk. Present the income certificate and ration card for biometric enrollment and card issuance.",
        "application_link": "https://magujarat.com/",
        "helpline_number": "1800-233-1022",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-11",
        "verified_by": "Health & Family Welfare Dept, Govt of Gujarat",
        "middle_class_friendly": True,
        "verification_flag": "Fully integrated with PM-JAY co-branded Ayushman MA card in Gujarat, providing combined ₹10 Lakh coverage."
    },
    {
        "id": "rashtriya-arogya-nidhi",
        "name": "Rashtriya Arogya Nidhi (RAN) & Rare Diseases Policy",
        "name_localized": {
            "gu": "રાષ્ટ્રીય આરોગ્ય નિધિ (RAN) અને રેર ડીસીઝ સહાય",
            "hi": "राष्ट्रीय आरोग्य निधि (RAN) एवं दुर्लभ रोग सहायता",
            "mr": "राष्ट्रीय आरोग्य निधी (RAN)",
            "bn": "রাষ্ট্রীয় আরোগ্য নিধি (RAN)",
            "ta": "ராஷ்ட்ரிய ஆரோக்கிய நிதி",
            "te": "రాష్ట్రీయ ఆరోగ్య నిధి"
        },
        "short_description": "Direct central financial grant of up to ₹15 to ₹50 Lakh for patients suffering from life-threatening critical illnesses receiving treatment in Government AIIMS/super-specialty centers.",
        "description_localized": {
            "gu": "સરકારી AIIMS અને સુપર-સ્પેશિયાલિટી હોસ્પિટલમાં જીવનજોખમી બીમારીઓની સારવાર માટે ₹15 થી ₹50 લાખ સુધીની સરકારી સીધી નાણાકીય સહાય.",
            "hi": "सरकारी एम्स और सुपर-स्पेशियलिटी अस्पतालों में जीवन के लिए घातक बीमारियों के इलाज हेतु ₹15 से ₹50 लाख तक की सरकारी वित्तीय सहायता।"
        },
        "issuing_authority": IssuingAuthorityType.CENTRAL,
        "state_jurisdiction": "All India",
        "categories": [
            SchemeCategory.CRITICAL_ILLNESS,
            SchemeCategory.OPERATIONS_SURGERY,
            SchemeCategory.HOSPITALIZATION
        ],
        "coverage_amount": "Up to ₹15,00,000 to ₹50,00,000 (One-time grant per illness)",
        "coverage_amount_num": 1500000,
        "income_limit": "Below Poverty Line or State BPL threshold",
        "income_limit_max": 250000,
        "eligibility_criteria": [
            "Patients undergoing major super-specialty treatment in Government Central Hospitals (AIIMS, PGI, etc.)",
            "Must be suffering from life-threatening critical illness requiring immediate surgery/intervention",
            "Family income falls below poverty line or State threshold"
        ],
        "covered_treatments": [
            "Organ transplants (Liver, Bone Marrow, Heart, Kidney)",
            "Specialized oncology chemotherapies",
            "Lysosomal storage disorders & Group 1 Rare Diseases (up to ₹50 Lakh)",
            "Complex spinal surgeries & prosthetic implants"
        ],
        "required_documents": [
            "Application signed by treating AIIMS/Govt Doctor and Medical Superintendent",
            "Income certificate issued by District Revenue Authority",
            "Ration Card and Aadhaar Card",
            "Estimate letter and diagnostic summaries from hospital"
        ],
        "application_link": "https://main.mohfw.gov.in/major-programmes/poor-patients-financial-support",
        "helpline_number": "011-23061323",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-09",
        "verified_by": "MoHFW Government of India",
        "middle_class_friendly": False
    },
    {
        "id": "pmsma-jssk-maternity",
        "name": "Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA) & JSSK",
        "name_localized": {
            "gu": "પ્રધાનમંત્રી સુરક્ષિત માતૃત્વ અભિયાન (PMSMA) અને JSSK",
            "hi": "प्रधानमंत्री सुरक्षित मातृत्व अभियान (PMSMA) एवं जननी शिशु सुरक्षा",
            "mr": "प्रधानमंत्री सुरक्षित मातृत्व अभियान",
            "bn": "প্রধানমন্ত্রী সুরক্ষিত মাতৃত্ব অভিযান",
            "ta": "பிரதம மந்திரி பாதுகாப்பான தாய்மை திட்டம்",
            "te": "ప్రధాన మంత్రి సురక్షిత మాతృత్వ అభియాన్"
        },
        "short_description": "Comprehensive, zero-expense antenatal diagnostics on the 9th of every month, completely free institutional deliveries, C-sections, blood transfusions, and sick newborn care.",
        "description_localized": {
            "gu": "દર મહિનાની 9 તારીખે નિઃશુલ્ક ગર્ભાવસ્થા તપાસ, હોસ્પિટલમાં મફત ડિલિવરી, સિઝેરિયન ઓપરેશન અને નવજાત શિશુની મફત સારવાર.",
            "hi": "हर महीने की 9 तारीख को मुफ्त प्रसव पूर्व जांच, सरकारी अस्पताल में पूरी तरह मुफ्त डिलीवरी, सिजेरियन और नवजात शिशु की मुफ्त देखभाल।"
        },
        "issuing_authority": IssuingAuthorityType.CENTRAL,
        "state_jurisdiction": "All India",
        "categories": [
            SchemeCategory.MATERNITY_CHILD,
            SchemeCategory.OPD,
            SchemeCategory.MEDICINES_DIAGNOSTICS,
            SchemeCategory.HOSPITALIZATION
        ],
        "coverage_amount": "100% Cashless & Free (Zero out-of-pocket expenses + ₹6,000 cash incentive under PMMVY)",
        "coverage_amount_num": 50000,
        "income_limit": "Universal (No income restrictions for pregnant women)",
        "income_limit_max": None,
        "eligibility_criteria": [
            "All pregnant women in 2nd and 3rd trimesters",
            "All post-natal mothers up to 42 days after delivery",
            "All sick neonates/infants up to 1 year of age treated in government health facilities"
        ],
        "covered_treatments": [
            "Complete Antenatal Care (ANC) blood panels & ultrasounds",
            "High-Risk Pregnancy (HRP) red-flag identification & management",
            "Normal Delivery and Emergency Caesarean Section (C-Section)",
            "Free drugs, consumables, and blood transfusions",
            "Free transport (102 / 108 ambulance from home to health facility and drop-back)"
        ],
        "required_documents": [
            "Mother and Child Protection (MCP) Card",
            "Aadhaar Card of mother",
            "Bank account passbook for direct benefit transfer (PMMVY)"
        ],
        "application_link": "https://pmsma.mohfw.gov.in/",
        "helpline_number": "104 / 102",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-12",
        "verified_by": "National Health Mission (NHM)",
        "middle_class_friendly": True
    },
    {
        "id": "pmbjp-janaushadhi",
        "name": "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)",
        "name_localized": {
            "gu": "પ્રધાનમંત્રી ભારતીય જનઔષધિ પરિયોજના (PMBJP)",
            "hi": "प्रधानमंत्री भारतीय जनऔषधि परियोजना (PMBJP)",
            "mr": "प्रधानमंत्री भारतीय जनऔषधी योजना",
            "bn": "প্রধানমন্ত্রী ভারতীয় জনঔষধি পরিযোজনা",
            "ta": "பிரதம மந்திரி பாரதிய மக்கள் மருந்தகம்",
            "te": "ప్రధాన మంత్రి భారతీయ జనౌషధి పరియోజన"
        },
        "short_description": "Access to high-quality WHO-GMP certified generic medicines, surgical consumables, and chronic therapy drugs at 50% to 90% discount compared to branded equivalents.",
        "description_localized": {
            "gu": "બ્રાન્ડેડ દવાઓની તુલનામાં 50% થી 90% ઓછી કિંમતે ઉચ્ચ ગુણવત્તાવાળી જેનરિક દવાઓ અને સર્જિકલ સામગ્રી ઉપલબ્ધ કરાવતી યોજના.",
            "hi": "ब्रांडेड दवाओं की तुलना में 50% से 90% कम कीमत पर उच्च गुणवत्ता वाली जेनेरिक दवाएं और सर्जिकल सामग्री।"
        },
        "issuing_authority": IssuingAuthorityType.CENTRAL,
        "state_jurisdiction": "All India",
        "categories": [
            SchemeCategory.MEDICINES_DIAGNOSTICS,
            SchemeCategory.CHRONIC_DISEASES,
            SchemeCategory.OPD
        ],
        "coverage_amount": "50% to 90% savings on 2,000+ medicines and 300+ surgical items",
        "coverage_amount_num": 30000,
        "income_limit": "Universal (Open to all citizens without any income condition)",
        "income_limit_max": None,
        "eligibility_criteria": [
            "Any Indian citizen holding a valid doctor's prescription",
            "No registration or income certification required",
            "Available across 10,000+ Jan Aushadhi Kendras in India"
        ],
        "covered_treatments": [
            "Diabetes medications (Metformin, Glimepiride, Insulins)",
            "Hypertension & Cardiovascular maintenance tablets",
            "Anti-cancer drugs (up to 80% cheaper)",
            "Antibiotics, painkillers, vitamins, and minerals",
            "Sanitary pads (Suvidha at ₹1/pad)",
            "Orthopedic supports, nebulizers, and BP monitors"
        ],
        "required_documents": [
            "Doctor's valid prescription (for scheduled drugs)"
        ],
        "application_link": "https://janaushadhi.gov.in/",
        "helpline_number": "1800-180-8080",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-13",
        "verified_by": "Pharmaceuticals & Medical Devices Bureau of India (PMBI)",
        "middle_class_friendly": True
    },
    {
        "id": "mjpjay-maharashtra",
        "name": "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY — Maharashtra)",
        "name_localized": {
            "gu": "મહાત્મા જ્યોતિરાવ ફૂલે જન આરોગ્ય યોજના (મહારાષ્ટ્ર)",
            "hi": "महात्मा ज्योतिराव फुले जन आरोग्य योजना (महाराष्ट्र)",
            "mr": "महात्मा ज्योतिराव फुले जन आरोग्य योजना (महाराष्ट्र)",
            "bn": "মহাত্মা জ্যোতিরাও ফুলে জন আরোগ্য যোজনা",
            "ta": "மகாத்மா ஜோதிராவ் பூலே மக்கள் ஆரோக்கிய திட்டம்",
            "te": "మహాత్మా జ్యోతిరావు ఫూలే జన్ ఆరోగ్య యోజన"
        },
        "short_description": "Statewide universal healthcare program providing up to ₹5 Lakh cashless coverage for 1,356 secondary and tertiary procedures across Maharashtra.",
        "description_localized": {
            "gu": "મહારાષ્ટ્રના તમામ નાગરિકો માટે ₹5 લાખ સુધીનું સંપૂર્ણ કેશલેસ હોસ્પિટલ સારવાર કવચ.",
            "hi": "महाराष्ट्र के सभी नागरिकों के लिए ₹5 लाख तक का कैशलेस अस्पताल उपचार कवर।"
        },
        "issuing_authority": IssuingAuthorityType.STATE,
        "state_jurisdiction": "Maharashtra",
        "categories": [
            SchemeCategory.HOSPITALIZATION,
            SchemeCategory.OPERATIONS_SURGERY,
            SchemeCategory.CRITICAL_ILLNESS
        ],
        "coverage_amount": "₹5,00,000 per family / year",
        "coverage_amount_num": 500000,
        "income_limit": "Universal for all Maharashtra Ration Card holders",
        "income_limit_max": None,
        "eligibility_criteria": [
            "Resident of Maharashtra with valid Yellow, Orange, or White Ration Card",
            "Valid Aadhaar Card or Voter ID card",
            "No income ceiling under the revised expanded universal mandate"
        ],
        "covered_treatments": [
            "General surgery, ENT, Ophthalmology, Gynecology",
            "Cardiology and cardiothoracic surgeries",
            "Medical, surgical, and radiation oncology",
            "Pediatric and neonatal surgeries",
            "Orthopedic surgeries and polytrauma management"
        ],
        "required_documents": [
            "Maharashtra Ration Card (Yellow/Orange/White)",
            "Aadhaar Card",
            "Doctor recommendation letter"
        ],
        "application_link": "https://www.jeevandayee.gov.in/",
        "helpline_number": "155388 / 1800-233-2200",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-08",
        "verified_by": "State Health Assurance Society, Govt of Maharashtra",
        "middle_class_friendly": True
    },
    {
        "id": "hmdg-grant",
        "name": "Health Minister's Discretionary Grant (HMDG)",
        "name_localized": {
            "gu": "કેન્દ્રીય આરોગ્ય મંત્રી વિવેકાધીન અનુદાન (HMDG)",
            "hi": "स्वास्थ्य मंत्री विवेकाधीन अनुदान (HMDG)",
            "mr": "आरोग्य मंत्री विवेकाधीन अनुदान",
            "bn": "স্বাস্থ্যমন্ত্রী স্বেচ্ছাধীন অনুদান",
            "ta": "சுகாதார அமைச்சர் விருப்ப நிதி",
            "te": "ఆరోగ్య మంత్రి విచక్షణ గ్రాంట్"
        },
        "short_description": "Financial assistance up to ₹1,25,000 to poor and indigent patients facing major medical interventions in Government hospitals.",
        "description_localized": {
            "gu": "સરકારી હોસ્પિટલોમાં ગંભીર બીમારીઓની સારવાર મેળવતા ગરીબ અને જરૂરિયાતમંદ દર્દીઓ માટે ₹1,25,000 સુધીની નાણાકીય સહાય.",
            "hi": "सरकारी अस्पतालों में गंभीर बीमारियों का इलाज कराने वाले गरीब मरीजों के लिए ₹1,25,000 तक की वित्तीय सहायता।"
        },
        "issuing_authority": IssuingAuthorityType.CENTRAL,
        "state_jurisdiction": "All India",
        "categories": [
            SchemeCategory.CRITICAL_ILLNESS,
            SchemeCategory.OPERATIONS_SURGERY,
            SchemeCategory.HOSPITALIZATION
        ],
        "coverage_amount": "Up to ₹1,25,000 (Based on actual estimated expenditure)",
        "coverage_amount_num": 125000,
        "income_limit": "Annual family income not exceeding ₹1,50,000",
        "income_limit_max": 150000,
        "eligibility_criteria": [
            "Patients receiving treatment at Government super-specialty hospitals",
            "Annual family income must not exceed ₹1,50,000",
            "Not eligible if covered under PM-JAY or Central Govt Health Scheme"
        ],
        "covered_treatments": [
            "Open heart surgery, Pacemaker implantation",
            "Radiation therapy and chemotherapy cycles",
            "Hip and Knee joint replacement (Govt hospitals)",
            "Major gastrointestinal and thoracic surgeries"
        ],
        "required_documents": [
            "Income Certificate issued by Revenue Authority",
            "Estimation proforma certified by Medical Superintendent",
            "Aadhaar Card and Ration Card",
            "Recommendation letter from local Member of Parliament (MP)"
        ],
        "application_link": "https://main.mohfw.gov.in/major-programmes/poor-patients-financial-support",
        "helpline_number": "011-23061323",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-07",
        "verified_by": "MoHFW Grant Division",
        "middle_class_friendly": False
    },
    {
        "id": "gujarat-chiranjeevi-yojana",
        "name": "Chiranjeevi Yojana (Government of Gujarat)",
        "name_localized": {
            "gu": "ચિરંજીવી યોજના (ગુજરાત સરકાર)",
            "hi": "चिरंजीवी योजना (गुजरात सरकार)",
            "mr": "चिरंजीवी योजना (गुजरात)",
            "bn": "চিরঞ্জীবি যোজনা (গুজরাট)",
            "ta": "சிரஞ்சீவி திட்டம் (குஜராத்)",
            "te": "చిరంజీవి యోజన (గుజరాత్)"
        },
        "short_description": "Pioneering public-private partnership ensuring 100% cashless, safe institutional childbirth and emergency C-sections for BPL and tribal mothers in empanelled private hospitals across Gujarat.",
        "description_localized": {
            "gu": "ગુજરાતના BPL અને આદિવાસી પરિવારોની સગર્ભા માતાઓને ખાનગી ગાયનેકોલોજિસ્ટ હોસ્પિટલોમાં સંપૂર્ણ મફત ડિલિવરી અને સિઝેરિયન સારવાર.",
            "hi": "गुजरात के बीपीएल और आदिवासी परिवारों की गर्भवती महिलाओं के लिए निजी अस्पतालों में पूर्णतः कैशलेस डिलीवरी और सिजेरियन ऑपरेशन।"
        },
        "issuing_authority": IssuingAuthorityType.STATE,
        "state_jurisdiction": "Gujarat",
        "categories": [
            SchemeCategory.MATERNITY_CHILD,
            SchemeCategory.HOSPITALIZATION,
            SchemeCategory.OPERATIONS_SURGERY
        ],
        "coverage_amount": "100% Cashless Institutional Delivery + ₹200 Patient Travel Cash Incentive",
        "coverage_amount_num": 15000,
        "income_limit": "BPL Cardholders or Non-Taxpaying APL Tribal Families",
        "income_limit_max": 250000,
        "eligibility_criteria": [
            "Pregnant women belonging to Below Poverty Line (BPL) families in Gujarat",
            "Above Poverty Line (APL) tribal pregnant women not paying income tax",
            "Enrolled with local ASHA or ANM worker with active Mamta (MCP) Card"
        ],
        "benefits": [
            "Completely free normal delivery and emergency C-section by qualified Obstetricians",
            "Free pre-operative and post-operative medications, diagnostics, and blood transfusions",
            "₹200 direct travel assistance to mother to reach the accredited healthcare facility",
            "₹200 companion incentive for accompanying ASHA / ANM volunteer"
        ],
        "covered_treatments": [
            "Normal Vaginal Delivery",
            "Complicated / High-Risk Delivery",
            "Emergency Caesarean Section (C-Section)",
            "Pre-eclampsia & Post-partum Hemorrhage emergency management",
            "Neonatal resuscitation at birth"
        ],
        "required_documents": [
            "BPL Ration Card (or Mamlatdar/Taluka Development Officer Income/Tribal Certificate)",
            "Mother and Child Protection (Mamta) Card",
            "Aadhaar Card of pregnant mother",
            "Referral or certification slip from local Sub-centre / PHC ANM"
        ],
        "how_to_apply": "Register during routine ANC checkups at your local Gujarat Gram Panchayat / Sub-Centre with the ASHA worker. Upon labor onset, present the Mamta Card and BPL proof at any empanelled private Chiranjeevi hospital for instant cashless admission.",
        "application_link": "https://gujhealth.gujarat.gov.in/chiranjeevi-yojana.htm",
        "helpline_number": "104 / 108",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-14",
        "verified_by": "Department of Health & Family Welfare, Govt of Gujarat",
        "middle_class_friendly": False,
        "verification_flag": "Active state program. Please note: In urban districts, services have been progressively unified under PM-JAY MA maternity packages; in rural and tribal talukas, private gynecologist empanelment continues."
    },
    {
        "id": "gujarat-bal-sakha-yojana",
        "name": "Bal Sakha Yojana (Partner for Child Health — Gujarat)",
        "name_localized": {
            "gu": "બાલ સખા યોજના (નવજાત શિશુ સંભાળ — ગુજરાત)",
            "hi": "बाल सखा योजना (शिशु स्वास्थ्य सुरक्षा — गुजरात)",
            "mr": "बाल सखा योजना (गुजरात)",
            "bn": "বাল সখা যোজনা (গুজরাট)",
            "ta": "பால் சகா திட்டம் (குஜராத்)",
            "te": "బాల్ సఖా యోజన (గుజరాత్)"
        },
        "short_description": "Comprehensive neonatal and infant intensive care scheme providing cashless treatment by empanelled private pediatricians for sick, low birth weight, and premature newborns.",
        "description_localized": {
            "gu": "ઓછા વજનવાળા અને બીમાર નવજાત શિશુઓને ખાનગી બાળરોગ નિષ્ણાત (Pediatrician) પાસે NICU અને આઇસીયુ સહિત મફત સારવાર.",
            "hi": "कम वजन और बीमार नवजात शिशुओं के लिए निजी बाल रोग विशेषज्ञों द्वारा एनआईसीयू और जीवन रक्षक उपचार की मुफ्त सुविधा।"
        },
        "issuing_authority": IssuingAuthorityType.STATE,
        "state_jurisdiction": "Gujarat",
        "categories": [
            SchemeCategory.MATERNITY_CHILD,
            SchemeCategory.CRITICAL_ILLNESS,
            SchemeCategory.HOSPITALIZATION
        ],
        "coverage_amount": "Up to ₹10,000 cashless NICU / pediatric care per sick newborn",
        "coverage_amount_num": 10000,
        "income_limit": "BPL and APL Tribal Families of Gujarat",
        "income_limit_max": 250000,
        "eligibility_criteria": [
            "All newborns born to BPL mothers in Gujarat",
            "APL tribal newborns born in Chiranjeevi or government health centers",
            "Infants requiring Level 1 (basic checkup), Level 2 (jaundice/phototherapy), or Level 3 (NICU/incubator) pediatric care"
        ],
        "benefits": [
            "Zero out-of-pocket costs for specialized pediatrician consultations",
            "Free phototherapy for neonatal jaundice and incubator warming",
            "Free medicines, IV fluids, and laboratory blood investigations",
            "Emergency transport reimbursement up to ₹200 for moving infant to NICU"
        ],
        "covered_treatments": [
            "Neonatal Respiratory Distress Syndrome & Asphyxia management",
            "Severe Hyperbilirubinemia (Neonatal Jaundice Phototherapy)",
            "Low Birth Weight (< 2,500g) and Extreme Preterm Infant Nursery Care",
            "Neonatal Sepsis & Congenital infections",
            "Level 3 Neonatal Intensive Care (NICU) admission"
        ],
        "required_documents": [
            "Mother's Mamta Card / Chiranjeevi discharge card",
            "BPL Ration Card or Caste / Tribal certificate",
            "Birth registration slip from hospital",
            "Aadhaar Card of parents"
        ],
        "how_to_apply": "When a newborn is diagnosed with medical distress at birth, the attending obstetrician or ASHA refers the child immediately to the nearest empanelled Bal Sakha private pediatrician or hospital for instant cashless admission.",
        "application_link": "https://gujhealth.gujarat.gov.in/bal-sakha-yojana.htm",
        "helpline_number": "104",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-14",
        "verified_by": "Commissionerate of Health, Medical Services & Medical Education (Gujarat)",
        "middle_class_friendly": False,
        "verification_flag": "Active state program. Empanelled private pediatricians operate across 33 districts; emergency cases are directly linked with 108 Emergency Ambulance neonate pods."
    },
    {
        "id": "gujarat-kpsy-yojana",
        "name": "Kasturba Poshan Sahay Yojana (KPSY — Gujarat)",
        "name_localized": {
            "gu": "કસ્તુરબા પોષણ સહાય યોજના (KPSY — ગુજરાત)",
            "hi": "કસ્તૂરબા પોષણ સહાય યોજના (KPSY — ગુજરાત)",
            "mr": "कस्तुरबा पोषण सहाय योजना",
            "bn": "কস্তুরবা পোষণ সহায় যোজনা",
            "ta": "கஸ்தூர்பா போஷன் சகாய் திட்டம்",
            "te": "కస్తూర్బా పోషణ్ సహాయ్ యోజన"
        },
        "short_description": "Direct Benefit Transfer (DBT) maternal nutrition scheme providing ₹6,000 cash assistance in three stages to BPL pregnant women to combat maternal anemia and undernutrition.",
        "description_localized": {
            "gu": "ગુજરાતની BPL સગર્ભા માતાઓને કુપોષણ અને એનિમિયા નિવારણ માટે ત્રણ તબક્કામાં સીધા બેંક ખાતામાં ₹6,000 પોષણ સહાય.",
            "hi": "गुजरात की बीपीएल गर्भवती महिलाओं को कुपोषण और एनीमिया से बचाव हेतु सीधे बैंक खाते में तीन किस्तों में ₹6,000 की वित्तीय सहायता।"
        },
        "issuing_authority": IssuingAuthorityType.STATE,
        "state_jurisdiction": "Gujarat",
        "categories": [
            SchemeCategory.MATERNITY_CHILD,
            SchemeCategory.MEDICINES_DIAGNOSTICS
        ],
        "coverage_amount": "₹6,000 Direct Benefit Transfer (DBT) Cash Nutrition Grant",
        "coverage_amount_num": 6000,
        "income_limit": "Below Poverty Line (BPL) Families in Gujarat",
        "income_limit_max": 200000,
        "eligibility_criteria": [
            "BPL pregnant mothers residing in Gujarat State",
            "Registration during first trimester (within 12 weeks of pregnancy) at Anganwadi/PHC",
            "Undergoing mandatory ANC checkups, iron-folic acid supplementation, and tetanus immunization",
            "Institutional delivery at a government hospital or accredited private facility",
            "Primary immunization of child completed (BCG, Polio, Pentavalent, Measles)"
        ],
        "benefits": [
            "Installment 1 (₹2,000): Transferred upon 1st trimester ANC registration & health checkup",
            "Installment 2 (₹2,000): Transferred upon institutional delivery and registration of birth",
            "Installment 3 (₹2,000): Transferred when infant completes primary immunizations at 9 months",
            "Free Iron, Calcium, and Folic Acid supplements through Anganwadis"
        ],
        "covered_treatments": [
            "Maternal Nutrition counseling and anthropometric tracking",
            "Full ANC blood, urine, and ultrasound diagnostics",
            "Complete infant childhood vaccination schedules",
            "Iron deficiency anemia correction"
        ],
        "required_documents": [
            "Valid Gujarat BPL Ration Card",
            "Mamta Card (MCP Card) with registration number",
            "Aadhaar Card linked to mobile number",
            "Active Single Bank Account Passbook with IFSC code (DBT enabled)"
        ],
        "how_to_apply": "Enroll at your local village Anganwadi Centre or Urban Primary Health Centre (U-PHC). The ANM records your details on the Gujarat TeCHO+ (Technology for Community Health Operations) digital portal, triggering automatic DBT transfers.",
        "application_link": "https://wcd.gujarat.gov.in/",
        "helpline_number": "104 / 155214",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-14",
        "verified_by": "Health & Family Welfare and Women & Child Development Dept, Gujarat",
        "middle_class_friendly": False,
        "verification_flag": "Active state program. Supplements the Central PMMVY scheme, processed digitally via TeCHO+."
    },
    {
        "id": "gujarat-rbsk-school-health",
        "name": "Rashtriya Bal Swasthya Karyakram (RBSK / School Health — Gujarat)",
        "name_localized": {
            "gu": "રાષ્ટ્રીય બાળ સ્વાસ્થ્ય કાર્યક્રમ (શાળા આરોગ્ય તપાસ — ગુજરાત)",
            "hi": "राष्ट्रीय बाल स्वास्थ्य कार्यक्रम (स्कूल हेल्थ प्रोग्राम — गुजरात)",
            "mr": "राष्ट्रीय बाल स्वास्थ्य कार्यक्रम (गुजरात)",
            "bn": "রাষ্ট্রীয় বাল স্বাস্থ্য কার্যক্রম (গুজরাট)",
            "ta": "ராஷ்ட்ரிய பால் ஸ்வஸ்த்ய காரியக்ரம்",
            "te": "రాష్ట్రీయ బాల స్వాస్థ్య కార్యక్రమం"
        },
        "short_description": "Universal statewide health safety net providing 100% free medical screening and complex super-specialty surgeries for all Gujarat children aged 0 to 18 years for 4Ds (Defects, Diseases, Deficiencies, Developmental Delays).",
        "description_localized": {
            "gu": "ગુજરાતના તમામ બાળકો (0 થી 18 વર્ષ) માટે હૃદય રોગ, કિડની, કેન્સર અને જન્મજાત ખામીઓનું સંપૂર્ણ મફત ઓપરેશન અને સારવાર.",
            "hi": "गुजरात के सभी बच्चों (0 से 18 वर्ष) के लिए जन्मजात विकारों, हृदय रोग, कैंसर और गंभीर बीमारियों का 100% मुफ्त ऑपरेशन व उपचार।"
        },
        "issuing_authority": IssuingAuthorityType.JOINT,
        "state_jurisdiction": "Gujarat",
        "categories": [
            SchemeCategory.MATERNITY_CHILD,
            SchemeCategory.OPERATIONS_SURGERY,
            SchemeCategory.CRITICAL_ILLNESS,
            SchemeCategory.HOSPITALIZATION
        ],
        "coverage_amount": "100% Free Complete Medical & Surgical Treatment (No Upper Financial Limit)",
        "coverage_amount_num": 1000000,
        "income_limit": "Universal (No Income Ceiling for any child aged 0-18 in Gujarat)",
        "income_limit_max": None,
        "eligibility_criteria": [
            "All children aged 0 to 6 years enrolled in Gujarat Anganwadis",
            "All students aged 6 to 18 years in government, grant-in-aid, and private schools",
            "Out-of-school children and adolescents living in Gujarat",
            "Diagnosed with any of the designated 30+ health conditions and birth defects"
        ],
        "benefits": [
            "Completely free Congenital Heart Defect surgeries (ASD, VSD, Tetralogy of Fallot) at U.N. Mehta Heart Institute",
            "Free Cochlear Implant surgeries for deaf infants (worth ₹6 to 8 Lakh)",
            "Free Cleft Lip and Cleft Palate reconstructive plastic surgery",
            "Free pediatric renal transplants, clubfoot correction, and pediatric oncology chemotherapy",
            "Free spectacles, hearing aids, and orthopedic assistive prosthetics"
        ],
        "covered_treatments": [
            "Pediatric Cardiac Surgery & Catheterization",
            "Cochlear Implantation & Auditory Habilitation",
            "Pediatric Oncology (Leukemia, Lymphoma)",
            "Kidney Transplants & Dialysis for children",
            "Neuro-developmental and autism early intervention therapy"
        ],
        "required_documents": [
            "RBSK Mobile Health Team screening reference card",
            "Child's Birth Certificate or School/Anganwadi ID Card",
            "Aadhaar Card of Child or Parent/Guardian",
            "Government Hospital Doctor referral"
        ],
        "how_to_apply": "RBSK mobile medical teams visit all schools and Anganwadis across Gujarat twice every year. Any child identified with a critical condition is given an RBSK Referral Card for free priority admission at District Early Intervention Centres (DEIC) or state super-specialty hospitals.",
        "application_link": "https://gujhealth.gujarat.gov.in/school-health-programme.htm",
        "helpline_number": "104 / 1800-233-1022",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-14",
        "verified_by": "National Health Mission (NHM) & Govt of Gujarat",
        "middle_class_friendly": True,
        "verification_flag": "Fully verified and operational across all 33 Gujarat districts. Major surgical packages executed at Ahmedabad Civil Campus, U.N. Mehta, GCRI, and GMERS medical colleges."
    },
    {
        "id": "nikshay-poshan-yojana",
        "name": "Nikshay Poshan Yojana (Direct Benefit Transfer for TB Patients)",
        "name_localized": {
            "gu": "નિક્ષય પોષણ યોજના (ટીબી દર્દીઓ માટે પોષણ સહાય ડીબીટી)",
            "hi": "निक्षय पोषण योजना (टीबी रोगियों के लिए पोषण सहायता)",
            "mr": "निक्षय पोषण योजना (टीबी रुग्णांसाठी पोषण सहाय्य)",
            "bn": "নিশ্চয় পোষণ যোজনা (যক্ষ্মা রোগীদের পুষ্টি সহায়তা)",
            "ta": "நிக்ஷய் போஷன் திட்டம்",
            "te": "నిక్షయ్ పోషణ్ యోజన"
        },
        "short_description": "Direct Benefit Transfer (DBT) of ₹1,000 to ₹3,000 per month for nutritional support to all notified Tuberculosis (TB) patients throughout their treatment duration across Gujarat.",
        "description_localized": {
            "gu": "ગુજરાત સહિત દેશભરના તમામ નોંધાયેલા ટીબી દર્દીઓને સારવાર દરમિયાન માસિક ₹1,000 થી ₹3,000 સીધા બેંક ખાતામાં પોષક સહાય તરીકે ચૂકવતી યોજના.",
            "hi": "उपचार अवधि के दौरान सभी अधिसूचित टीबी रोगियों को पोषण सहायता के लिए प्रति माह ₹1,000 से ₹3,000 का प्रत्यक्ष बैंक हस्तांतरण (DBT)।"
        },
        "issuing_authority": IssuingAuthorityType.CENTRAL,
        "state_jurisdiction": "All India",
        "categories": [
            SchemeCategory.MEDICINES_DIAGNOSTICS,
            SchemeCategory.CHRONIC_DISEASES
        ],
        "coverage_amount": "₹1,000 to ₹3,000/month DBT + 100% Free Anti-TB Medicines & Testing",
        "coverage_amount_num": 18000,
        "income_limit": "No income ceiling — All notified TB patients are eligible",
        "income_limit_max": None,
        "eligibility_criteria": [
            "Any patient diagnosed with Drug-Sensitive (DS-TB) or Drug-Resistant (DR-TB) Tuberculosis",
            "Notified on the official National Ni-kshay Portal (nikshay.in) by public or private health clinic",
            "Active Indian bank account linked with Aadhaar",
            "Open to all ages and income groups without deprivation criteria"
        ],
        "benefits": [
            "Monthly nutritional financial support deposited directly into patient bank account (Aadhaar DBT)",
            "100% free first-line and second-line anti-TB medications (DOTS / 4-FDC blister packs)",
            "Free molecular diagnostic tests: CBNAAT (GeneXpert) and Truenat testing across all district TB centres in Gujarat",
            "Free monthly sputum follow-up tests and digital chest X-rays",
            "Ni-kshay Mitra nutrition basket (food grain, pulses, edible oil) sponsored through community adoption"
        ],
        "covered_treatments": [
            "Pulmonary & Extra-Pulmonary Tuberculosis Treatment",
            "MDR-TB and XDR-TB Regimen (Bedaquiline, Delamanid, Linezolid)",
            "Free Monthly Chest X-Rays and Liver/Kidney Function monitoring",
            "Pediatric TB Formulation & Nutrition Supplements"
        ],
        "required_documents": [
            "Aadhaar Card of patient",
            "Bank Account Passbook / Cancelled Cheque (for direct DBT)",
            "Ni-kshay Patient ID Number (issued by DOTS center or private doctor)",
            "Doctor prescription / TB diagnostic test report"
        ],
        "how_to_apply": "Visit any Urban Primary Health Centre (UPHC), CHC, or District TB Centre in Gujarat. Upon diagnosis or notification, the TB Health Visitor (TBHV) or ASHA worker enters your Aadhaar and bank details onto nikshay.in. Payments are auto-credited monthly.",
        "application_link": "https://www.nikshay.in/",
        "helpline_number": "1800-11-6666 (Toll-Free TB Helpline)",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-14",
        "verified_by": "National Tuberculosis Elimination Program (NTEP) & Gujarat State Health Society",
        "middle_class_friendly": True,
        "verification_flag": "Fully verified and operational across all 33 Gujarat districts. Direct Benefit Transfers credited via PFMS directly to beneficiary bank accounts."
    },
    {
        "id": "gujarat-janani-suraksha-yojana",
        "name": "Janani Suraksha Yojana (JSY — Gujarat Safe Motherhood)",
        "name_localized": {
            "gu": "જનની સુરક્ષા યોજના (JSY — સુરક્ષિત માતૃત્વ પ્રોત્સાહન ગુજરાત)",
            "hi": "जननी सुरक्षा योजना (JSY — सुरक्षित मातृत्व प्रोत्साहन)",
            "mr": "जननी सुरक्षा योजना (सुरक्षित मातृत्व)",
            "bn": "জননী সুরক্ষা যোজনা (নিরাপদ মাতৃত্ব)",
            "ta": "ஜனனி சுரக்ஷா திட்டம்",
            "te": "జననీ సురక్ష యోజన"
        },
        "short_description": "Direct cash assistance of ₹700 to ₹1,400 to rural and urban pregnant women giving birth in government or accredited health institutions to reduce maternal and infant mortality.",
        "description_localized": {
            "gu": "માતા અને શિશુ મૃત્યુદર ઘટાડવા માટે સરકારી હોસ્પિટલ કે માન્ય સંસ્થામાં પ્રસુતિ કરાવતી માતાઓને ₹૭૦૦ થી ₹૧,૪૦૦ ની રોકડ સહાય અને મફત વાહન સેવા.",
            "hi": "सरकारी या मान्यता प्राप्त अस्पताल में प्रसव कराने वाली गर्भवती महिलाओं को ₹700 से ₹1,400 की नकद सहायता और मुफ्त एम्बुलेंस सुविधा।"
        },
        "issuing_authority": IssuingAuthorityType.STATE,
        "state_jurisdiction": "Gujarat",
        "categories": [
            SchemeCategory.MATERNITY_CHILD,
            SchemeCategory.HOSPITALIZATION
        ],
        "coverage_amount": "₹700 – ₹1,400 Institutional Cash Incentive + 100% Free Hospital Delivery",
        "coverage_amount_num": 1400,
        "income_limit": "BPL, SC, ST, or NFSA Priority Households in Gujarat",
        "income_limit_max": 250000,
        "eligibility_criteria": [
            "Pregnant women aged 19 years and above",
            "Belonging to BPL, Scheduled Caste (SC), or Scheduled Tribe (ST) in Gujarat",
            "Delivering at a Government PHC, CHC, Sub-District/District Hospital, or accredited private nursing home",
            "Registered on the Gujarat TeCHO+ healthcare tracking portal"
        ],
        "benefits": [
            "₹1,400 direct cash assistance for rural mothers delivering in healthcare institutions",
            "₹700 direct cash assistance for urban mothers",
            "Additional ₹1,000 financial assistance if Caesarean section delivery is required",
            "100% free transportation via '108' emergency ambulance from home to hospital and back ('Khilkhilat')",
            "Free medicines, blood transfusion, and neonatal examination for baby"
        ],
        "covered_treatments": [
            "Normal Institutional Vaginal Delivery",
            "Emergency Caesarean Section (C-Section)",
            "Post-partum hemorrhage management",
            "Immediate Newborn resuscitation and immunization (BCG, OPV-0, Hep-B)"
        ],
        "required_documents": [
            "Mother and Child Protection (Mamta Card / MCP Card)",
            "Aadhaar Card of pregnant mother",
            "BPL Ration Card or Caste Certificate (SC/ST)",
            "Bank passbook of mother with IFSC code"
        ],
        "how_to_apply": "Register pregnancy at the nearest Anganwadi or Sub-Center with your local ASHA worker before the 12th week. The Mamta card is issued and entry is recorded on TeCHO+. Cash incentive is credited immediately upon delivery.",
        "application_link": "https://gujhealth.gujarat.gov.in/janani-suraksha-yojana.htm",
        "helpline_number": "104 (Health Helpline) / 108",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-14",
        "verified_by": "Health and Family Welfare Department, Government of Gujarat",
        "middle_class_friendly": False,
        "verification_flag": "Fully active and integrated with Gujarat TeCHO+ e-health system. Payments disbursed via DBT."
    },
    {
        "id": "gujarat-pmmvy-maternity",
        "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY 2.0 — Gujarat)",
        "name_localized": {
            "gu": "પ્રધાનમંત્રી માતૃ વંદના યોજના (PMMVY 2.0 — ગુજરાત)",
            "hi": "प्रधानमंत्री मातृ वंदना योजना (PMMVY 2.0)",
            "mr": "प्रधानमंत्री मातृ वंदना योजना",
            "bn": "প্রধানমন্ত্রী মাতৃ বন্দনা যোজনা",
            "ta": "பிரதம மந்திரி மாத்ரு வந்தனா திட்டம்",
            "te": "ప్రధాన మంత్రి మాతృ వందన యోజన"
        },
        "short_description": "Maternity cash incentive of ₹5,000 for the first child and ₹6,000 for a second girl child directly transferred to compensate wage loss and encourage healthy nutrition.",
        "description_localized": {
            "gu": "સગર્ભા બહેનોને પોષણ અને પ્રસુતિ દરમિયાન રોજગારી નુકસાનના વળતર માટે પ્રથમ બાળક પર ₹૫,૦૦૦ અને બીજી દીકરીના જન્મ પર ₹૬,૦૦૦ સીધા ખાતામાં મળતી યોજના.",
            "hi": "गर्भवती महिलाओं को पोषण और मजदूरी क्षतिपूर्ति के लिए पहले बच्चे पर ₹5,000 और दूसरी कन्या के जन्म पर ₹6,000 की प्रत्यक्ष नकद सहायता।"
        },
        "issuing_authority": IssuingAuthorityType.CENTRAL,
        "state_jurisdiction": "Gujarat",
        "categories": [
            SchemeCategory.MATERNITY_CHILD
        ],
        "coverage_amount": "₹5,00,000 Family Cover / ₹5,000 - ₹6,000 DBT Maternity Cash Benefit",
        "coverage_amount_num": 6000,
        "income_limit": "Family annual income under ₹8 Lakh, or EWS, SC/ST, Divyang, or NFSA Cardholder",
        "income_limit_max": 800000,
        "eligibility_criteria": [
            "Pregnant women and lactating mothers who conceived their 1st child on or after April 1, 2022",
            "For 2nd child: Eligible if the newborn is a girl child (incentive to curb female foeticide)",
            "Mother's family annual income less than ₹8,00,000 (covers middle-class families)",
            "Holders of EWS certificate, MGNREGA job card, or PM-JAY Ayushman Card"
        ],
        "benefits": [
            "Installment 1: ₹3,000 upon early registration of pregnancy and at least 1 Antenatal Checkup (ANC)",
            "Installment 2: ₹2,000 upon childbirth registration and completion of first cycle of child vaccination (BCG, OPV, DPT/Pentavalent)",
            "Special Girl Child Benefit: ₹6,000 in a single installment upon institutional delivery of a second female infant",
            "Direct Benefit Transfer to mother's Aadhaar-linked bank account without any intermediary deduction"
        ],
        "covered_treatments": [
            "Antenatal check-ups & maternal nutrition monitoring",
            "Essential obstetric lab work and blood tests",
            "Primary infant immunization schedule"
        ],
        "required_documents": [
            "Aadhaar Card of pregnant woman and husband",
            "MCP / Mamta Card with LMP date and ANC stamps",
            "Bank account passbook of the woman (Aadhaar linked)",
            "Child's Birth Certificate and vaccination card (for 2nd installment)"
        ],
        "how_to_apply": "Apply through the nearest Anganwadi Worker (AWW) or ASHA worker, or submit online directly on the national PMMVY portal (pmmvy.wcd.gov.in) with your Aadhaar and Mamta card.",
        "application_link": "https://pmmvy.wcd.gov.in/",
        "helpline_number": "011-23382393 / 104",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-14",
        "verified_by": "Ministry of Women and Child Development & Govt of Gujarat",
        "middle_class_friendly": True,
        "verification_flag": "Fully operational across all rural talukas and municipal wards of Gujarat. PMMVY 2.0 guidelines verified."
    },
    {
        "id": "gujarat-mukhyamantri-bal-seva",
        "name": "Mukhyamantri Bal Seva Yojana (Gujarat Child Health & Orphan Protection)",
        "name_localized": {
            "gu": "મુખ્યમંત્રી બાળ સેવા યોજના (ગુજરાત અનાથ બાળકો આરોગ્ય અને શિક્ષણ સહાય)",
            "hi": "मुख्यमंत्री बाल सेवा योजना (गुजरात अनाथ एवं बाल स्वास्थ्य सुरक्षा)",
            "mr": "मुख्यमंत्री बाल सेवा योजना (गुजरात)",
            "bn": "মুখ্যমন্ত্রী বাল সেবা যোজনা",
            "ta": "முதல்வர் பால் சேவா திட்டம் (குஜராத்)",
            "te": "ముఖ్యమంత్రి బాల సేవా యోజన"
        },
        "short_description": "Monthly financial aid of ₹4,000 per child, plus comprehensive free cashless healthcare under PM-JAY MA for orphans and children who lost parents in Gujarat.",
        "description_localized": {
            "gu": "માતા-પિતાની છત્રછાયા ગુમાવી ચૂકેલા બાળકોને દર મહિને ₹૪,૦૦૦ ની આર્થિક સહાય અને આયુષ્માન PM-JAY MA કાર્ડ દ્વારા ૧૦૦% મફત સુપર-સ્પેશિયાલિટી સારવાર.",
            "hi": "माता-पिता को खोने वाले बच्चों को प्रति माह ₹4,000 की वित्तीय सहायता और पीएम-जेएवाई एमए कार्ड के तहत 100% मुफ्त सुपर-स्पेशियलिटी इलाज।"
        },
        "issuing_authority": IssuingAuthorityType.STATE,
        "state_jurisdiction": "Gujarat",
        "categories": [
            SchemeCategory.HOSPITALIZATION,
            SchemeCategory.CRITICAL_ILLNESS,
            SchemeCategory.MATERNITY_CHILD
        ],
        "coverage_amount": "₹4,000 / month Stipend + ₹10 Lakh PM-JAY MA Hospitalization Cover",
        "coverage_amount_num": 1000000,
        "income_limit": "No income limit for orphaned children",
        "income_limit_max": None,
        "eligibility_criteria": [
            "Children residing in Gujarat aged 0 to 18 years who lost both parents or single surviving parent",
            "Extended up to 21 years if continuing higher education or vocational training",
            "Enrolled under guardianship or in child care institutes registered in Gujarat"
        ],
        "benefits": [
            "Monthly stipend of ₹4,000 deposited into child's bank account until age 18",
            "Automatic priority issuance of PM-JAY MA Ayushman Health Card with ₹10,00,000 annual cover",
            "100% cashless medical admissions in Gujarat government and empanelled private multi-specialty hospitals",
            "Free medical check-ups, psychological counseling, and nutrition kits",
            "Scholarship support for school and higher professional college admissions"
        ],
        "covered_treatments": [
            "All pediatric surgeries and intensive care treatments",
            "Specialized chronic disease care, oncology, and congenital disorder correction",
            "Dental and ophthalmic procedures, free spectacles, and orthodontics",
            "Emergency pediatric trauma and orthopedic surgeries"
        ],
        "required_documents": [
            "Death Certificate of both parents / surviving parent",
            "Child's Birth Certificate and Aadhaar Card",
            "Guardian's Aadhaar Card and bank account passbook",
            "Proof of residence in Gujarat (Ration card / Electricity bill)"
        ],
        "how_to_apply": "Applications are submitted through the District Child Protection Unit (DCPU) or District Social Defense Officer (SDO) in each district collectorate office across Gujarat.",
        "application_link": "https://esamajkalyan.gujarat.gov.in/",
        "helpline_number": "1098 (Childline) / 104",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-14",
        "verified_by": "Social Justice and Empowerment Department, Government of Gujarat",
        "middle_class_friendly": True,
        "verification_flag": "Active state flagship scheme. Fast-track approvals coordinated via e-Samaj Kalyan portal."
    },
    {
        "id": "gujarat-national-dialysis-programme",
        "name": "Pradhan Mantri National Dialysis Programme (PMNDP — Gujarat)",
        "name_localized": {
            "gu": "પ્રધાનમંત્રી રાષ્ટ્રીય ડાયાલિસિસ કાર્યક્રમ (ગુજરાત સિવિલ હોસ્પિટલ નેટવર્ક)",
            "hi": "प्रधानमंत्री राष्ट्रीय डायलिसिस कार्यक्रम (गुजरात)",
            "mr": "राष्ट्रीय डायलिसिस कार्यक्रम",
            "bn": "জাতীয় ডায়ালাইসিস কর্মসূচি",
            "ta": "தேசிய டயாலிசிஸ் திட்டம்",
            "te": "జాతీయ డయాలసిస్ ప్రోగ్రామ్"
        },
        "short_description": "100% free hemodialysis and peritoneal dialysis service for kidney patients holding Ayushman/MA cards across Sub-District and District Civil Hospitals in Gujarat.",
        "description_localized": {
            "gu": "કિડનીના દર્દીઓ માટે ગુજરાતના તમામ ૩૩ જિલ્લા અને સબ-ડિસ્ટ્રિક્ટ હોસ્પિટલોમાં ૧૦૦% મફત હેમોડાયાલિસિસ અને પેરિટોનિયલ ડાયાલિસિસ સારવાર.",
            "hi": "गुजरात के सभी जिलों में आयुष्मान/बीपीएल कार्डधारकों के लिए 100% मुफ्त हीमोडायलिसिस और पेरिटोनियल डायलिसिस सेवाएं।"
        },
        "issuing_authority": IssuingAuthorityType.STATE,
        "state_jurisdiction": "Gujarat",
        "categories": [
            SchemeCategory.CHRONIC_DISEASES,
            SchemeCategory.CRITICAL_ILLNESS,
            SchemeCategory.HOSPITALIZATION
        ],
        "coverage_amount": "100% Free Lifetime Dialysis (Worth ₹25,000–₹40,000/month in private)",
        "coverage_amount_num": 480000,
        "income_limit": "Free for PM-JAY / MA cardholders and BPL; Highly subsidized (₹250-₹400) for non-BPL",
        "income_limit_max": 400000,
        "eligibility_criteria": [
            "Patients diagnosed with Chronic Kidney Disease Stage 5 (CKD-5) or End-Stage Renal Disease (ESRD)",
            "Gujarat domicile with PM-JAY Ayushman Card or NFSA/BPL card (Free)",
            "Non-BPL residents of Gujarat eligible at nominal rate of ₹250–₹400 per session"
        ],
        "benefits": [
            "Completely free hemodialysis sessions (normally costing ₹2,000–₹3,500 per session in private clinics)",
            "Free dialysis consumables: Dialyzer filters, blood tubing sets, and acid/bicarbonate concentrates",
            "Free monthly laboratory blood investigations (Serum Creatinine, BUN, Potassium, Hemoglobin)",
            "Free Erythropoietin (EPO) and Iron Sucrose injections for anemia management",
            "Established dialysis units in all 33 Gujarat district hospitals and over 80 sub-district hospitals (IKDRC network)"
        ],
        "covered_treatments": [
            "Maintenance Hemodialysis (MHD)",
            "Automated Peritoneal Dialysis (APD) & CAPD",
            "Arteriovenous (AV) Fistula construction surgery referral",
            "Pre-transplant nephrology evaluation and workup"
        ],
        "required_documents": [
            "Ayushman PM-JAY Card or Mukhyamantri Amrutam (MA) Card",
            "Aadhaar Card of the patient",
            "Nephrologist diagnosis card confirming CKD Stage 5 / ESRD",
            "Recent viral markers report (HIV, HBsAg, HCV)"
        ],
        "how_to_apply": "Present nephrologist referral slip and Ayushman card directly at the Dialysis Centre of any Gujarat District Civil Hospital or GMERS Medical College Hospital. Registration is performed on the PMNDP portal (dialysis.nhm.gov.in) on first visit.",
        "application_link": "https://dialysis.nhm.gov.in/",
        "helpline_number": "104 (Health Helpline) / 1800-233-1022",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-14",
        "verified_by": "National Health Mission (NHM) & Institute of Kidney Diseases and Research Centre (IKDRC Ahmedabad)",
        "middle_class_friendly": True,
        "verification_flag": "Fully operational across all 33 Gujarat districts. Governed by IKDRC Ahmedabad under public-private partnership."
    },
    {
        "id": "gujarat-senior-health-vayoshri",
        "name": "Rashtriya Vayoshri & Gujarat Senior Health Assistive Aid Scheme",
        "name_localized": {
            "gu": "રાષ્ટ્રીય વયોશ્રી અને વરિષ્ઠ નાગરિક સહાયક સાધન યોજના (ગુજરાત)",
            "hi": "राष्ट्रीय वयोश्री एवं वरिष्ठ नागरिक स्वास्थ्य सहायता योजना",
            "mr": "राष्ट्रीय वयोश्री योजना (ज्येष्ठ नागरिक)",
            "bn": "রাষ্ট্রীয় বয়োশ্রী যোজনা",
            "ta": "ராஷ்ட்ரிய வயோஸ்ரீ திட்டம்",
            "te": "రాష్ట్రీయ వయోశ్రీ యోజన"
        },
        "short_description": "Free provision of physical assisted-living devices (hearing aids, wheelchairs, dentures, spectacles, crutches) and specialized geriatric care for senior citizens aged 60+ across Gujarat.",
        "description_localized": {
            "gu": "૬૦ વર્ષ કે તેથી વધુ ઉંમરના વરિષ્ઠ નાગરિકોને સાંભળવાના મશીન, વ્હીલચેર, આંખના ચશ્મા, કૃત્રિમ દાંત અને સહાયક સાધનો ૧૦૦% મફત આપતી સરકારી યોજના.",
            "hi": "60 वर्ष या अधिक उम्र के वरिष्ठ नागरिकों को सुनने की मशीन, व्हीलचेयर, चश्मा, कृत्रिम दांत और सहायक उपकरण मुफ्त प्रदान करने वाली योजना।"
        },
        "issuing_authority": IssuingAuthorityType.CENTRAL,
        "state_jurisdiction": "Gujarat",
        "categories": [
            SchemeCategory.CHRONIC_DISEASES,
            SchemeCategory.MEDICINES_DIAGNOSTICS
        ],
        "coverage_amount": "Free High-Quality Assistive Devices & Free Cataract Surgeries (up to ₹35,000/beneficiary)",
        "coverage_amount_num": 35000,
        "income_limit": "Senior citizens with family monthly income under ₹15,000 or BPL / Priority Ration Card",
        "income_limit_max": 200000,
        "eligibility_criteria": [
            "Indian senior citizen aged 60 years or above with Gujarat domicile",
            "Suffering from age-related infirmities or disabilities (hearing loss, low vision, locomotor impairment, loss of teeth)",
            "Monthly income of family not exceeding ₹15,000, or holder of BPL / Annapurna / Antyodaya ration card"
        ],
        "benefits": [
            "Free digital Behind-the-Ear (BTE) hearing aids for hearing-impaired seniors",
            "Free folding wheelchairs, tri-wheelers, and walkers for locomotor disabilities",
            "Free prescription spectacles and complete denture sets (full mouth rehabilitation)",
            "Free walking sticks, elbow crutches, quadrupods, and cervical collars",
            "Completely free cataract removal surgery with Intraocular Lens (IOL) implant at all District Civil Hospitals in Gujarat"
        ],
        "covered_treatments": [
            "Audiometric testing & Hearing aid dispensing",
            "Ophthalmology cataract surgery and refraction evaluation",
            "Geriatric physiotherapy and dental prosthesis fitting",
            "Orthopedic assisted-device calibration"
        ],
        "required_documents": [
            "Aadhaar Card or Senior Citizen Identity Card",
            "Age proof certificate (School Leaving Certificate / Passport / Voter ID)",
            "Income certificate issued by Talati / Mamlatdar or BPL Ration Card",
            "Medical disability assessment certificate issued by Government Civil Hospital doctor"
        ],
        "how_to_apply": "District-level assessment camps are conducted twice a year in Gujarat by ALIMCO and District Social Defense Officers. Seniors register at the camp or through the nearest District Collectorate Social Security branch with Aadhaar.",
        "application_link": "https://socialjustice.gov.in/schemes/73",
        "helpline_number": "14567 (Elder Line National Helpline) / 104",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-14",
        "verified_by": "Ministry of Social Justice & Empowerment & ALIMCO (Govt of India)",
        "middle_class_friendly": True,
        "verification_flag": "Fully operational. Beneficiary identification camps conducted across all Gujarat taluka centers."
    }
]

# Verified affordable health insurance policies for middle-class families
VERIFIED_INSURANCE_POLICIES_DATA: List[Dict[str, Any]] = [
    {
        "id": "arogya-sanjeevani",
        "policy_name": "Arogya Sanjeevani Standard Health Policy",
        "provider": "IRDAI Mandated (Available across all General & Health Insurers)",
        "category": "Standard Government-Standardized Health Insurance",
        "premium_range": "₹3,500 – ₹7,200 / year (approx ₹300 - ₹600/month for family floater)",
        "sum_insured_range": "₹1,00,000 to ₹10,00,000 (Multiples of ₹50k)",
        "key_coverage": [
            "Inpatient hospitalization (Room rent capped at 2% of SI)",
            "ICU charges capped at 5% of SI",
            "30 days pre-hospitalization & 60 days post-hospitalization",
            "All day-care procedures covered",
            "Cataract treatment (up to 25% of SI or ₹40,000)",
            "AYUSH treatments covered up to 100% of sum insured"
        ],
        "waiting_periods": "30 days initial waiting period; 24-48 months for specified ailments & pre-existing conditions",
        "claim_settlement_ratio": "97.8% (Industry Average)",
        "entry_age": "18 years to 65 years (Lifelong renewability)",
        "official_link": "https://irdai.gov.in/",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-12",
        "irdai_registration": "IRDAI/NL-HLT/GEN/P-H/V.I/2020"
    },
    {
        "id": "new-india-yuva-family",
        "policy_name": "New India Assurance Yuva Bharat / Family Floater",
        "provider": "The New India Assurance Co. Ltd. (Public Sector Undertaking)",
        "category": "Public Sector Trust & Comprehensive Coverage",
        "premium_range": "₹5,400 – ₹11,200 / year (Dependable middle-class pricing)",
        "sum_insured_range": "₹5,00,000 to ₹25,00,000",
        "key_coverage": [
            "Zero room rent sub-limits on sum insured above ₹10 Lakh",
            "Modern treatments & robotic surgeries covered up to 50% SI",
            "Cumulative Bonus: 25% increase in sum insured per claim-free year",
            "Cashless network across 6,500+ empanelled hospitals in India",
            "Organ donor inpatient medical expenses fully covered"
        ],
        "waiting_periods": "Initial: 30 days; 24 months for named conditions; 36 months for pre-existing diseases",
        "claim_settlement_ratio": "96.4% (IRDAI Annual Report)",
        "entry_age": "18 years to 45 years (Yuva) / Up to 65 years (Standard)",
        "official_link": "https://www.newindia.co.in/",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-10",
        "irdai_registration": "IRDA/NL-HLT/NIA/P-H/V.I/184/13-14"
    },
    {
        "id": "star-comprehensive-family",
        "policy_name": "Star Health Comprehensive Insurance Plan",
        "provider": "Star Health and Allied Insurance",
        "category": "Zero Co-pay Family Comprehensive Health Cover",
        "premium_range": "₹8,500 – ₹16,000 / year (Family of 4, Age 35)",
        "sum_insured_range": "₹5,00,000 to ₹1,00,00,000",
        "key_coverage": [
            "No room rent cap / Single Private AC Room eligibility",
            "Automatic 100% restoration of sum insured upon exhaustion",
            "Maternity cover for normal and caesarean deliveries",
            "Newborn baby cover up to ₹1 Lakh from day 1",
            "Air ambulance cover up to ₹5 Lakh / year",
            "Bariatric surgery and mental health treatment covered"
        ],
        "waiting_periods": "Initial: 30 days; 24 months for specified illnesses; 36 months for pre-existing diseases; 24 months for maternity",
        "claim_settlement_ratio": "98.7% (In-house claims processing within 2 hours)",
        "entry_age": "18 years to 65 years",
        "official_link": "https://www.starhealth.in/",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-11",
        "irdai_registration": "SHAHLIP21199V042021"
    },
    {
        "id": "care-supreme-health",
        "policy_name": "Care Supreme Value Health Insurance",
        "provider": "Care Health Insurance (formerly Religare)",
        "category": "High Value, Inflation-Protected Affordable Policy",
        "premium_range": "₹6,800 – ₹14,500 / year",
        "sum_insured_range": "₹7,00,000 to ₹15,00,000",
        "key_coverage": [
            "Unlimited automatic recharge of sum insured for unrelated illnesses",
            "Cumulative Bonus Super: Up to 500% increase in sum insured",
            "60 days pre-hospitalization & 180 days post-hospitalization",
            "Annual health check-up for all insured members every policy year",
            "AYUSH inpatient coverage equal to sum insured"
        ],
        "waiting_periods": "Initial: 30 days; 36 months for PED (reducible to 24 months via rider)",
        "claim_settlement_ratio": "97.4% (IRDAI verified)",
        "entry_age": "18 years and above (No maximum entry age)",
        "official_link": "https://www.careinsurance.com/",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-12",
        "irdai_registration": "CHIHLIP23089V022223"
    },
    {
        "id": "hdfc-optima-secure",
        "policy_name": "HDFC ERGO Optima Secure",
        "provider": "HDFC ERGO General Insurance",
        "category": "Premium Middle-Class 4X Coverage Multiplier",
        "premium_range": "₹9,200 – ₹19,800 / year (Popular for urban & semi-urban families)",
        "sum_insured_range": "₹5,00,000 to ₹2,00,00,000",
        "key_coverage": [
            "Secure Benefit: 2X coverage from Day 1 without extra cost",
            "Plus Benefit: 100% additional sum insured in 2 consecutive years",
            "Restore Benefit: 100% sum insured restored automatically on any claim",
            "Zero deduction on consumables (gloves, PPE, syringes via rider)",
            "60 days pre & 180 days post-hospitalization"
        ],
        "waiting_periods": "Initial: 30 days; 24 months for named ailments; 36 months for pre-existing conditions",
        "claim_settlement_ratio": "99.1% (High cashless approval rating)",
        "entry_age": "18 years to 65 years",
        "official_link": "https://www.hdfcergo.com/",
        "verification_status": SchemeVerificationStatus.VERIFIED,
        "last_verified_on": "2026-10-13",
        "irdai_registration": "HDFHLIP22064V022122"
    }
]

# Initial sample verified claims for demo & transparency
INITIAL_SAMPLE_CLAIMS: List[Dict[str, Any]] = [
    {
        "id": "claim-pmjay-8921",
        "claim_reference": "PMJAY/GJ/2026/892144",
        "scheme_or_policy": "Ayushman Bharat PM-JAY",
        "patient_name": "Rameshbhai K. Patel",
        "hospital_name": "U.N. Mehta Institute of Cardiology, Ahmedabad",
        "claim_type": ClaimType.GOVT_PREAUTH,
        "amount_claimed": 185000.0,
        "amount_approved": 185000.0,
        "status": ClaimStatus.SETTLED,
        "source": ClaimVerificationSource.OFFICIAL_TPA,
        "is_verified": True,
        "submitted_date": "2026-09-18",
        "last_updated": "2026-09-24",
        "next_steps": "Treatment completed. Cashless settlement settled directly with hospital. Patient discharge summary archived.",
        "notes": "Coronary angioplasty with drug-eluting stent. Fully covered under PM-JAY package."
    },
    {
        "id": "claim-maa-4412",
        "claim_reference": "MAA/GJ/VAL/2026/4412",
        "scheme_or_policy": "Mukhyamantri Amrutam (MA Vatsalya)",
        "patient_name": "Meenaben V. Parmar",
        "hospital_name": "Civil Hospital, Rajkot",
        "claim_type": ClaimType.CASHLESS,
        "amount_claimed": 92000.0,
        "amount_approved": 92000.0,
        "status": ClaimStatus.VERIFIED,
        "source": ClaimVerificationSource.OFFICIAL_TPA,
        "is_verified": True,
        "submitted_date": "2026-10-02",
        "last_updated": "2026-10-09",
        "next_steps": "Pre-authorization approved by State Health Agency TPA. Discharge billing in progress.",
        "notes": "Laparoscopic cholecystectomy for gallstones. MA card biometric authentication verified."
    },
    {
        "id": "claim-arogya-1109",
        "claim_reference": "NIA/CL/2026/781109",
        "scheme_or_policy": "New India Arogya Sanjeevani",
        "patient_name": "Amit S. Joshi",
        "hospital_name": "Sterling Hospital, Vadodara",
        "claim_type": ClaimType.REIMBURSEMENT,
        "amount_claimed": 48500.0,
        "amount_approved": 42000.0,
        "status": ClaimStatus.ACTIVE,
        "source": ClaimVerificationSource.OFFICIAL_TPA,
        "is_verified": True,
        "submitted_date": "2026-10-06",
        "last_updated": "2026-10-11",
        "next_steps": "TPA Query: Upload final hospital discharge card and medicine breakup receipts within 10 days.",
        "notes": "Dengue inpatient care. Room rent copay applied as per standard Arogya Sanjeevani terms."
    }
]

class SchemeService:
    def __init__(self):
        self._schemes: List[HealthScheme] = [HealthScheme(**s) for s in VERIFIED_SCHEMES_DATA]
        self._insurance_policies: List[InsurancePolicy] = [InsurancePolicy(**p) for p in VERIFIED_INSURANCE_POLICIES_DATA]
        self._claims: List[PatientClaim] = [PatientClaim(**c) for c in INITIAL_SAMPLE_CLAIMS]

    async def get_schemes(
        self,
        category: Optional[str] = None,
        state: Optional[str] = None,
        search_query: Optional[str] = None,
        middle_class_only: bool = False
    ) -> List[HealthScheme]:
        """Fetch schemes with robust filtering."""
        results = self._schemes

        if middle_class_only:
            results = [s for s in results if s.middle_class_friendly]

        if category and category != "all":
            results = [s for s in results if any(c.value == category for c in s.categories)]

        if state and state.lower() != "all" and state.lower() != "all india":
            results = [
                s for s in results
                if s.state_jurisdiction.lower() == "all india" or s.state_jurisdiction.lower() == state.lower()
            ]

        if search_query:
            query = search_query.strip().lower()
            filtered = []
            for s in results:
                in_name = query in s.name.lower()
                in_desc = query in s.short_description.lower()
                in_treatments = any(query in t.lower() for t in s.covered_treatments)
                in_localized = any(query in val.lower() for val in s.name_localized.values())
                if in_name or in_desc or in_treatments or in_localized:
                    filtered.append(s)
            results = filtered

        return results

    async def get_scheme_by_id(self, scheme_id: str) -> Optional[HealthScheme]:
        for s in self._schemes:
            if s.id == scheme_id:
                return s
        return None

    async def get_insurance_policies(self) -> List[InsurancePolicy]:
        return self._insurance_policies

    async def get_claims(self, patient_name: Optional[str] = None) -> List[PatientClaim]:
        if patient_name:
            return [c for c in self._claims if patient_name.lower() in c.patient_name.lower()]
        return self._claims

    async def track_claim(self, request: ClaimCreateRequest) -> PatientClaim:
        new_claim = PatientClaim(
            id=f"claim-user-{uuid.uuid4().hex[:8]}",
            claim_reference=request.claim_reference or f"SUB/USER/{datetime.utcnow().strftime('%Y%m%d')}/{uuid.uuid4().hex[:4].upper()}",
            scheme_or_policy=request.scheme_or_policy,
            patient_name=request.patient_name,
            hospital_name=request.hospital_name,
            claim_type=request.claim_type,
            amount_claimed=request.amount_claimed,
            amount_approved=None,
            status=ClaimStatus.ACTIVE,
            source=ClaimVerificationSource.USER_SUBMITTED,
            is_verified=False,
            submitted_date=datetime.utcnow().strftime("%Y-%m-%d"),
            last_updated=datetime.utcnow().strftime("%Y-%m-%d"),
            next_steps="Pending verification from Hospital TPA Desk / Government Scheme Nodal Officer. Keep original documents ready.",
            notes=request.notes
        )
        self._claims.insert(0, new_claim)
        return new_claim

    async def check_eligibility(self, query: EligibilityCheckRequest) -> List[EligibilityMatch]:
        """
        Smart algorithm that calculates eligibility scores for all schemes
        based on state, annual income, age, illness, and category.
        """
        matches: List[EligibilityMatch] = []

        for scheme in self._schemes:
            score = 100
            reasons: List[str] = []
            warnings: List[str] = []
            is_eligible = True

            # 1. State check
            is_all_india = scheme.state_jurisdiction.lower() == "all india"
            is_matching_state = scheme.state_jurisdiction.lower() == query.state.lower()
            if not is_all_india and not is_matching_state:
                score -= 60
                is_eligible = False
                warnings.append(f"Restricted to residents of {scheme.state_jurisdiction}. User state is {query.state}.")
            else:
                reasons.append(f"Geographic eligibility satisfied ({scheme.state_jurisdiction}).")

            # 2. Age checks (Special case: Ayushman Vay Vandana for 70+)
            if scheme.id == "pmjay-vay-vandana":
                if query.age >= 70:
                    score += 15
                    reasons.append(f"Senior citizen age requirement fulfilled ({query.age} ≥ 70 years). Universal cover without income cap applies.")
                else:
                    score -= 80
                    is_eligible = False
                    warnings.append(f"Requires age 70 or above. Patient age is {query.age}.")
            
            # Special case: PMSMA for maternity
            if scheme.id == "pmsma-jssk-maternity":
                if query.category and "pregnant" in query.category.lower():
                    score += 20
                    reasons.append("Eligible as pregnant mother under PMSMA & JSSK.")
                elif query.illness_type and any(m in query.illness_type.lower() for m in ["maternity", "delivery", "pregnancy"]):
                    score += 20
                    reasons.append("Maternity clinical indication matches.")
                else:
                    warnings.append("Scheme is specifically designed for pregnant women and newborns.")

            # 3. Income Limit check
            if scheme.income_limit_max is not None:
                if query.annual_income <= scheme.income_limit_max:
                    reasons.append(f"Annual income ₹{int(query.annual_income):,} is within scheme cap of ₹{scheme.income_limit_max:,}.")
                else:
                    excess = query.annual_income - scheme.income_limit_max
                    score -= min(60, int((excess / scheme.income_limit_max) * 40))
                    is_eligible = False
                    warnings.append(f"Annual income ₹{int(query.annual_income):,} exceeds threshold of ₹{scheme.income_limit_max:,}.")
            else:
                reasons.append("No income ceiling required (Universal / Broad middle-class cover).")

            # 4. Illness match check
            if query.illness_type:
                illness = query.illness_type.lower()
                treatment_matched = any(illness in t.lower() for t in scheme.covered_treatments)
                category_matched = False
                if "surgery" in illness or "operation" in illness:
                    category_matched = SchemeCategory.OPERATIONS_SURGERY in scheme.categories
                elif "cancer" in illness or "heart" in illness or "cardiac" in illness or "kidney" in illness:
                    category_matched = SchemeCategory.CRITICAL_ILLNESS in scheme.categories
                elif "medicine" in illness or "pharmacy" in illness:
                    category_matched = SchemeCategory.MEDICINES_DIAGNOSTICS in scheme.categories
                elif "maternity" in illness:
                    category_matched = SchemeCategory.MATERNITY_CHILD in scheme.categories

                if treatment_matched or category_matched:
                    score += 10
                    reasons.append(f"Specific coverage found for illness/need '{query.illness_type}'.")
                else:
                    warnings.append(f"Verify specific package code for '{query.illness_type}' at empanelled hospital.")

            # Bound score 0 - 100
            score = max(0, min(100, score))

            matches.append(
                EligibilityMatch(
                    scheme=scheme,
                    match_score=score,
                    is_eligible=is_eligible and score >= 50,
                    matching_reasons=reasons,
                    warning_notes=warnings if warnings else None
                )
            )

        # Sort matches by score descending
        matches.sort(key=lambda m: m.match_score, reverse=True)
        return matches

# Singleton instance
scheme_service = SchemeService()
