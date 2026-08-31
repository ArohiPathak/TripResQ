import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ShieldCheck,
  Zap,
  RefreshCw,
  Clock,
  Trash2,
  Check,
  User,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Filter,
  Star,
  Send,
  Upload,
  Sparkles,
  LogOut,
  CheckCircle,
  Shield,
  Globe,
  Flame,
  AlertCircle,
  Calendar
} from 'lucide-react';
import './App.css';

// --- i18n Translation Dictionary ---
const TRANSLATIONS = {
  en: {
    logo: "TripResQ",
    navHome: "Home",
    navMyTrips: "My Trips",
    navRestaurants: "Dining",
    navSupport: "Support Hub",
    navChaos: "⚡ Chaos Lab",
    signIn: "Sign In",
    signOut: "Sign Out",
    welcome: "Welcome",
    
    // Home Page
    tagline: "Book Seamlessly. Travel Resiliently.",
    subTagline: "TripResQ is the world's first consumer travel platform with a built-in Disruption Recovery Engine. If connections fail, we automatically rebook alternatives in seconds—at no cost to you.",
    protectionBadge: "Auto-Rebooking Guard Included",
    searchDeals: "Build & Protect Journey",
    flightTab: "✈️ Flights",
    trainTab: "🚆 Trains",
    hotelTab: "🏨 Hotels",
    cabTab: "🚕 Cabs",
    fromLabel: "From Location",
    toLabel: "To Location",
    dateLabel: "Departure Date",
    timeLabel: "Departure Time",
    durationLabel: "Duration (Minutes)",
    airwaysLabel: "Airways Name",
    trainNameLabel: "Train Name / Number",
    cabServiceLabel: "Cab Operator / Service",
    hotelNameLabel: "Hotel Name",
    addNodeBtn: "➕ Add Node to Itinerary",
    lockTripBtn: "🛡️ Lock & Protect Itinerary",
    livePreview: "Live Itinerary Preview Chain",
    authPromptTitle: "Sign In to Protect Your Trip",
    authPromptDesc: "Build your custom travel routes and let our engine automatically safeguard your connections from cascading delays.",
    noNodesYet: "No travel nodes added yet. Add a Flight, Train, Cab, or Hotel above to start building your timeline.",
    typePlaceholder: "Type location...",
    
    freeCancellation: "Free cancellation up to 24h & automatic missed connection protection.",
    howItWorks: "Smart Trip Protection, Reimagined",
    marketingTitle1: "Automatic Rebooking",
    marketingDesc1: "If your train or flight is delayed, our system instantly triggers alternate travel vectors so you never miss a connection.",
    marketingTitle2: "Real-Time Risk Alerts",
    marketingDesc2: "We track weather, rail lines, and airports. Get proactive notifications before disruptions cascade, putting you in control.",
    marketingTitle3: "We've Got Your Back",
    marketingDesc3: "Rest easy knowing you have free, automatic replacement bookings or 100% refund claims processed within minutes.",

    // Timeline Page
    tripHeaderTitle: "Your Journey to",
    tripReference: "Trip Reference",
    backToBookings: "Back to Bookings",
    emailItinerary: "Email Itinerary",
    healthyTitle: "Your Journey is Protected",
    healthyDesc: "TripResQ is active. All departures are operating on schedule and your buffers are fully safe.",
    disruptTitle: "Connection Disrupted",
    disruptDesc: "A disruption was detected. Your transit schedule has slipped, risking downstream connections.",
    viewRescuePlans: "View Smart Rescue Plans",
    timelineTitle: "Chronological Route Timeline",
    scheduled: "SCHEDULED",
    actual: "ACTUAL",
    bufferLabel: "Buffer",
    missed: "Missed",
    lateArrival: "Late Arrival Risk",
    onTime: "On Time",
    delayed: "Delayed",
    connectionBroken: "Connection Broken",

    // Rescue Page
    rescueHeader: "We've got you covered.",
    rescueSub: "Due to the disruption on your transit node, we calculated that your downstream bookings are compromised. Select a recovery plan below.",
    backToTimeline: "View Disrupted Timeline",
    planFastest: "⚡ The Fastest Plan",
    planBudget: "💰 The Budget Plan",
    planRefund: "💸 Max Refund Plan",
    acceptPlan: "Accept Plan",
    free: "FREE",
    refund: "Refund",

    // Chaos Lab
    chaosTitle: "Demo Sandbox & Chaos Lab",
    chaosDesc: "Test our cascading disruption engine. Select a booking node, choose a disruption parameter, and watch TripResQ calculate downstream impact.",
    selectNode: "Select Booking Node to Disrupt",
    disruptType: "Disruption Type",
    delayAmount: "Delay Duration (Minutes)",
    disruptReason: "Disruption Reason",
    triggerBtn: "Trigger Cascading Disruption",
    resetBtn: "Reset Journey to On-Time",
    impactTitle: "Cascade Impact Metrics",
    downstreamDelay: "Downstream Delay",
    brokenConnections: "Broken Connections",
    affectedNodes: "Affected Nodes Count",

    // Dining Page
    diningTitle: "Local Dining & Bites Near You",
    diningDesc: "Curated local eateries near your destination hub or hotel. Selected for high hygiene and transit speed.",
    vegOnly: "Pure Veg",
    specialties: "Local Specialties",
    fastDelivery: "Fast Delivery",
    open247: "Open 24/7",
    all: "All Restaurants",
    kmAway: "km from destination",
    rating: "Rating",
    avgCost: "Avg. Cost for 2",

    // Support Page
    supportTitle: "Support & Help Center",
    supportDesc: "24/7 emergency response, interactive FAQ, feedback forms, and bug reporter.",
    faqTab: "FAQ & Assistance",
    bugTab: "Report a Bug",
    feedbackTab: "Share Feedback",
    faqTitle: "Frequently Asked Questions",
    chatbotTitle: "AI Travel Assistant",
    chatbotSub: "Ask about delays, rebookings, and refund policies.",
    chatPlaceholder: "Type your query here...",
    chatSend: "Send",
    sosHelpline: "24/7 SOS Helpline",
    sosDesc: "Call our high-priority support deck immediately.",
    bugTitle: "Submit Bug / Platform Issue",
    bugSummary: "Issue Summary",
    bugSteps: "Steps to Reproduce",
    bugSeverity: "Severity Level",
    bugScreenshot: "Drag & drop a screenshot, or click to upload (Mock)",
    bugSubmit: "Submit Bug Report",
    feedbackTitle: "Rate Your Experience",
    feedbackSub: "We continuously refine our recovery models based on passenger feedback.",
    feedbackComment: "Write your review comments here...",
    feedbackSubmit: "Submit Feedback",

    // Auth
    authTitle: "Sign In / Register",
    signInTab: "Sign In",
    signUpTab: "Create Account",
    fullName: "Full Name",
    emailOrPhone: "Email Address / Mobile Number",
    password: "Password",
    rememberMe: "Remember me",
    forgotPass: "Forgot Password?",
    socialSignIn: "Or sign in with",
    googleSignIn: "Google Account",
    otpSignIn: "Phone OTP verification",
    signUpBtn: "Sign Up & Register"
  },
  hi: {
    logo: "ट्रिपरेस्क्यू (TripResQ)",
    navHome: "होम",
    navMyTrips: "मेरी यात्राएं",
    navRestaurants: "भोजन",
    navSupport: "सहायता केंद्र",
    navChaos: "⚡ कैओस लैब",
    signIn: "लॉग इन करें",
    signOut: "लॉग आउट",
    welcome: "स्वागत है",
    
    tagline: "सहजता से बुक करें। सुरक्षित यात्रा करें।",
    subTagline: "TripResQ अंतर्निहित व्यवधान सुधार इंजन के साथ दुनिया का पहला यात्रा मंच है। यदि कोई कनेक्शन विफल होता है, तो हम बिना किसी अतिरिक्त लागत के सेकंडों में विकल्प बुक करते हैं।",
    protectionBadge: "ऑटो-रीबुकिंग सुरक्षा शामिल",
    searchDeals: "यात्रा बनाएं और सुरक्षित करें",
    flightTab: "✈️ उड़ानें",
    trainTab: "🚆 ट्रेनें",
    hotelTab: "🏨 होटल",
    cabTab: "🚕 कैब",
    fromLabel: "प्रस्थान स्थान",
    toLabel: "गंतव्य स्थान",
    dateLabel: "प्रस्थान की तारीख",
    timeLabel: "प्रस्थान का समय",
    durationLabel: "अवधि (मिनट)",
    airwaysLabel: "एयरलाइंस का नाम",
    trainNameLabel: "ट्रेन का नाम / नंबर",
    cabServiceLabel: "कैब सेवा प्रदाता",
    hotelNameLabel: "होटल का नाम",
    addNodeBtn: "➕ यात्रा कार्यक्रम में नोड जोड़ें",
    lockTripBtn: "🛡️ यात्रा कार्यक्रम लॉक और सुरक्षित करें",
    livePreview: "लाइव यात्रा कार्यक्रम पूर्वावलोकन",
    authPromptTitle: "अपनी यात्रा सुरक्षित करने के लिए लॉग इन करें",
    authPromptDesc: "अपने पसंदीदा यात्रा मार्ग बनाएं और हमारे व्यवधान सुधार इंजन को आपके कनेक्शन सुरक्षित करने दें।",
    noNodesYet: "अभी तक कोई यात्रा नोड नहीं जोड़ा गया है। अपनी टाइमलाइन बनाने के लिए ऊपर एक उड़ान, ट्रेन, कैब या होटल जोड़ें।",
    typePlaceholder: "स्थान का नाम लिखें...",

    freeCancellation: "24 घंटे पहले तक मुफ्त रद्दीकरण और स्वचालित सुरक्षा सुविधा।",
    howItWorks: "स्मार्ट यात्रा सुरक्षा, नए रूप में",
    marketingTitle1: "स्वचालित रीबुकिंग",
    marketingDesc1: "यदि आपकी ट्रेन या उड़ान में देरी होती है, तो हमारा सिस्टम तुरंत अन्य विकल्प सक्रिय करता है ताकि आप यात्रा मिस न करें।",
    marketingTitle2: "रीअल-टाइम चेतावनी",
    marketingDesc2: "हम मौसम, रेल लाइनों और हवाई अड्डों पर नज़र रखते हैं। किसी भी संकट से पहले आपको चेतावनी दी जाती है ताकि आप नियंत्रण में रहें।",
    marketingTitle3: "हम आपके साथ हैं",
    marketingDesc3: "निश्चिंत रहें, व्यवधान के कुछ ही मिनटों के भीतर मुफ्त रिप्लेसमेंट बुकिंग या 100% रिफंड प्रक्रिया शुरू हो जाती है।",

    tripHeaderTitle: "आपकी यात्रा",
    tripReference: "यात्रा संदर्भ संख्या",
    backToBookings: "बुकिंग पर वापस जाएं",
    emailItinerary: "यात्रा कार्यक्रम ईमेल करें",
    healthyTitle: "आपकी यात्रा सुरक्षित है",
    healthyDesc: "TripResQ सक्रिय है। सभी प्रस्थान समय पर चल रहे हैं और बफर सुरक्षित हैं।",
    disruptTitle: "यात्रा बाधित हुई",
    disruptDesc: "व्यवधान पाया गया। आपकी यात्रा का समय बदल गया है, जिससे आगे के कनेक्शन के छूटने का जोखिम है।",
    viewRescuePlans: "स्मार्ट बचाव योजनाएं देखें",
    timelineTitle: "यात्रा का समय चक्र",
    scheduled: "निर्धारित समय",
    actual: "वास्तविक समय",
    bufferLabel: "बफ़र समय",
    missed: "छूट गया",
    lateArrival: "देर से आगमन का जोखिम",
    onTime: "समय पर",
    delayed: "विलंबित",
    connectionBroken: "कनेक्शन टूटा",

    rescueHeader: "हमने आपकी सुरक्षा सुनिश्चित की है।",
    rescueSub: "आपकी यात्रा बाधित होने के कारण आगे की बुकिंग प्रभावित हुई है। कृपया नीचे दी गई किसी एक पुनर्प्राप्ति योजना का चयन करें।",
    backToTimeline: "बाधित समय चक्र देखें",
    planFastest: "⚡ सबसे तेज़ योजना",
    planBudget: "💰 बजट योजना",
    planRefund: "💸 अधिकतम रिफंड योजना",
    acceptPlan: "योजना स्वीकार करें",
    free: "मुफ़्त",
    refund: "रिफंड",

    chaosTitle: "डेमो सैंडबॉक्स और कैओस लैब",
    chaosDesc: "हमारे व्यवधान इंजन का परीक्षण करें। एक बुकिंग नोड चुनें, देरी का पैमाना सेट करें, और देखें कि TripResQ कैसे प्रभाव की गणना करता है।",
    selectNode: "बाधित करने के लिए बुकिंग नोड चुनें",
    disruptType: "व्यवधान का प्रकार",
    delayAmount: "देरी की अवधि (मिनट)",
    disruptReason: "व्यवधान का कारण",
    triggerBtn: "व्यवधान सक्रिय करें",
    resetBtn: "यात्रा को समय पर रीसेट करें",
    impactTitle: "व्यवधान प्रभाव विवरण",
    downstreamDelay: "आगे होने वाली देरी",
    brokenConnections: "टूटे हुए कनेक्शन",
    affectedNodes: "प्रभावित नोड्स की संख्या",

    diningTitle: "आपके आस-पास स्थानीय भोजन",
    diningDesc: "आपके गंतव्य स्टेशन या होटल के पास चुनिंदा भोजनालय। बेहतर स्वच्छता और तेज़ सेवा के आधार पर चुने गए।",
    vegOnly: "शुद्ध शाकाहारी",
    specialties: "स्थानीय व्यंजन",
    fastDelivery: "तेज़ डिलीवरी",
    open247: "24/7 खुला है",
    all: "सभी रेस्तरां",
    kmAway: "किमी गंतव्य से",
    rating: "रेटिंग",
    avgCost: "2 लोगों के लिए औसत लागत",

    supportTitle: "सहायता और प्रतिक्रिया केंद्र",
    supportDesc: "24/7 आपातकालीन प्रतिक्रिया, सामान्य प्रश्न, प्रतिक्रिया फॉर्म और बग रिपोर्टर।",
    faqTab: "सामान्य प्रश्न और सहायता",
    bugTab: "बग रिपोर्ट करें",
    feedbackTab: "प्रतिक्रिया साझा करें",
    faqTitle: "अक्सर पूछे जाने वाले प्रश्न",
    chatbotTitle: "एआई यात्रा सहायक",
    chatbotSub: "देरी, रीबुकिंग और रिफंड नीतियों के बारे में पूछें।",
    chatPlaceholder: "यहाँ अपना प्रश्न लिखें...",
    chatSend: "भेजें",
    sosHelpline: "24/7 आपातकालीन हेल्पलाइन",
    sosDesc: "तत्काल सहायता के लिए हमारे हेल्पलाइन पर कॉल करें।",
    bugTitle: "बग / प्लेटफॉर्म समस्या सबमिट करें",
    bugSummary: "समस्या का विवरण",
    bugSteps: "समस्या दोहराने के चरण",
    bugSeverity: "गंभीरता का स्तर",
    bugScreenshot: "स्क्रीनशॉट खींचकर यहाँ लाएँ, या अपलोड करने के लिए क्लिक करें (मॉक)",
    bugSubmit: "बग रिपोर्ट सबमिट करें",
    feedbackTitle: "अपने अनुभव को रेटिंग दें",
    feedbackSub: "हम यात्रियों की प्रतिक्रिया के आधार पर अपनी योजनाओं में सुधार करते हैं।",
    feedbackComment: "यहाँ अपनी समीक्षा लिखें...",
    feedbackSubmit: "प्रतिक्रिया सबमिट करें",

    authTitle: "लॉग इन / पंजीकरण",
    signInTab: "लॉग इन",
    signUpTab: "खाता बनाएं",
    fullName: "पूरा नाम",
    emailOrPhone: "ईमेल पता / मोबाइल नंबर",
    password: "पासवर्ड",
    rememberMe: "मुझे याद रखें",
    forgotPass: "पासवर्ड भूल गए?",
    socialSignIn: "या इससे लॉग इन करें",
    googleSignIn: "गुगल खाता",
    otpSignIn: "मोबाइल ओटीपी सत्यापन",
    signUpBtn: "पंजीकरण करें"
  },
  mr: {
    logo: "ट्रिपरेस्क्यू (TripResQ)",
    navHome: "होम",
    navMyTrips: "माझ्या सहली",
    navRestaurants: "जेवण",
    navSupport: "मदत केंद्र",
    navChaos: "⚡ कॅओस लॅब",
    signIn: "लॉग इन करा",
    signOut: "लॉग आउट",
    welcome: "स्वागत आहे",
    
    tagline: "सहजतेने बुक करा. सुरक्षित प्रवास करा.",
    subTagline: "TripResQ हे अंगभूत व्यत्यय दुरुस्ती इंजिन असलेले जगातील पहिले प्रवास प्लॅटफॉर्म आहे. कनेक्शन अयशस्वी झाल्यास, आम्ही कोणत्याही अतिरिक्त खर्चाशिवाय सेकंदात पर्याय बुक करतो.",
    protectionBadge: "ऑटो-रीबुकिंग संरक्षण समाविष्ट",
    searchDeals: "प्रवास तयार करा आणि सुरक्षित करा",
    flightTab: "✈️ विमाने",
    trainTab: "🚆 रेल्वे",
    hotelTab: "🏨 हॉटेल्स",
    cabTab: "🚕 कॅब",
    fromLabel: "प्रस्थान स्थान",
    toLabel: "गंतव्य स्थान",
    dateLabel: "प्रस्थानाची तारीख",
    timeLabel: "प्रस्थानाची वेळ",
    durationLabel: "कालावधी (मिनिटे)",
    airwaysLabel: "विमान कंपनीचे नाव",
    trainNameLabel: "रेल्वेचे नाव / नंबर",
    cabServiceLabel: "कॅब ऑपरेटर / सेवा",
    hotelNameLabel: "हॉटेलचे नाव",
    addNodeBtn: "➕ प्रवासात नोड जोडा",
    lockTripBtn: "🛡️ प्रवासाची कालरेषा लॉक व सुरक्षित करा",
    livePreview: "थेट प्रवासाचे कालरेषा पूर्वावलोकन",
    authPromptTitle: "आपला प्रवास सुरक्षित करण्यासाठी लॉग इन करा",
    authPromptDesc: "तुमचे सानुकूल प्रवास मार्ग तयार करा आणि आमच्या इंजिनला तुमच्या जोडण्या वेळेवर राखू द्या.",
    noNodesYet: "अद्याप प्रवासाचे कोणतेही नोड जोडलेले नाहीत. तुमची कालरेषा तयार करण्यासाठी वर विमान, ट्रेन, कॅब किंवा हॉटेल जोडा.",
    typePlaceholder: "ठिकाण लिहा...",

    freeCancellation: "24 तास आधीपर्यंत मोफत रद्दीकरण आणि स्वयंचलित संरक्षण सुविधा.",
    howItWorks: "स्मार्ट प्रवास संरक्षण, नवीन रूपात",
    marketingTitle1: "स्वयंचलित रीबुकिंग",
    marketingDesc1: "तुमच्या ट्रेनला किंवा विमानाला उशीर झाल्यास, आमची सिस्टीम त्वरित पर्यायी प्रवास मार्ग सक्रिय करते जेणेकरून तुमचा प्रवास चुकणार नाही.",
    marketingTitle2: "रिअल-टाइम चेतावणी",
    marketingDesc2: "आम्ही हवामान, रेल्वे मार्ग आणि विमानतळांवर लक्ष ठेवतो. कोणत्याही संकटापूर्वी तुम्हाला चेतावणी दिली जाते जेणेकरून तुम्ही नियंत्रणात राहाल.",
    marketingTitle3: "आम्ही तुमच्या सोबत आहोत",
    marketingDesc3: "काळजी करू नका, व्यत्ययानंतर काही मिनिटांतच मोफत रिप्लेसमेंट बुकिंग किंवा 100% रिफंड प्रक्रिया सुरू केली जाते.",

    tripHeaderTitle: "तुमचा प्रवास",
    tripReference: "प्रवास संदर्भ संख्या",
    backToBookings: "बुकिंगवर परत जा",
    emailItinerary: "प्रवास कार्यक्रम ईमेल करा",
    healthyTitle: "तुमचा प्रवास सुरक्षित आहे",
    healthyDesc: "TripResQ सक्रिय आहे. सर्व प्रस्थान वेळेवर सुरू आहेत आणि बफर सुरक्षित आहेत.",
    disruptTitle: "प्रवासात अडथळा आला",
    disruptDesc: "व्यत्यय आढळला. taste बदलले आहे, ज्यामुळे पुढील कनेक्शन चुकण्याचा धोका आहे.",
    viewRescuePlans: "स्मार्ट बचाव योजना पहा",
    timelineTitle: "प्रवासाची कालरेषा",
    scheduled: "नियोजित वेळ",
    actual: "वास्तविक वेळ",
    bufferLabel: "बफर वेळ",
    missed: "चुकले",
    lateArrival: "उशिरा पोहोचण्याचा धोका",
    onTime: "वेळेवर",
    delayed: "उशिरा",
    connectionBroken: "कनेक्शन तुटले",

    rescueHeader: "आम्ही तुमचे संरक्षण करतो.",
    rescueSub: "तुमच्या प्रवासात अडथळा आल्यामुळे पुढील बुकिंग बाधित झाले आहे. कृपया खालीलपैकी एका रिकव्हरी योजनेची निवड करा.",
    backToTimeline: "बाधित प्रवासाची कालरेषा पहा",
    planFastest: "⚡ सर्वात जलद योजना",
    planBudget: "💰 बजेट योजना",
    planRefund: "💸 जास्तीत जास्त परतावा योजना",
    acceptPlan: "योजना स्वीकारा",
    free: "मोफत",
    refund: "परतावा",

    chaosTitle: "डेमो सँडबॉक्स आणि कॅओस लॅब",
    chaosDesc: "आमच्या व्यत्यय इंजिनची चाचणी घ्या. एक बुकिंग नोड निवडा, विलंबाचे प्रमाण सेट करा, आणि TripResQ कसे प्रभाव मोजते ते पहा.",
    selectNode: "व्यत्यय आणण्यासाठी बुकिंग नोड निवडा",
    disruptType: "व्यत्ययाचा प्रकार",
    delayAmount: "विलंबाचा कालावधी (मोजणी)",
    disruptReason: "व्यत्ययाचे कारण",
    triggerBtn: "व्यत्यय सक्रिय करा",
    resetBtn: "प्रवास वेळेवर रीसेट करा",
    impactTitle: "व्यत्यय प्रभाव तपशील",
    downstreamDelay: "पुढील संभाव्य विलंब",
    brokenConnections: "तुटलेले कनेक्शन",
    affectedNodes: "प्रभावित नोड्सची संख्या",

    diningTitle: "तुमच्या जवळील स्थानिक जेवण",
    diningDesc: "तुमच्या गंतव्य स्टेशन किंवा हॉटेल जवळील निवडक रेस्टॉरंट्स. स्वच्छता आणि जलद सेवेच्या आधारे निवडलेले.",
    vegOnly: "शुद्ध शाकाहारी",
    specialties: "स्थानिक पदार्थ",
    fastDelivery: "जलद डिलिव्हरी",
    open247: "24/7 सुरू",
    all: "सर्व रेस्टॉरंट्स",
    kmAway: "किमी गंतव्यस्थानापासून",
    rating: "रेटिंग",
    avgCost: "2 लोकांसाठी सरासरी खर्च",

    supportTitle: "मदत आणि अभिप्राय केंद्र",
    supportDesc: "24/7 आपत्कालीन प्रतिसाद, वारंवार विचारले जाणारे प्रश्न, अभिप्राय फॉर्म आणि बग रिपोर्टर.",
    faqTab: "वारंवार विचारले जाणारे प्रश्न आणि मदत",
    bugTab: "बग रिपोर्ट करा",
    feedbackTab: "अभिप्राय शेअर करा",
    faqTitle: "वारंवार विचारले जाणारे प्रश्न",
    chatbotTitle: "एआय प्रवास सहाय्यक",
    chatbotSub: "विलंब, रीबुकिंग आणि रिफंड धोरणांबद्दल विचारा.",
    chatPlaceholder: "येथे आपला प्रश्न विचारा...",
    chatSend: "पाठवा",
    sosHelpline: "24/7 आपत्कालीन हेल्पलाइन",
    sosDesc: "त्वरित मदतीसाठी आमच्या हेल्पलाइनला कॉल करा.",
    bugTitle: "बग / प्लॅटफॉर्म समस्या सबमिट करा",
    bugSummary: "समस्येचा गोषवारा",
    bugSteps: "समस्या पुन्हा कशी तयार करावी",
    bugSeverity: "गंभीरता पातळी",
    bugScreenshot: "स्क्रीनशॉट येथे ड्रॅग करून आणा, किंवा अपलोड करण्यासाठी क्लिक करा (मॉक)",
    bugSubmit: "बग रिपोर्ट सबमिट करा",
    feedbackTitle: "तुमच्या अनुभवाचे मूल्यांकन करा",
    feedbackSub: "आम्ही प्रवाशांच्या अभिप्रायाच्या आधारे आमच्या सेवांमध्ये सुधारणा करतो.",
    feedbackComment: "तुमचे मत येथे लिहा...",
    feedbackSubmit: "अभिप्राय सबमिट करा",

    authTitle: "लॉग इन / नोंदणी",
    signInTab: "लॉग इन",
    signUpTab: "खाते तयार करा",
    fullName: "पूर्ण नाव",
    emailOrPhone: "ईमेल पत्ता / मोबाईल नंबर",
    password: "पासवर्ड",
    rememberMe: "माझी आठवण ठेवा",
    forgotPass: "पासवर्ड विसरलात?",
    socialSignIn: "किंवा याद्वारे लॉग इन करा",
    googleSignIn: "गुगल खाते",
    otpSignIn: "मोबाईल ओटीपी पडताळणी",
    signUpBtn: "नोंदणी करा"
  }
};

// --- Mock Dining Hub Data ---
const RESTAURANTS = [
  {
    id: 'r1',
    city: 'Pune',
    name: 'Shabree Restaurant',
    cuisine: 'Maharashtrian Thali, Local Specialties',
    distance: 0.4,
    cost: 800,
    rating: 4.6,
    tags: ['Local Specialties', 'Pure Veg'],
    open247: false,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r2',
    city: 'Pune',
    name: 'German Bakery Café',
    cuisine: 'Bakery, Cakes, Continental Snacks',
    distance: 1.2,
    cost: 600,
    rating: 4.3,
    tags: ['Fast Delivery'],
    open247: true,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r3',
    city: 'Pune',
    name: 'Vaishali Restaurant',
    cuisine: 'South Indian Dosa, Idli, Filter Coffee',
    distance: 2.1,
    cost: 450,
    rating: 4.7,
    tags: ['Pure Veg', 'Local Specialties'],
    open247: false,
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r4',
    city: 'Mumbai',
    name: 'Britannia & Co. Restaurant',
    cuisine: 'Parsi Mutton Berry Pulao, Sali Boti',
    distance: 0.5,
    cost: 1100,
    rating: 4.5,
    tags: ['Local Specialties'],
    open247: false,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r5',
    city: 'Mumbai',
    name: 'Bastian Bandra',
    cuisine: 'Seafood Specialties, Premium European',
    distance: 3.2,
    cost: 2600,
    rating: 4.8,
    tags: ['Fast Delivery'],
    open247: true,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r6',
    city: 'Mumbai',
    name: 'Sukh Sagar Chowpatty',
    cuisine: 'North Indian Pav Bhaji, Chaat, Juice',
    distance: 0.8,
    cost: 500,
    rating: 4.2,
    tags: ['Pure Veg', 'Fast Delivery'],
    open247: true,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r7',
    city: 'Delhi',
    name: 'Karim\'s Jama Masjid',
    cuisine: 'Mughlai Kebabs, Butter Chicken, Naan',
    distance: 0.3,
    cost: 950,
    rating: 4.6,
    tags: ['Local Specialties'],
    open247: false,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r8',
    city: 'Delhi',
    name: 'Saravana Bhavan Connaught Place',
    cuisine: 'Traditional South Indian Thali, Pure Veg',
    distance: 1.4,
    cost: 550,
    rating: 4.5,
    tags: ['Pure Veg', 'Local Specialties'],
    open247: false,
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 'r9',
    city: 'Delhi',
    name: 'Midnight Express Diner',
    cuisine: 'Rolls, Burgers, Late Night Shakes',
    distance: 1.1,
    cost: 400,
    rating: 4.1,
    tags: ['Fast Delivery', 'Open 24/7'],
    open247: true,
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=500&auto=format&fit=crop&q=60'
  }
];

// Seed helper to construct the default trip
const seedInitialTripNodes = () => {
  const startTime = "08:00";
  const transitEnd = "11:00"; // 3 hours duration
  const cabStart = "11:30"; // 30 mins buffer
  const cabEnd = "12:15"; // 45 mins cab ride
  const checkinTime = "13:00"; // 45 mins buffer
  
  return [
    {
      id: 'node-1',
      type: 'train',
      title: 'Deccan Express DEC-809',
      sub: 'Mumbai (CST) → Pune (PNQ)',
      scheduledStart: startTime,
      scheduledEnd: transitEnd,
      actualStart: startTime,
      actualEnd: transitEnd,
      buffer: 30,
      status: 'healthy',
      disruptionReason: '',
      delayMinutes: 0,
      info: 'Platform 4 • Main Terminal'
    },
    {
      id: 'node-2',
      type: 'cab',
      title: 'Airport/Station Cab Transfer',
      sub: 'Pune Hub → Grand Hyatt',
      scheduledStart: cabStart,
      scheduledEnd: cabEnd,
      actualStart: cabStart,
      actualEnd: cabEnd,
      buffer: 45,
      status: 'healthy',
      disruptionReason: '',
      delayMinutes: 0,
      info: 'Pickup Zone B • Uber Select'
    },
    {
      id: 'node-3',
      type: 'hotel',
      title: 'Grand Hyatt Check-In',
      sub: 'Pune Premium Stay',
      scheduledStart: checkinTime,
      scheduledEnd: 'Onwards',
      actualStart: checkinTime,
      actualEnd: 'Onwards',
      buffer: 0,
      status: 'healthy',
      disruptionReason: '',
      delayMinutes: 0,
      info: 'Premium Suite Room • Reception Desk'
    }
  ];
};

// Helper to add minutes to 24h "HH:MM" format
function addMinutesToTime(timeStr, mins) {
  if (!timeStr) return "08:00";
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) {
    h = 8; m = 0;
  }
  m += mins;
  h += Math.floor(m / 60);
  m = m % 60;
  h = h % 24;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Helper to get buffer minutes between end of node 1 and start of node 2
function getMinutesBetween(time1, time2) {
  if (!time1 || !time2 || time1 === 'Onwards' || time2 === 'Onwards' || time1.includes('CANCELLED') || time2.includes('CANCELLED') || time1.includes('COMPROMISED') || time2.includes('COMPROMISED')) return 0;
  
  // Clean potential delay string elements (e.g. "14:15 (Delayed)" -> "14:15")
  const cleanT1 = time1.split(' ')[0];
  const cleanT2 = time2.split(' ')[0];
  
  const [h1, m1] = cleanT1.split(':').map(Number);
  const [h2, m2] = cleanT2.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
  
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

// Generate unique Trip Reference
function generateTripRef() {
  return "TR-" + Math.floor(100000 + Math.random() * 900000);
}

function App() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentPage, setCurrentPage] = useState('home');
  const [disruptionState, setDisruptionState] = useState('healthy'); // 'healthy' | 'disrupted' | 'resolved'
  
  // Auth state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userAuth, setUserAuth] = useState({
    loggedIn: false,
    user: null
  });

  // Search State Tab: flights | trains | cabs | hotels
  const [searchTab, setSearchTab] = useState('flights');
  
  // Custom Node Builder Input States
  const [builderFrom, setBuilderFrom] = useState('');
  const [builderTo, setBuilderTo] = useState('');
  const [builderDate, setBuilderDate] = useState('2026-08-31');
  const [builderTime, setBuilderTime] = useState('08:00');
  const [builderDuration, setBuilderDuration] = useState(75);
  const [builderAirways, setBuilderAirways] = useState('');
  const [builderTrainName, setBuilderTrainName] = useState('');
  const [builderCabService, setBuilderCabService] = useState('');
  const [builderHotelName, setBuilderHotelName] = useState('');

  // Temporary constructed nodes
  const [builderNodes, setBuilderNodes] = useState([]);

  // Active Trip Graph Nodes State
  const [tripRefNum, setTripRefNum] = useState('TR-998827');
  const [currentTrip, setCurrentTrip] = useState(seedInitialTripNodes);

  // Chaos Lab Disruption Inputs
  const [selectedDisruptNode, setSelectedDisruptNode] = useState('');
  const [disruptType, setDisruptType] = useState('delay'); // 'delay' | 'cancel' | 'lockout'
  const [disruptDelay, setDisruptDelay] = useState(180);
  const [disruptReason, setDisruptReason] = useState('Weather');

  // Cascade Impact Metrics
  const [impactMetrics, setImpactMetrics] = useState({
    delayMinutes: 0,
    brokenConnections: 0,
    affectedNodes: 0
  });

  // Success rebooking state
  const [successPlanAccepted, setSuccessPlanAccepted] = useState(null); // 'fastest' | 'cheapest' | 'refund'

  // Restaurant Filters
  const [restaurantFilter, setRestaurantFilter] = useState('All');

  // Support Portal State
  const [supportTab, setSupportTab] = useState('faq');
  const [bugSummary, setBugSummary] = useState('');
  const [bugSteps, setBugSteps] = useState('');
  const [bugSeverity, setBugSeverity] = useState('Medium');
  const [bugScreenshot, setBugScreenshot] = useState(null);
  const [bugTicketId, setBugTicketId] = useState('');
  const [bugSuccess, setBugSuccess] = useState(false);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Chatbot State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am your TripResQ AI Protection Assistant. How can I help you recover your travel today?' }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Auth form state
  const [authTab, setAuthTab] = useState('signin');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Selected tab default durations are updated synchronously in the tab onClick handler.

  // Sync translation key lookup helper
  const t = (key) => {
    return TRANSLATIONS[currentLanguage][key] || TRANSLATIONS['en'][key] || key;
  };

  // Build sequential multi-node travel graph
  const buildTripNodes = (mode, from, to, date, startTime, addCab, addHotel) => {
    const transitName = mode === 'flights' || mode === 'flight'
      ? `Air India AI-${Math.floor(100 + Math.random() * 900)}`
      : `Deccan Express DEC-${Math.floor(100 + Math.random() * 900)}`;

    const transitDuration = mode === 'flights' || mode === 'flight' ? 75 : 180; // flights are faster
    const nodes = [];

    // Node 1: Primary Transit
    const transitEnd = addMinutesToTime(startTime, transitDuration);
    nodes.push({
      id: 'node-1',
      type: mode === 'flights' || mode === 'flight' ? 'flight' : 'train',
      title: transitName,
      sub: `${from} → ${to}`,
      scheduledStart: startTime,
      scheduledEnd: transitEnd,
      actualStart: startTime,
      actualEnd: transitEnd,
      buffer: addCab ? 30 : 0,
      status: 'healthy',
      disruptionReason: '',
      delayMinutes: 0,
      info: mode === 'flights' || mode === 'flight' ? 'Gate 14B • Terminal 2' : 'Platform 4 • Main Terminal'
    });

    let lastEndTime = transitEnd;

    // Node 2: Optional Cab Connection
    if (addCab) {
      const cabStart = addMinutesToTime(lastEndTime, 30); // 30 mins buffer
      const cabEnd = addMinutesToTime(cabStart, 45); // 45 mins cab ride
      nodes.push({
        id: 'node-2',
        type: 'cab',
        title: 'Airport/Station Cab Transfer',
        sub: `${to} Hub → Grand Hyatt`,
        scheduledStart: cabStart,
        scheduledEnd: cabEnd,
        actualStart: cabStart,
        actualEnd: cabEnd,
        buffer: addHotel ? 45 : 0,
        status: 'healthy',
        disruptionReason: '',
        delayMinutes: 0,
        info: 'Pickup Zone B • Uber Select'
      });
      lastEndTime = cabEnd;
    }

    // Node 3: Optional Hotel check-in
    if (addHotel) {
      const checkinTime = addMinutesToTime(lastEndTime, 45); // 45 mins buffer
      nodes.push({
        id: 'node-3',
        type: 'hotel',
        title: 'Grand Hyatt Check-In',
        sub: `${to} Premium Stay`,
        scheduledStart: checkinTime,
        scheduledEnd: 'Onwards',
        actualStart: checkinTime,
        actualEnd: 'Onwards',
        buffer: 0,
        status: 'healthy',
        disruptionReason: '',
        delayMinutes: 0,
        info: 'Premium Suite Room • Reception Desk'
      });
    }

    setCurrentTrip(nodes);
    setSelectedDisruptNode(nodes[0]?.id || '');
    setTripRefNum(generateTripRef());
    setDisruptionState('healthy');
    setImpactMetrics({ delayMinutes: 0, brokenConnections: 0, affectedNodes: 0 });
  };

  // Add node dynamically as user inputs details in the form
  const handleAddBuilderNode = (e) => {
    e.preventDefault();
    
    let title = '';
    let info = '';
    let type = searchTab; // flights | trains | cabs | hotels
    let from = builderFrom.trim();
    let to = builderTo.trim();
    
    if (type === 'flights') {
      type = 'flight';
      title = builderAirways.trim() || 'Custom Flight';
      info = 'Terminal Gateway';
    } else if (type === 'trains') {
      type = 'train';
      title = builderTrainName.trim() || 'Custom Train';
      info = 'Platform Route';
    } else if (type === 'cabs') {
      type = 'cab';
      title = builderCabService.trim() || 'Custom Cab';
      info = 'Pickup Area';
    } else if (type === 'hotels') {
      type = 'hotel';
      title = builderHotelName.trim() || 'Custom Hotel Stay';
      info = 'Reception Lobby';
      to = from; 
    }

    if (!from && type !== 'hotel') {
      alert("Please enter a From Location!");
      return;
    }
    if (!to) {
      alert("Please enter a Destination Location!");
      return;
    }
    if (!title) {
      alert("Please enter the name details (Airways, Train Name, Cab service, or Hotel name)!");
      return;
    }

    const scheduledStart = builderTime;
    const scheduledEnd = type === 'hotel' ? 'Onwards' : addMinutesToTime(builderTime, builderDuration);

    const newNode = {
      id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      sub: type === 'hotel' ? `${to}` : `${from} → ${to}`,
      scheduledStart,
      scheduledEnd,
      actualStart: scheduledStart,
      actualEnd: scheduledEnd,
      buffer: 0,
      status: 'healthy',
      disruptionReason: '',
      delayMinutes: 0,
      info
    };

    setBuilderNodes(prev => {
      const updated = [...prev, newNode];
      // Recalculate buffers
      for (let i = 0; i < updated.length - 1; i++) {
        if (updated[i].actualEnd !== 'Onwards' && updated[i + 1].actualStart !== 'Onwards') {
          updated[i].buffer = getMinutesBetween(updated[i].actualEnd, updated[i + 1].actualStart);
        }
      }
      return updated;
    });

    // Reset inputs for standard chain workflow
    if (type !== 'hotel') {
      setBuilderFrom(to); // Next node starts where this one ended
      setBuilderTo('');
    }
    if (scheduledEnd !== 'Onwards') {
      setBuilderTime(addMinutesToTime(scheduledEnd, 30)); // Next starts 30 mins after
    }
    setBuilderAirways('');
    setBuilderTrainName('');
    setBuilderCabService('');
    setBuilderHotelName('');
  };

  const handleRemoveBuilderNode = (nodeId) => {
    setBuilderNodes(prev => {
      const updated = prev.filter(n => n.id !== nodeId);
      for (let i = 0; i < updated.length - 1; i++) {
        if (updated[i].actualEnd !== 'Onwards' && updated[i + 1].actualStart !== 'Onwards') {
          updated[i].buffer = getMinutesBetween(updated[i].actualEnd, updated[i + 1].actualStart);
        }
      }
      return updated;
    });
  };

  const handleLockJourney = () => {
    if (builderNodes.length === 0) return;
    setCurrentTrip(builderNodes);
    setBuilderNodes([]);
    setTripRefNum(generateTripRef());
    setDisruptionState('healthy');
    setImpactMetrics({ delayMinutes: 0, brokenConnections: 0, affectedNodes: 0 });
    setCurrentPage('my-trip');
  };

  // Cascade ripple effects calculation engine
  const triggerDisruptionCascade = (nodeId, type, delayMins, reason) => {
    let updatedNodes = currentTrip.map(n => ({ ...n }));
    let targetIndex = updatedNodes.findIndex(n => n.id === nodeId);
    
    if (targetIndex === -1) return;

    let cascadeDelay = 0;
    let brokenCount = 0;
    let affectedCount = 0;

    const targetNode = updatedNodes[targetIndex];
    affectedCount++;
    targetNode.disruptionReason = reason;

    if (type === 'delay') {
      targetNode.status = 'delayed';
      targetNode.delayMinutes = delayMins;
      targetNode.actualStart = addMinutesToTime(targetNode.scheduledStart, delayMins);
      if (targetNode.scheduledEnd !== 'Onwards') {
        targetNode.actualEnd = addMinutesToTime(targetNode.scheduledEnd, delayMins);
      }
      cascadeDelay = delayMins;
    } else {
      targetNode.status = 'broken';
      targetNode.delayMinutes = 360;
      targetNode.actualStart = 'CANCELLED';
      targetNode.actualEnd = 'CANCELLED';
      cascadeDelay = 360;
      brokenCount++;
    }

    for (let i = targetIndex + 1; i < updatedNodes.length; i++) {
      const prevNode = updatedNodes[i - 1];
      const currNode = updatedNodes[i];

      if (prevNode.status === 'broken' || prevNode.actualEnd === 'CANCELLED' || prevNode.actualEnd === 'COMPROMISED') {
        currNode.status = 'broken';
        currNode.actualStart = 'COMPROMISED';
        currNode.actualEnd = 'COMPROMISED';
        currNode.delayMinutes = 360;
        brokenCount++;
        affectedCount++;
      } else {
        const prevActualEnd = prevNode.actualEnd;
        const currSchedStart = currNode.scheduledStart;

        if (prevActualEnd !== 'Onwards' && currSchedStart !== 'Onwards') {
          const bufferRemaining = getMinutesBetween(prevActualEnd, currSchedStart);

          if (bufferRemaining < 0) {
            currNode.status = 'broken';
            currNode.delayMinutes = Math.abs(bufferRemaining);
            currNode.actualStart = addMinutesToTime(currNode.scheduledStart, Math.abs(bufferRemaining));
            if (currNode.scheduledEnd !== 'Onwards') {
              currNode.actualEnd = addMinutesToTime(currNode.scheduledEnd, Math.abs(bufferRemaining));
            }
            brokenCount++;
            affectedCount++;
          } else {
            currNode.status = 'healthy';
            currNode.actualStart = currNode.scheduledStart;
            currNode.actualEnd = currNode.scheduledEnd;
          }
        } else if (currNode.scheduledEnd === 'Onwards') {
          const prevEnd = prevNode.actualEnd;
          const hotelCheckin = currNode.scheduledStart;
          const bufferRemaining = getMinutesBetween(prevEnd, hotelCheckin);
          
          if (bufferRemaining < -120) {
            currNode.status = 'delayed';
            currNode.actualStart = prevEnd;
            affectedCount++;
          }
        }
      }
    }

    setCurrentTrip(updatedNodes);
    setDisruptionState('disrupted');
    setImpactMetrics({
      delayMinutes: cascadeDelay,
      brokenConnections: brokenCount,
      affectedNodes: affectedCount
    });
  };

  const handleResetJourney = () => {
    buildTripNodes(
      currentTrip[0]?.type === 'flight' ? 'flight' : 'train',
      searchFrom,
      searchTo,
      searchDate,
      searchTime,
      currentTrip.some(n => n.type === 'cab'),
      currentTrip.some(n => n.type === 'hotel')
    );
  };

  const handleAcceptPlan = (planKey) => {
    setSuccessPlanAccepted(planKey);
    setTimeout(() => {
      const restored = currentTrip.map((node, index) => {
        if (index === 0 && planKey === 'fastest') {
          return {
            ...node,
            title: node.type === 'flight' ? '⚡ Premium Rescheduled Flight' : '⚡ Express Intercity Rail',
            status: 'healthy',
            actualStart: node.scheduledStart,
            actualEnd: node.scheduledEnd,
            delayMinutes: 0,
            disruptionReason: ''
          };
        }
        return {
          ...node,
          status: 'healthy',
          actualStart: node.scheduledStart,
          actualEnd: node.scheduledEnd,
          delayMinutes: 0,
          disruptionReason: ''
        };
      });

      if (planKey === 'refund') {
        setCurrentPage('home');
        buildTripNodes('flights', 'Mumbai (BOM)', 'Pune (PNQ)', '2026-08-31', '08:00', true, true);
      } else {
        setCurrentTrip(restored);
        setDisruptionState('resolved');
        setCurrentPage('my-trip');
      }
      setSuccessPlanAccepted(null);
    }, 2200);
  };

  // Chatbot Query Submit Handler
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: chatMessages.length + 1, sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    const textQuery = chatInput.toLowerCase();
    setChatInput('');
    setIsChatTyping(true);

    setTimeout(() => {
      let botResponse = "I understand your query. Your TripResQ Protection Guard is active. If any transit node is delayed or cancelled, you can click on '⚡ Chaos Lab' to trigger a test disruption, then view the recovery options on the 'My Trips' timeline.";
      
      if (textQuery.includes('delay') || textQuery.includes('late')) {
        botResponse = "If a delay is detected (like the 3-hour delay simulated in Chaos Lab), our system flags compromised connections and offers three rescue plans: Fastest, Budget (with vouchers), and Max Refund. Go to the 'My Trips' timeline and click 'View Smart Rescue Plans' to see them!";
      } else if (textQuery.includes('refund') || textQuery.includes('cancel')) {
        botResponse = "Under TripResQ protection guidelines, if your trip is compromised and you choose to cancel, the 'Max Refund Plan' guarantees a 100% refund on all connected bookings. Refunds are processed immediately!";
      } else if (textQuery.includes('hotel') || textQuery.includes('cab')) {
        botResponse = "Yes, both cab reschedules and hotel arrival warnings are automated. Once you accept a recovery plan, we automatically notify our transport and lodging partners.";
      }

      setChatMessages(prev => [...prev, { id: prev.length + 1, sender: 'bot', text: botResponse }]);
      setIsChatTyping(false);
    }, 1200);
  };

  const handleQuickChatPrompt = (promptText) => {
    setChatInput(promptText);
  };

  // Bug report submit handler
  const handleBugSubmit = (e) => {
    e.preventDefault();
    if (!bugSummary.trim()) return;
    setBugTicketId("BUG-" + Math.floor(1000 + Math.random() * 9000));
    setBugSuccess(true);
    setTimeout(() => {
      setBugSuccess(false);
      setBugSummary('');
      setBugSteps('');
      setBugScreenshot(null);
    }, 3000);
  };

  // Feedback submit handler
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (feedbackRating === 0) return;
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setFeedbackRating(0);
      setFeedbackComment('');
      setSelectedTags([]);
    }, 3000);
  };

  // Auth Handler
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    setUserAuth({
      loggedIn: true,
      user: {
        name: authName || authEmail.split('@')[0],
        email: authEmail
      }
    });
    setShowAuthModal(false);
    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
    setCurrentPage('home'); // Redirect to home page where builder is unlocked
  };

  // Restaurant details filtered
  const activeDestination = currentTrip[0]?.sub?.split('→')[1]?.trim()?.split(' ')[0] || 'Pune';
  
  const filteredRestaurants = RESTAURANTS.filter(r => {
    const isCity = r.city.toLowerCase() === activeDestination.toLowerCase();
    if (!isCity) return false;
    if (restaurantFilter === 'All') return true;
    return r.tags.includes(restaurantFilter);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col justify-between selection:bg-[#287DFA] selection:text-white font-sans antialiased">
      
      {/* --- Global Navigation Header --- */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-105 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <button 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[#287DFA] focus:outline-none cursor-pointer"
          >
            <div className="p-1 bg-[#287DFA] text-white rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <span className="font-serif font-extrabold">{t('logo')}</span>
          </button>

          {/* Desktop Nav Links - Gated by Login */}
          {userAuth.loggedIn && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-655">
              <button 
                onClick={() => setCurrentPage('home')}
                className={`hover:text-[#287DFA] transition py-1 cursor-pointer ${currentPage === 'home' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : ''}`}
              >
                {t('navHome')}
              </button>
              <button 
                onClick={() => setCurrentPage('my-trip')}
                className={`hover:text-[#287DFA] transition py-1 flex items-center gap-1.5 cursor-pointer ${currentPage === 'my-trip' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : ''}`}
              >
                {t('navMyTrips')}
                {disruptionState === 'disrupted' && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7700] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF7700]"></span>
                  </span>
                )}
              </button>
              <button 
                onClick={() => setCurrentPage('restaurants')}
                className={`hover:text-[#287DFA] transition py-1 cursor-pointer ${currentPage === 'restaurants' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : ''}`}
              >
                {t('navRestaurants')}
              </button>
              <button 
                onClick={() => setCurrentPage('support')}
                className={`hover:text-[#287DFA] transition py-1 cursor-pointer ${currentPage === 'support' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : ''}`}
              >
                {t('navSupport')}
              </button>
            </nav>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Chaos Sandbox badge - Gated by Login */}
          {userAuth.loggedIn && (
            <button 
              onClick={() => setCurrentPage('chaos-lab')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition duration-200 cursor-pointer ${
                currentPage === 'chaos-lab' 
                  ? 'bg-[#FF7700] text-white shadow-md shadow-[#FF7700]/20'
                  : 'bg-orange-50 text-[#FF7700] hover:bg-orange-100 border border-orange-200/20'
              }`}
            >
              {t('navChaos')}
            </button>
          )}

          {/* Language Dropdown Selector */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-slate-200 bg-white rounded-full hover:bg-slate-50 transition cursor-pointer">
              <Globe className="w-3.5 h-3.5 text-[#287DFA]" />
              <span>{currentLanguage === 'en' ? 'EN' : currentLanguage === 'hi' ? 'हिन्दी' : 'मराठी'}</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-28 bg-white border border-slate-100 rounded-lg shadow-xl py-1 opacity-0 pointer-events-none group-focus-within:opacity-100 group-focus-within:pointer-events-auto group-hover:opacity-100 group-hover:pointer-events-auto transition duration-150 z-50">
              <button 
                onClick={() => setCurrentLanguage('en')}
                className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 hover:text-[#287DFA]"
              >
                English
              </button>
              <button 
                onClick={() => setCurrentLanguage('hi')}
                className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 hover:text-[#287DFA]"
              >
                हिन्दी
              </button>
              <button 
                onClick={() => setCurrentLanguage('mr')}
                className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 hover:text-[#287DFA]"
              >
                मराठी
              </button>
            </div>
          </div>

          {/* Auth System */}
          {userAuth.loggedIn ? (
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-full hover:bg-slate-50 transition cursor-pointer">
                <div className="w-6 h-6 bg-[#287DFA] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {userAuth.user?.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-700">{userAuth.user?.name}</span>
              </button>
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-slate-100 rounded-lg shadow-xl py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition duration-150 z-50">
                <div className="px-3 py-2 border-b border-slate-50 text-[10px] text-slate-400 truncate">
                  {userAuth.user?.email}
                </div>
                <button 
                  onClick={() => setUserAuth({ loggedIn: false, user: null })}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> {t('signOut')}
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => {
                setAuthTab('signin');
                setShowAuthModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#287DFA] hover:bg-[#1C6BDB] text-white text-xs font-bold rounded-full transition shadow-sm cursor-pointer active:scale-95"
            >
              <User className="w-4 h-4" /> {t('signIn')}
            </button>
          )}
        </div>
      </header>

      {/* --- Main Content Stage --- */}
      <div className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          
          {/* ================= PAGE 1: HOMEPAGE WITH AUTH GATED BUILDER ================= */}
          {currentPage === 'home' && (
            <motion.div
              key="home-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center"
            >
              {/* Hero Banner Section */}
              <section className="w-full bg-gradient-to-b from-[#EAF3FF] to-white py-16 px-6 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-blue-100/40 blur-xl pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-44 h-44 rounded-full bg-orange-100/40 blur-2xl pointer-events-none" />

                <div className="max-w-3xl z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#287DFA] mb-4 shadow-sm uppercase tracking-wider font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t('protectionBadge')}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4 font-serif">
                    {t('tagline').split('.')[0]}.<br />
                    <span className="text-[#287DFA]">{t('tagline').split('.')[1]}</span>
                  </h1>
                  <p className="text-slate-650 text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed font-semibold">
                    {t('subTagline')}
                  </p>
                </div>

                {/* Gated Builder Form Render */}
                <div className="w-full max-w-4xl z-20">
                  {userAuth.loggedIn ? (
                    /* Authenticated Custom Node Builder */
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 text-left mt-2">
                      <div className="flex gap-2 border-b border-slate-100 pb-4 mb-6">
                        {['flights', 'trains', 'cabs', 'hotels'].map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => {
                              setSearchTab(tab);
                              if (tab === 'flights') setBuilderDuration(75);
                              else if (tab === 'trains') setBuilderDuration(180);
                              else if (tab === 'cabs') setBuilderDuration(45);
                              else setBuilderDuration(0);
                            }}
                            className={`px-4 py-2 rounded-full text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 transition cursor-pointer ${
                              searchTab === tab ? 'bg-[#EAF3FF] text-[#287DFA]' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {tab === 'flights' ? t('flightTab')
                              : tab === 'trains' ? t('trainTab')
                              : tab === 'cabs' ? t('cabTab')
                              : t('hotelTab')}
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleAddBuilderNode} className="space-y-6">
                        {/* Dynamic Input Fields based on Active Tab */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          
                          {/* From location (Not for Hotels) */}
                          {searchTab !== 'hotels' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('fromLabel')}</label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                  type="text"
                                  required
                                  value={builderFrom}
                                  onChange={(e) => setBuilderFrom(e.target.value)}
                                  placeholder={t('typePlaceholder')}
                                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA]"
                                />
                              </div>
                            </div>
                          )}

                          {/* To Location (Hotel check-in destination) */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {searchTab === 'hotels' ? t('toLabel').split(' ')[0] + " Location" : t('toLabel')}
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                              <input
                                type="text"
                                required
                                value={builderTo}
                                onChange={(e) => setBuilderTo(e.target.value)}
                                placeholder={t('typePlaceholder')}
                                className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA]"
                              />
                            </div>
                          </div>

                          {/* Date */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('dateLabel')}</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                              <input
                                type="date"
                                required
                                value={builderDate}
                                onChange={(e) => setBuilderDate(e.target.value)}
                                className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-250 text-xs font-semibold focus:outline-none focus:border-[#287DFA]"
                              />
                            </div>
                          </div>

                          {/* Start Time */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('timeLabel')}</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                              <input
                                type="time"
                                required
                                value={builderTime}
                                onChange={(e) => setBuilderTime(e.target.value)}
                                className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-250 text-xs font-semibold focus:outline-none focus:border-[#287DFA]"
                              />
                            </div>
                          </div>

                          {/* Duration in Minutes (Except Hotel) */}
                          {searchTab !== 'hotels' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('durationLabel')}</label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  value={builderDuration}
                                  onChange={(e) => setBuilderDuration(Number(e.target.value))}
                                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA]"
                                />
                              </div>
                            </div>
                          )}

                          {/* Specific Identity Inputs */}
                          {searchTab === 'flights' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-[#287DFA] uppercase tracking-wider">{t('airwaysLabel')}</label>
                              <input
                                type="text"
                                required
                                value={builderAirways}
                                onChange={(e) => setBuilderAirways(e.target.value)}
                                placeholder="E.g. IndiGo, Air India"
                                className="w-full h-10 px-3 rounded-lg border border-[#287DFA]/40 bg-blue-50/10 text-xs font-bold focus:outline-none focus:border-[#287DFA]"
                              />
                            </div>
                          )}

                          {searchTab === 'trains' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-[#287DFA] uppercase tracking-wider">{t('trainNameLabel')}</label>
                              <input
                                type="text"
                                required
                                value={builderTrainName}
                                onChange={(e) => setBuilderTrainName(e.target.value)}
                                placeholder="E.g. Shatabdi Exp, Deccan Queen"
                                className="w-full h-10 px-3 rounded-lg border border-[#287DFA]/40 bg-blue-50/10 text-xs font-bold focus:outline-none focus:border-[#287DFA]"
                              />
                            </div>
                          )}

                          {searchTab === 'cabs' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-[#287DFA] uppercase tracking-wider">{t('cabServiceLabel')}</label>
                              <input
                                type="text"
                                required
                                value={builderCabService}
                                onChange={(e) => setBuilderCabService(e.target.value)}
                                placeholder="E.g. Uber Select, Ola Outstation"
                                className="w-full h-10 px-3 rounded-lg border border-[#287DFA]/40 bg-blue-50/10 text-xs font-bold focus:outline-none focus:border-[#287DFA]"
                              />
                            </div>
                          )}

                          {searchTab === 'hotels' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-[#287DFA] uppercase tracking-wider">{t('hotelNameLabel')}</label>
                              <input
                                type="text"
                                required
                                value={builderHotelName}
                                onChange={(e) => setBuilderHotelName(e.target.value)}
                                placeholder="E.g. Grand Hyatt, Taj Mahal Stay"
                                className="w-full h-10 px-3 rounded-lg border border-[#287DFA]/40 bg-blue-50/10 text-xs font-bold focus:outline-none focus:border-[#287DFA]"
                              />
                            </div>
                          )}

                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            className="px-6 h-10 bg-[#287DFA] hover:bg-[#1C6BDB] text-white text-xs font-extrabold rounded-lg transition shadow-md shadow-[#287DFA]/10 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                          >
                            {t('addNodeBtn')}
                          </button>
                        </div>
                      </form>

                      {/* Timeline live preview chain builder */}
                      <div className="border-t border-slate-100 mt-6 pt-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-extrabold tracking-wider uppercase text-slate-400 font-mono">
                            {t('livePreview')}
                          </h4>
                          {builderNodes.length > 0 && (
                            <button
                              onClick={handleLockJourney}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition shadow-md shadow-emerald-500/10 active:scale-98 flex items-center gap-1 cursor-pointer"
                            >
                              {t('lockTripBtn')}
                            </button>
                          )}
                        </div>

                        {builderNodes.length > 0 ? (
                          <div className="overflow-x-auto custom-scrollbar pb-3 pt-2 min-h-[170px] flex items-center justify-start">
                            <div className="flex items-center">
                              {builderNodes.map((node, idx) => (
                                <div key={node.id} className="flex items-center">
                                  
                                  {/* Preview Node Card */}
                                  <div className="w-56 p-3 bg-slate-50 border border-slate-200 rounded-xl relative hover:border-[#287DFA] transition group flex-shrink-0 shadow-xs">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveBuilderNode(node.id)}
                                      className="absolute -top-1.5 -right-1.5 p-1 bg-red-100 hover:bg-red-200 text-red-650 rounded-full cursor-pointer shadow-xs border border-red-200/50"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>

                                    <div className="flex items-center justify-between mb-2">
                                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-[#EAF3FF] text-[#287DFA]">
                                        {node.type}
                                      </span>
                                      <span className="text-[9px] text-slate-400 font-mono font-bold">
                                        {node.scheduledStart}
                                      </span>
                                    </div>
                                    <h5 className="font-extrabold text-xs text-slate-900 truncate font-serif">{node.title}</h5>
                                    <p className="text-[10px] text-slate-450 truncate mt-0.5">{node.sub}</p>
                                    
                                    {node.type !== 'hotel' && (
                                      <span className="text-[9px] text-slate-400 block mt-2 font-mono">
                                        End: {node.scheduledEnd}
                                      </span>
                                    )}
                                  </div>

                                  {/* Preview Timeline Bridge connector */}
                                  {idx < builderNodes.length - 1 && (
                                    <div className="w-12 h-[2px] bg-slate-205 relative flex items-center justify-center flex-shrink-0">
                                      <span className="absolute px-1.5 py-0.5 bg-white border border-slate-150 rounded-full text-[8px] font-bold text-slate-450 font-mono">
                                        {node.buffer}m
                                      </span>
                                    </div>
                                  )}

                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-slate-105 flex flex-col items-center justify-center gap-1.5">
                            <AlertCircle className="w-6 h-6 text-slate-350" />
                            <p className="text-xs text-slate-450 font-semibold">{t('noNodesYet')}</p>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    /* Guest Call-to-action banner */
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center flex flex-col items-center gap-4">
                      <div className="p-4 bg-[#EAF3FF] text-[#287DFA] rounded-full">
                        <ShieldCheck className="w-8 h-8 stroke-[2]" />
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 font-serif">{t('authPromptTitle')}</h3>
                      <p className="text-slate-500 text-xs max-w-md leading-relaxed">
                        {t('authPromptDesc')}
                      </p>
                      <button
                        onClick={() => {
                          setAuthTab('signin');
                          setShowAuthModal(true);
                        }}
                        className="px-6 h-10 bg-[#287DFA] hover:bg-[#1C6BDB] text-white text-xs font-bold rounded-lg transition shadow-md shadow-[#287DFA]/15 active:scale-95 cursor-pointer font-semibold"
                      >
                        Sign In Now
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Marketing Perks Grid - Shown for both Guest and Authed users */}
              <section className="max-w-6xl w-full px-6 py-16">
                <h2 className="text-2xl font-bold tracking-tight text-center text-slate-900 mb-10 font-serif">
                  {t('howItWorks')}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition">
                    <div className="p-3 rounded-xl bg-[#EAF3FF] text-[#287DFA]">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-lg text-slate-950 font-serif">{t('marketingTitle1')}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {t('marketingDesc1')}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition">
                    <div className="p-3 rounded-xl bg-orange-50 text-[#FF7700]">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-lg text-slate-955 font-serif">{t('marketingTitle2')}</h3>
                    <p className="text-slate-505 text-xs leading-relaxed">
                      {t('marketingDesc2')}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-555">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-lg text-slate-955 font-serif">{t('marketingTitle3')}</h3>
                    <p className="text-slate-505 text-xs leading-relaxed">
                      {t('marketingDesc3')}
                    </p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* ================= PAGE 2: "MY TRIP" LIVE TIMELINE VIEW ================= */}
          {currentPage === 'my-trip' && userAuth.loggedIn && (
            <motion.div
              key="my-trip-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-6"
            >
              {/* Trip Header Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
                    {t('tripHeaderTitle')} {currentTrip[currentTrip.length - 1]?.title || 'Destination'}
                  </h1>
                  <p className="text-slate-505 text-xs font-semibold mt-0.5">{t('tripReference')}: <span className="font-mono text-slate-800 font-bold">{tripRefNum}</span></p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="px-4 py-2 border border-slate-200 text-slate-655 hover:bg-slate-50 text-xs font-bold rounded-full transition cursor-pointer"
                  >
                    {t('backToBookings')}
                  </button>
                  <button 
                    onClick={() => alert('Itinerary emailed to your account!')}
                    className="px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-full hover:bg-slate-900 transition cursor-pointer"
                  >
                    {t('emailItinerary')}
                  </button>
                </div>
              </div>

              {/* Dynamic Alerts Banner */}
              <AnimatePresence mode="wait">
                {disruptionState === 'disrupted' ? (
                  <motion.div
                    key="disrupted-alert"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-855 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="p-2 bg-[#FF7700] text-white rounded-lg self-start">
                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 font-serif">{t('disruptTitle')}</h4>
                        <p className="text-xs text-slate-605 mt-1 leading-relaxed">
                          Disruption detected on travel graph node. Buffer windows compromised. 
                          We have calculated express recovery routes.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentPage('rescue')}
                      className="px-4 py-2 bg-[#FF7700] hover:bg-[#E06600] text-white text-xs font-extrabold rounded-lg transition shrink-0 shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      {t('viewRescuePlans')} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ) : disruptionState === 'resolved' ? (
                  <motion.div
                    key="resolved-alert"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="p-4 rounded-xl bg-emerald-50 border border-emerald-250 text-emerald-805 flex items-center gap-3 shadow-sm"
                  >
                    <div className="p-2 bg-emerald-555 text-white rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 font-serif">Itinerary Successfully Rescued</h4>
                      <p className="text-xs text-slate-600 mt-0.5">Your replacement bookings are verified. All buffers are back in safe parameters.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="healthy-alert"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="p-4 rounded-xl bg-[#EAF3FF] border border-blue-200 text-slate-805 flex items-center gap-3 shadow-sm"
                  >
                    <div className="p-2 bg-[#287DFA] text-white rounded-lg">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 font-serif">{t('healthyTitle')}</h4>
                      <p className="text-xs text-slate-655 mt-0.5">{t('healthyDesc')}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chronological Route Horizontal Timeline */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 overflow-hidden mt-2">
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">{t('timelineTitle')}</h3>

                <div className="overflow-x-auto custom-scrollbar pb-4 pt-2 flex items-center justify-start min-h-[220px]">
                  <div className="flex items-center min-w-full lg:min-w-0">
                    {currentTrip.map((node, index) => {
                      const isTargetDisrupted = node.status === 'delayed' || node.status === 'broken';
                      
                      return (
                        <div key={node.id} className="flex items-center">
                          {/* Node Card */}
                          <motion.div
                            layout
                            className={`w-64 p-4 rounded-xl border transition-all duration-300 shadow-sm flex-shrink-0 ${
                              node.status === 'broken'
                                ? 'border-red-500 bg-red-50/20 shadow-red-100'
                                : node.status === 'delayed'
                                ? 'border-[#FF7700] bg-orange-50/20 shadow-orange-100'
                                : 'border-slate-205 bg-white hover:border-[#287DFA]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide flex items-center gap-1 ${
                                node.status === 'broken'
                                  ? 'bg-red-105 text-red-655'
                                  : node.status === 'delayed'
                                  ? 'bg-orange-105 text-[#FF7700]'
                                  : 'bg-[#EAF3FF] text-[#287DFA]'
                              }`}>
                                {node.type === 'flight' ? '✈️ Flight' : node.type === 'train' ? '🚆 Train' : node.type === 'cab' ? '🚕 Cab' : '🏨 Hotel'}
                              </span>
                              
                              <span className="text-[10px] text-slate-400 font-bold font-mono">
                                {node.status === 'broken' ? t('connectionBroken') : node.status === 'delayed' ? t('delayed') : t('onTime')}
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-900 leading-tight text-sm font-serif">{node.title}</h4>
                            <p className="text-slate-400 text-[11px] mt-1 truncate">{node.sub}</p>

                            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">{t('scheduled')}</span>
                                <span className="text-xs font-semibold text-slate-555 font-mono">{node.scheduledStart} - {node.scheduledEnd}</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">{t('actual')}</span>
                                <span className={`text-xs font-extrabold font-mono ${
                                  node.status === 'broken' ? 'text-red-500' : node.status === 'delayed' ? 'text-[#FF7700]' : 'text-emerald-600'
                                }`}>
                                  {node.actualStart} - {node.actualEnd}
                                </span>
                              </div>
                            </div>

                            {/* Node Alert message */}
                            {node.status === 'delayed' && (
                              <div className="mt-3 p-1.5 rounded bg-orange-100/30 text-[9px] font-bold text-[#FF7700] flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>+{node.delayMinutes} mins delay ({node.disruptionReason || 'General'})</span>
                              </div>
                            )}

                            {node.status === 'broken' && (
                              <div className="mt-3 p-1.5 rounded bg-red-100/30 text-[9px] font-bold text-red-655 flex items-center gap-1 animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Missed Connection</span>
                              </div>
                            )}
                          </motion.div>

                          {/* Timeline connector bridge */}
                          {index < currentTrip.length - 1 && (
                            <div className="relative flex items-center justify-center w-20 flex-shrink-0">
                              <div className="h-[2px] w-full bg-slate-205">
                                <motion.div 
                                  className={`h-full ${isTargetDisrupted ? 'bg-red-400' : 'bg-emerald-400'}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: '100%' }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                              <div className="absolute z-10">
                                {isTargetDisrupted ? (
                                  <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[8px] font-bold text-red-650 whitespace-nowrap shadow-sm font-mono">
                                    {t('missed')}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[8px] font-bold text-emerald-655 whitespace-nowrap shadow-sm font-mono">
                                    {t('bufferLabel')}: {node.buffer}m
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick instructions to use Chaos Sandbox */}
              <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="p-2 rounded-xl bg-white text-[#287DFA]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-serif">Simulate Delays in the Chaos Lab</h4>
                    <p className="text-xs text-slate-655 leading-normal mt-0.5">
                      To mock complex multi-node failures and explore our instant auto-rebooking engine, use the dedicated <span className="font-semibold text-[#287DFA]">⚡ Chaos Lab</span> sandbox at the top right of the navigation bar.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentPage('chaos-lab')}
                  className="px-4 py-2 bg-[#287DFA] text-white text-xs font-bold rounded-xl hover:bg-[#1C6BDB] transition cursor-pointer whitespace-nowrap"
                >
                  Open Sandbox
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= PAGE 3: THE RESCUE CENTER ================= */}
          {currentPage === 'rescue' && userAuth.loggedIn && (
            <motion.div
              key="rescue-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-6"
            >
              {/* Rescue Portal Alert Banner */}
              <div className="p-6 rounded-2xl bg-[#FF7700] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
                <div className="absolute left-1/3 top-0 w-24 h-24 rounded-full bg-white/5 blur-lg pointer-events-none" />

                <div className="z-10 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-white mb-3 tracking-wider uppercase font-mono">
                    🛡️ TripResQ Guard Active
                  </span>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 font-serif">{t('rescueHeader')}</h1>
                  <p className="text-white/95 text-xs md:text-sm leading-relaxed">
                    {t('rescueSub')}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentPage('my-trip')}
                  className="px-4 py-2 bg-white text-[#FF7700] font-extrabold hover:bg-slate-100 text-xs rounded-xl transition shrink-0 z-10 shadow cursor-pointer"
                >
                  {t('backToTimeline')}
                </button>
              </div>

              {/* 3 Recovery alternatives */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                
                {/* Fastest Plan */}
                <div className="bg-white rounded-2xl border-2 border-[#287DFA] shadow-lg flex flex-col justify-between relative overflow-hidden hover:scale-[1.01] transition duration-200">
                  <div className="bg-[#287DFA] text-white text-[9px] font-extrabold text-center py-1 tracking-wider uppercase font-mono">
                    ⭐ Recommended Recovery
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-[#EAF3FF] text-[#287DFA]">
                        <Zap className="w-6 h-6 animate-pulse" />
                      </div>
                      <span className="text-[10px] font-bold text-[#287DFA] bg-[#EAF3FF] px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">Fastest</span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 font-serif">⚡ Express Route Shift</h3>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Rescheduled Premium Transit</p>
                    </div>

                    <p className="text-slate-505 text-xs leading-relaxed">
                      Reschedule transit to next immediate express connection. All downstream cab pick-up schedules are automatically shifted. Hotel notified of late arrival.
                    </p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] flex flex-col gap-1.5 font-semibold">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Transit Shift</span>
                        <span className="text-slate-700">Next Departure (Rescheduled)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cab Pickup</span>
                        <span className="text-emerald-600">Updated Automatically</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hotel Check-in</span>
                        <span className="text-emerald-600">Warning Alert Dispatched</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50/60 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-505 text-xs font-semibold">TripResQ Cost</span>
                      <span className="text-base font-extrabold text-[#287DFA]">
                        {t('free')} <span className="text-[10px] text-slate-400 line-through font-normal">₹1,500</span>
                      </span>
                    </div>
                    <button
                      onClick={() => handleAcceptPlan('fastest')}
                      disabled={successPlanAccepted !== null}
                      className="w-full h-10 bg-[#287DFA] hover:bg-[#1C6BDB] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      {successPlanAccepted === 'fastest' ? 'Processing...' : t('acceptPlan')}
                    </button>
                  </div>
                </div>

                {/* Budget Plan */}
                <div className="bg-white rounded-2xl border border-slate-205 shadow-sm flex flex-col justify-between overflow-hidden hover:scale-[1.01] transition duration-200">
                  <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF7700]">
                        <RefreshCw className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-[#FF7700] bg-orange-50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">Budget</span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 font-serif">💰 Delayed Coach Reschedule</h3>
                      <p className="text-xs text-slate-405 mt-0.5 font-semibold">Off-Peak Transit Reschedule</p>
                    </div>

                    <p className="text-slate-505 text-xs leading-relaxed">
                      Reschedule to later connecting transit node. Minimizes immediate cost by absorbing longer delay, backed by compensation voucher.
                    </p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] flex flex-col gap-1.5 font-semibold">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Transit Shift</span>
                        <span className="text-slate-700">Delayed by 3.5 hrs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Compensation</span>
                        <span className="text-emerald-600">₹600 Travel Voucher</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hotel Check-in</span>
                        <span className="text-orange-500">Postponed Reservation</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-55/60 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-505 text-xs font-semibold">Compensation Credit</span>
                      <span className="text-base font-extrabold text-slate-800">₹600 Credit Back</span>
                    </div>
                    <button
                      onClick={() => handleAcceptPlan('cheapest')}
                      disabled={successPlanAccepted !== null}
                      className="w-full h-10 bg-slate-955 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer active:scale-98"
                    >
                      {successPlanAccepted === 'cheapest' ? 'Processing...' : t('acceptPlan')}
                    </button>
                  </div>
                </div>

                {/* Refund Plan */}
                <div className="bg-white rounded-2xl border border-slate-205 shadow-sm flex flex-col justify-between overflow-hidden hover:scale-[1.01] transition duration-200">
                  <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-red-50 text-red-500">
                        <Trash2 className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-red-655 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">Cancellation</span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 font-serif">💸 Max Refund Claim</h3>
                      <p className="text-xs text-slate-450 mt-0.5 font-semibold">Cancel & Full Claim</p>
                    </div>

                    <p className="text-slate-505 text-xs leading-relaxed">
                      Cancel all disrupted and downstream nodes immediately. Initiate 100% refund claims processed under TripResQ protective clauses.
                    </p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] flex flex-col gap-1.5 font-semibold">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Refund Eligible</span>
                        <span className="text-emerald-600">100% Full Refund</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Processing</span>
                        <span className="text-slate-700">Immediate Initiated</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cancellation Cost</span>
                        <span className="text-slate-700">₹0 Fee</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50/60 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-505 text-xs font-semibold">Refund Amount</span>
                      <span className="text-base font-extrabold text-emerald-600">100% {t('refund')}</span>
                    </div>
                    <button
                      onClick={() => handleAcceptPlan('refund')}
                      disabled={successPlanAccepted !== null}
                      className="w-full h-10 border border-slate-305 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-98"
                    >
                      {successPlanAccepted === 'refund' ? 'Processing...' : t('acceptPlan')}
                    </button>
                  </div>
                </div>

              </div>

              {/* Success Feedback Modal Simulation */}
              <AnimatePresence>
                {successPlanAccepted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/45 backdrop-blur-xs p-6"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-slate-100 flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-555 mb-2">
                        <Check className="w-8 h-8 stroke-[3]" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 font-serif font-serif">Trip Recovered!</h3>
                      <p className="text-xs text-slate-550 leading-relaxed">
                        We've updated your itinerary vouchers and notified the cab operator and hotel staff. Your new boarding pass is on its way.
                      </p>
                      <span className="text-[10px] text-slate-450 font-mono tracking-wider animate-pulse">Updating timeline view...</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ================= PAGE 4: CHAOS LAB SANDBOX ================= */}
          {currentPage === 'chaos-lab' && userAuth.loggedIn && (
            <motion.div
              key="chaos-lab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-6"
            >
              <div className="border-b border-slate-205 pb-5">
                <span className="px-3 py-1 rounded-full bg-orange-100 text-[#FF7700] text-xs font-bold font-mono uppercase tracking-wider">
                  ⚡ Sandbox Mode
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-2 font-serif">{t('chaosTitle')}</h1>
                <p className="text-slate-505 text-xs mt-1 leading-relaxed">{t('chaosDesc')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Controls Card */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Disruption Parameters</h3>

                  {/* 1. Node selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-655 block">{t('selectNode')}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {currentTrip.map(node => (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => setSelectedDisruptNode(node.id)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                            selectedDisruptNode === node.id
                              ? 'border-[#287DFA] bg-[#EAF3FF]/40 text-[#287DFA]'
                              : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {node.type}
                          </span>
                          <span className="font-bold text-xs truncate text-slate-900">{node.title}</span>
                          <span className="text-[10px] font-semibold text-slate-450">{node.scheduledStart} - {node.scheduledEnd}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Disruption Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-655 block">{t('disruptType')}</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setDisruptType('delay')}
                        className={`py-2 px-3 rounded-lg border text-center text-xs font-bold transition cursor-pointer ${
                          disruptType === 'delay'
                            ? 'border-[#FF7700] bg-orange-50 text-[#FF7700]'
                            : 'border-slate-205 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        ⏱️ Delay
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisruptType('cancel')}
                        className={`py-2 px-3 rounded-lg border text-center text-xs font-bold transition cursor-pointer ${
                          disruptType === 'cancel'
                            ? 'border-red-500 bg-red-50 text-red-655'
                            : 'border-slate-205 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        ❌ Cancellation
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisruptType('lockout')}
                        className={`py-2 px-3 rounded-lg border text-center text-xs font-bold transition cursor-pointer ${
                          disruptType === 'lockout'
                            ? 'border-red-500 bg-red-50 text-red-655'
                            : 'border-slate-205 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        🔒 Terminal Lockout
                      </button>
                    </div>
                  </div>

                  {/* 3. Delay duration slider */}
                  {disruptType === 'delay' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <label className="text-xs font-bold text-slate-655">{t('delayAmount')}</label>
                        <span className="text-sm font-mono font-extrabold text-[#FF7700]">{disruptDelay} Mins ({(disruptDelay/60).toFixed(1)} hrs)</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="360"
                        step="15"
                        value={disruptDelay}
                        onChange={(e) => setDisruptDelay(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#FF7700]"
                      />
                    </div>
                  )}

                  {/* 4. Reason */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-655 block">{t('disruptReason')}</label>
                    <select
                      value={disruptReason}
                      onChange={(e) => setDisruptReason(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-bold bg-slate-50 focus:outline-none focus:border-[#FF7700] transition cursor-pointer appearance-none"
                    >
                      <option value="Severe Weather & Thunderstorms">Severe Weather & Thunderstorms</option>
                      <option value="Mechanical Failure & Engine Stall">Mechanical Failure & Engine Stall</option>
                      <option value="Rail/Air Traffic Congestion">Rail/Air Traffic Congestion</option>
                      <option value="Security Lockdown Alert">Security Lockdown Alert</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        triggerDisruptionCascade(selectedDisruptNode, disruptType, disruptDelay, disruptReason);
                        setCurrentPage('my-trip');
                      }}
                      className="flex-1 px-6 h-11 bg-[#FF7700] hover:bg-[#E06600] text-white font-extrabold rounded-xl transition shadow-md shadow-[#FF7700]/10 active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <Flame className="w-4 h-4" /> {t('triggerBtn')}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleResetJourney}
                      className="px-6 h-11 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
                    >
                      {t('resetBtn')}
                    </button>
                  </div>
                </div>

                {/* Metrics & Impact Panel */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-xl border border-slate-800">
                  <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-36 h-36 rounded-full bg-[#FF7700]/10 blur-xl pointer-events-none" />
                  
                  <div className="space-y-6 z-10">
                    <div className="flex items-center gap-2 text-orange-400">
                      <Sparkles className="w-5 h-5" />
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono">{t('impactTitle')}</h4>
                    </div>

                    <div className="space-y-4">
                      {/* Metric 1 */}
                      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-semibold">{t('downstreamDelay')}</span>
                        <span className="text-lg font-mono font-extrabold text-[#FF7700]">
                          {impactMetrics.delayMinutes > 0 ? `${impactMetrics.delayMinutes} mins` : '0 mins'}
                        </span>
                      </div>

                      {/* Metric 2 */}
                      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-semibold">{t('brokenConnections')}</span>
                        <span className="text-lg font-mono font-extrabold text-rose-500">
                          {impactMetrics.brokenConnections}
                        </span>
                      </div>

                      {/* Metric 3 */}
                      <div className="pb-1 flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-semibold">{t('affectedNodes')}</span>
                        <span className="text-lg font-mono font-extrabold text-orange-400">
                          {impactMetrics.affectedNodes}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 z-10">
                    <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 text-[11px] leading-relaxed text-slate-400 space-y-2">
                      <span className="font-extrabold text-white block uppercase tracking-wider font-mono text-[10px]">Real-Time Graph Impact</span>
                      Our ripple-effect calculator runs a dependency check on nodes sequentially. If a predecessor's arrival slips past the successor's buffer window, the node triggers a connection breach state.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= PAGE 5: LOCAL DINING & RESTAURANTS ================= */}
          {currentPage === 'restaurants' && userAuth.loggedIn && (
            <motion.div
              key="restaurants-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-6"
            >
              <div className="border-b border-slate-205 pb-5">
                <span className="px-3 py-1 rounded-full bg-[#EAF3FF] text-[#287DFA] text-xs font-bold font-mono uppercase tracking-wider">
                  🍽️ Transit Dining
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-2 font-serif">{t('diningTitle')}</h1>
                <p className="text-slate-500 text-xs mt-1">{t('diningDesc')} Near <span className="font-extrabold text-[#287DFA]">{activeDestination}</span> Hub.</p>
              </div>

              {/* Filters list */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">{t('all')}:</span>
                {['All', 'Pure Veg', 'Local Specialties', 'Fast Delivery', 'Open 24/7'].map(filterOption => (
                  <button
                    key={filterOption}
                    type="button"
                    onClick={() => setRestaurantFilter(filterOption)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      restaurantFilter === filterOption
                        ? 'bg-[#287DFA] text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-655 hover:bg-slate-50'
                    }`}
                  >
                    {filterOption === 'Pure Veg' ? t('vegOnly')
                     : filterOption === 'Local Specialties' ? t('specialties')
                     : filterOption === 'Fast Delivery' ? t('fastDelivery')
                     : filterOption === 'Open 24/7' ? t('open247')
                     : filterOption}
                  </button>
                ))}
              </div>

              {/* Restaurant Cards Grid */}
              {filteredRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredRestaurants.map(restaurant => (
                    <motion.div
                      layout
                      key={restaurant.id}
                      className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition"
                    >
                      <div className="h-44 relative bg-slate-100 overflow-hidden">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover hover:scale-105 transition duration-500"
                        />
                        {restaurant.open247 && (
                          <span className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> {t('open247')}
                          </span>
                        )}
                        <span className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                          📍 {restaurant.distance} {t('kmAway')}
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-extrabold text-sm text-slate-955 font-serif line-clamp-1">{restaurant.name}</h3>
                            <div className="flex items-center gap-1 shrink-0 text-amber-500 font-bold text-xs">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{restaurant.rating}</span>
                            </div>
                          </div>
                          <p className="text-[11px] font-semibold text-slate-500 line-clamp-1">{restaurant.cuisine}</p>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                          <span className="text-[10px] text-slate-400 font-semibold">{t('avgCost')}: <span className="font-extrabold text-slate-800 font-mono">₹{restaurant.cost}</span></span>
                          <button
                            onClick={() => alert(`Table booked successfully at ${restaurant.name}!`)}
                            className="px-3 py-1.5 bg-[#EAF3FF] hover:bg-[#287DFA] hover:text-white text-[#287DFA] text-[10px] font-bold rounded-lg transition cursor-pointer"
                          >
                            Book Table
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                  <Filter className="w-8 h-8 text-slate-300" />
                  <h4 className="font-bold text-slate-800 text-sm">No dining options match this filter</h4>
                  <p className="text-xs text-slate-450">Try changing your filter selections above.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ================= PAGE 6: SUPPORT HUB & CHATBOT CENTER ================= */}
          {currentPage === 'support' && userAuth.loggedIn && (
            <motion.div
              key="support-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-6"
            >
              <div className="border-b border-slate-200 pb-5">
                <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold font-mono uppercase tracking-wider">
                  📞 Help Center
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-2 font-serif">{t('supportTitle')}</h1>
                <p className="text-slate-550 text-xs mt-1">{t('supportDesc')}</p>
              </div>

              {/* Support tabs */}
              <div className="flex gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setSupportTab('faq')}
                  className={`px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    supportTab === 'faq' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : 'text-slate-505'
                  }`}
                >
                  {t('faqTab')}
                </button>
                <button
                  onClick={() => setSupportTab('bug')}
                  className={`px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    supportTab === 'bug' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : 'text-slate-505'
                  }`}
                >
                  {t('bugTab')}
                </button>
                <button
                  onClick={() => setSupportTab('feedback')}
                  className={`px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    supportTab === 'feedback' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : 'text-slate-505'
                  }`}
                >
                  {t('feedbackTab')}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Side: Content Tab Panels */}
                <div className="lg:col-span-2">
                  
                  {/* Tab 1: FAQs & Helpline */}
                  {supportTab === 'faq' && (
                    <div className="space-y-6">
                      {/* Helpline Box */}
                      <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex gap-3">
                          <div className="p-3 bg-rose-500 text-white rounded-xl self-start">
                            <ShieldAlert className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 font-serif">{t('sosHelpline')}</h4>
                            <p className="text-xs text-slate-600 mt-1 leading-normal font-semibold">
                              {t('sosDesc')}: <span className="font-extrabold text-rose-600 font-mono">1800-419-7377</span> (Toll-Free). Immediate vector backup deck active.
                            </p>
                          </div>
                        </div>
                        <a
                          href="tel:18004197377"
                          className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition shadow-sm whitespace-nowrap text-center animate-pulse"
                        >
                          Call SOS
                        </a>
                      </div>

                      {/* FAQs Grid */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-50 pb-2 font-serif">{t('faqTitle')}</h3>
                        
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-xs font-extrabold text-slate-900 font-serif">Q: How does the automatic rebooking guard work?</h4>
                            <p className="text-[11px] text-slate-505 leading-relaxed font-semibold">
                              TripResQ monitors flight and train schedules in real-time. If your transit is delayed and we compute a broken connection with your downstream travel (e.g. cab pickup or hotel stay), our engine automatically triggers pre-validated recovery routes and registers them for you at no cost.
                            </p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-extrabold text-slate-900 font-serif">Q: Are the rescue flights/trains completely free?</h4>
                            <p className="text-[11px] text-slate-505 leading-relaxed font-semibold">
                              Yes! All recovery travel is covered 100% under your TripResQ Protection plan. You don't pay a single rupee extra when choosing a replacement plan.
                            </p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-extrabold text-slate-900 font-serif">Q: How is hotel late check-in handled?</h4>
                            <p className="text-[11px] text-slate-555 leading-relaxed font-semibold">
                              If your arrival is delayed, our system automatically informs the hotel reception desk via API, sending check-in updates and preventing reservation cancellations for late arrival.
                            </p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-extrabold text-slate-900 font-serif">Q: Can I cancel a disrupted trip and get a full refund?</h4>
                            <p className="text-[11px] text-slate-555 leading-relaxed font-semibold">
                              Absolutely. The 'Max Refund Plan' option allows you to cancel all broken nodes and initiates instant full refunds directly to your bank account.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Bug Report Form */}
                  {supportTab === 'bug' && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 font-serif">{t('bugTitle')}</h3>
                        <p className="text-slate-450 text-[11px] mt-0.5 font-semibold">Spotted something broken? File a report so our engineers can fix it.</p>
                      </div>

                      <AnimatePresence mode="wait">
                        {bugSuccess ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-6 bg-emerald-50 border border-emerald-250 rounded-xl text-center flex flex-col items-center gap-3"
                          >
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                            <h4 className="font-bold text-slate-900 text-sm font-serif">Report Submitted Successfully</h4>
                            <p className="text-xs text-slate-600 font-semibold">Thank you! Ticket ID: #{bugTicketId}. Our engineers are on it.</p>
                          </motion.div>
                        ) : (
                          <form onSubmit={handleBugSubmit} className="space-y-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-bold text-slate-655">{t('bugSummary')}</label>
                              <input
                                type="text"
                                required
                                value={bugSummary}
                                onChange={(e) => setBugSummary(e.target.value)}
                                placeholder="E.g. Cab pick-up timeline node is showing NaN hours delay"
                                className="w-full h-10 px-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA] transition"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-bold text-slate-655">{t('bugSteps')}</label>
                              <textarea
                                rows="3"
                                value={bugSteps}
                                onChange={(e) => setBugSteps(e.target.value)}
                                placeholder="1. Go to homepage&#10;2. Build a flight trip&#10;3. Trigger terminal disruption in chaos lab"
                                className="w-full p-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA] transition resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-655">{t('bugSeverity')}</label>
                                <select
                                  value={bugSeverity}
                                  onChange={(e) => setBugSeverity(e.target.value)}
                                  className="h-10 px-3 rounded-lg border border-slate-205 text-xs font-bold bg-slate-50 focus:outline-none focus:border-[#287DFA] transition cursor-pointer"
                                >
                                  <option value="Low">Low - UI/Text Glitch</option>
                                  <option value="Medium">Medium - Feature Flaw</option>
                                  <option value="High">High - Crash / State Loop</option>
                                  <option value="Critical">Critical - Disruption Calculations Failure</option>
                                </select>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-slate-655">Mock Screenshot Upload</label>
                                <div 
                                  onClick={() => setBugScreenshot('tripresq_screenshot.png')}
                                  className="h-10 px-3 border border-dashed border-slate-300 rounded-lg flex items-center justify-center gap-1.5 text-xs text-slate-555 cursor-pointer hover:bg-slate-50 transition"
                                >
                                  <Upload className="w-4 h-4 text-slate-400" />
                                  <span>{bugScreenshot ? bugScreenshot : t('bugScreenshot').split(',')[0]}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full h-10 bg-[#287DFA] hover:bg-[#1C6BDB] text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer"
                            >
                              {t('bugSubmit')}
                            </button>
                          </form>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Tab 3: Share Feedback */}
                  {supportTab === 'feedback' && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-905 font-serif">{t('feedbackTitle')}</h3>
                        <p className="text-slate-450 text-[11px] mt-0.5 font-semibold">{t('feedbackSub')}</p>
                      </div>

                      <AnimatePresence mode="wait">
                        {feedbackSuccess ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center flex flex-col items-center gap-3"
                          >
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                            <h4 className="font-bold text-slate-900 text-sm font-serif">Feedback Submitted</h4>
                            <p className="text-xs text-slate-650 font-semibold font-serif">Thank you for rating your experience! We appreciate your input.</p>
                          </motion.div>
                        ) : (
                          <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                            {/* Star Selection */}
                            <div className="flex flex-col items-center gap-2 py-4 bg-slate-50/60 rounded-xl">
                              <span className="text-xs font-bold text-slate-500 font-serif">Tap to Rate</span>
                              <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFeedbackRating(star)}
                                    onMouseEnter={() => setFeedbackHover(star)}
                                    onMouseLeave={() => setFeedbackHover(0)}
                                    className="p-1 cursor-pointer transition active:scale-90"
                                  >
                                    <Star 
                                      className={`w-8 h-8 ${
                                        star <= (feedbackHover || feedbackRating) 
                                          ? 'text-amber-450 fill-amber-400 stroke-amber-500' 
                                          : 'text-slate-300 stroke-slate-300'
                                      }`} 
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Tags Selection */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-655 block">Feedback Tags</label>
                              <div className="flex flex-wrap gap-2">
                                {['#FastRescue', '#CleanLayout', '#ResponsiveSupport', '#ZeroHassle', '#AccurateCalculations'].map(tag => {
                                  const isSelected = selectedTags.includes(tag);
                                  return (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={() => {
                                        if (isSelected) {
                                          setSelectedTags(prev => prev.filter(t => t !== tag));
                                        } else {
                                          setSelectedTags(prev => [...prev, tag]);
                                        }
                                      }}
                                      className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                        isSelected 
                                          ? 'bg-slate-900 text-white' 
                                          : 'bg-slate-105 hover:bg-slate-200 text-slate-605'
                                      }`}
                                    >
                                      {tag}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Comment */}
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-bold text-slate-655 font-serif font-semibold">Review Comment</label>
                              <textarea
                                rows="3"
                                value={feedbackComment}
                                onChange={(e) => setFeedbackComment(e.target.value)}
                                placeholder={t('feedbackComment')}
                                className="w-full p-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA] transition resize-none"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={feedbackRating === 0}
                              className={`w-full h-10 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer ${
                                feedbackRating > 0 ? 'bg-[#287DFA] hover:bg-[#1C6BDB]' : 'bg-slate-300 text-slate-555 cursor-not-allowed'
                              }`}
                            >
                              {t('feedbackSubmit')}
                            </button>
                          </form>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                </div>

                {/* Right Side: Chatbot Widget */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-lg flex flex-col h-[480px] overflow-hidden">
                  {/* Chatbot Header */}
                  <div className="p-4 bg-[#287DFA] text-white flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm font-serif">{t('chatbotTitle')}</h4>
                      <p className="text-[10px] text-white/80">{t('chatbotSub')}</p>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 custom-scrollbar">
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-[#287DFA] text-white rounded-tr-none'
                              : 'bg-white text-slate-805 border border-slate-100 rounded-tl-none shadow-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isChatTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 text-slate-400 rounded-2xl rounded-tl-none px-4 py-2 text-xs flex items-center gap-1 shadow-xs">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick query chips */}
                  <div className="px-4 py-2 border-t border-slate-55 flex gap-1.5 overflow-x-auto whitespace-nowrap custom-scrollbar bg-white">
                    <button
                      onClick={() => handleQuickChatPrompt("My flight is delayed, what do I do?")}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-105 border border-slate-200 text-[10px] font-bold text-slate-605 rounded-full transition shrink-0 cursor-pointer font-semibold"
                    >
                      ⏱️ delayed transit
                    </button>
                    <button
                      onClick={() => handleQuickChatPrompt("How do I claim a full refund?")}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-105 border border-slate-200 text-[10px] font-bold text-[#FF7700] rounded-full transition shrink-0 cursor-pointer font-semibold"
                    >
                      💸 refunds
                    </button>
                    <button
                      onClick={() => handleQuickChatPrompt("Is my hotel stay check-in safe?")}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-105 border border-slate-200 text-[10px] font-bold text-slate-605 rounded-full transition shrink-0 cursor-pointer font-semibold"
                    >
                      🏨 hotel checks
                    </button>
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleChatSubmit} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={t('chatPlaceholder')}
                      className="flex-1 px-3 h-9 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#287DFA] transition font-semibold"
                    />
                    <button
                      type="submit"
                      className="p-2.5 bg-[#287DFA] hover:bg-[#1C6BDB] text-white rounded-lg transition cursor-pointer active:scale-95 flex items-center justify-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- Global Footer Area --- */}
      <footer className="bg-white border-t border-slate-100 py-8 px-6 mt-12 text-center">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-450 font-mono">
          <p>© 2026 TripResQ Technologies Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-slate-600 font-semibold">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-600 font-semibold">Terms of Protection</a>
            <a href="#contact" className="hover:text-slate-600 font-semibold">Contact Help Desk</a>
          </div>
        </div>
      </footer>

      {/* --- Authentication Sign In / Sign Up Modal --- */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-xs p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-100 overflow-hidden flex flex-col relative"
            >
              {/* Header Tab Switcher */}
              <div className="flex bg-slate-50 border-b border-slate-105">
                <button
                  type="button"
                  onClick={() => setAuthTab('signin')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition ${
                    authTab === 'signin' ? 'bg-white text-[#287DFA] border-r border-slate-100 font-extrabold' : 'text-slate-455 hover:bg-slate-100/50'
                  }`}
                >
                  {t('signInTab')}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('signup')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition ${
                    authTab === 'signup' ? 'bg-white text-[#287DFA] border-l border-slate-100 font-extrabold' : 'text-slate-455 hover:bg-slate-100/50'
                  }`}
                >
                  {t('signUpTab')}
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
                <div className="text-center pb-2">
                  <h3 className="font-bold text-slate-900 font-serif text-base">{t('authTitle')}</h3>
                  <p className="text-slate-440 text-[10px] mt-0.5 font-semibold">Secure verification via TripResQ Protection Shield</p>
                </div>

                {authTab === 'signup' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('fullName')}</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full h-10 px-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA]"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('emailOrPhone')}</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-10 px-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('password')}</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 px-3 rounded-lg border border-slate-205 text-xs font-semibold focus:outline-none focus:border-[#287DFA]"
                  />
                </div>

                {authTab === 'signin' && (
                  <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" className="rounded text-[#287DFA] focus:ring-0" />
                      <span>{t('rememberMe')}</span>
                    </label>
                    <a href="#forgot" className="text-[#287DFA] hover:underline font-semibold">{t('forgotPass')}</a>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-10 bg-[#287DFA] hover:bg-[#1C6BDB] text-white text-xs font-bold rounded-lg transition shadow-md shadow-[#287DFA]/10 cursor-pointer mt-2"
                >
                  {authTab === 'signin' ? t('signInTab') : t('signUpBtn')}
                </button>

                {/* Social logins */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[9px] font-bold text-slate-455 block text-center uppercase tracking-wider">{t('socialSignIn')}</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUserAuth({ loggedIn: true, user: { name: 'Google Traveler', email: 'traveler@google.com' } });
                        setShowAuthModal(false);
                        setCurrentPage('home');
                      }}
                      className="h-8 border border-slate-200 rounded-lg text-[10px] font-bold hover:bg-slate-50 cursor-pointer transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FF7700]" /> Google
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserAuth({ loggedIn: true, user: { name: 'OTP User', email: 'otp@tripresq.com' } });
                        setShowAuthModal(false);
                        setCurrentPage('home');
                      }}
                      className="h-8 border border-slate-200 rounded-lg text-[10px] font-bold hover:bg-slate-50 cursor-pointer transition flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#287DFA]" /> Mobile OTP
                    </button>
                  </div>
                </div>
              </form>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-655 cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
