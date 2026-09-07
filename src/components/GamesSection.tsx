import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Heart, RefreshCcw, Users, ChevronLeft, ChevronDown, Award, BookOpen, Dices, Circle, X, HelpCircle, Shuffle, Zap, Search, Film, Smartphone, UserPlus } from 'lucide-react';
import Confetti from 'react-confetti';

const EMOJIS = ['🌸', '🌻', '🍫', '🍦', '🍓', '🎀', '💌', '💖'];

const TRUTHS = [
  "What is a secret you've never told anyone?",
  "What is the most embarrassing thing you've ever done?",
  "If you could switch lives with someone in this room, who would it be?",
  "What's the worst lie you've ever told?",
  "What is your biggest fear?",
  "Who was your first crush?",
  "What's the most childish thing you still do?",
  "What is a weird habit you have?",
  "Have you ever stalked someone online?",
  "What is the most awkward text you've ever sent?",
  "What's something you secretly judge people for?",
  "Have you ever cried during a movie?",
  "If you had to delete all apps on your phone except 3, what would they be?",
  "Have you ever peed in a swimming pool?",
  "What's the weirdest thing you've ever eaten?",
  "Who was your first love?",
  "What's a secret habit you have when you're alone?",
  "Have you ever blamed a fart on someone else?",
  "What is your most irrational fear?",
  "If you were invisible for a day, what's the first thing you would do?",
  "What is the biggest lie you ever told your parents?",
  "What's the worst gift you've ever received and pretended to like?",
  "Who is the most annoying person in this room?",
  "What's the most cringe-worthy thing you did in high school?",
  "Have you ever stalked an ex on social media?"
];

const DARES = [
  "Do your best impression of someone in the room.",
  "Speak in an accent for the next 3 rounds.",
  "Do 10 pushups or squats right now.",
  "Let the group look through your phone gallery for 30 seconds.",
  "Sing the chorus of your favorite song out loud.",
  "Eat a spoonful of a condiment chosen by others.",
  "Tell a joke. If nobody laughs, do it again.",
  "Dance with no music for 1 minute.",
  "Send a random meme to the 5th person in your contacts.",
  "Do not blink for 30 seconds.",
  "Let someone write a word on your forehead with a pen.",
  "Bark like a dog for 30 seconds.",
  "Do 15 jumping jacks while singing the alphabet backwards.",
  "Let the group look through your photo gallery for 1 minute.",
  "Try to juggle 3 items of the group's choosing.",
  "Talk without opening your mouth for the next 2 rounds.",
  "Hold your breath for as long as you can.",
  "Act like a monkey until it is your turn again.",
  "Let the person to your right draw on your face with a pen.",
  "Smell everyone's shoes and rate them out of 10.",
  "Eat a piece of garlic or onion."
];

const SCRAMBLE_WORDS = [
  { word: "BUTTERFLY", hint: "A beautiful flying insect" },
  { word: "CHOCOLATE", hint: "Sweet brown treat" },
  { word: "SUNFLOWER", hint: "Yellow flower that follows the sun" },
  { word: "BIRTHDAY", hint: "A special day once a year" },
  { word: "VACATION", hint: "Time off from work or school" },
  { word: "ICE CREAM", hint: "Cold sweet dessert" },
  { word: "BICYCLE", hint: "Two-wheeled transport" },
  { word: "UMBRELLA", hint: "Keeps you dry in the rain" },
  { word: "COFFEE", hint: "Morning energy drink" },
  { word: "SUNSET", hint: "Evening sky view" },
  { word: "MOUNTAIN", hint: "High natural elevation" },
  { word: "ROMANCE", hint: "Feeling of love and mystery" },
  { word: "LAUGHTER", hint: "Sound of joy" },
  { word: "BREEZE", hint: "Gentle wind" },
  { word: "STARDUST", hint: "Magic from the night sky" },
  { word: "JOURNEY", hint: "Traveling from one place to another" },
  { word: "PROMISE", hint: "A declaration of assurance" },
  { word: "GALAXY", hint: "A massive system of stars" },
  { word: "OCEAN", hint: "A very large expanse of sea" },
  { word: "ADVENTURE", hint: "An unusual and exciting experience" },
  { word: "FIREWORK", hint: "Explosive pyrotechnic device" },
  { word: "WHISPER", hint: "Speaking very softly" },
  { word: "TREASURE", hint: "Hidden wealth or valuables" },
  { word: "RAINBOW", hint: "Colors appearing in the sky after rain" },
  { word: "FESTIVAL", hint: "A day or period of celebration" },
  { word: "BLOSSOM", hint: "A flower or a mass of flowers" },
  { word: "NOSTALGIA", hint: "A sentimental longing for the past" },
  { word: "MELODY", hint: "A sequence of single notes that is musically satisfying" }
];

const TELUGU_MOVIES = [
  "Eega", "Baahubali", "Pushpa", "Arjun Reddy", "Ala Vaikunthapurramuloo", 
  "Magadheera", "Rangasthalam", "Jersey", "Mahanati", "Geetha Govindam",
  "Bommarillu", "Pokiri", "Gabbar Singh", "Sita Ramam", "Okkadu",
  "Arya", "Darling", "Kushi", "Athadu", "Jalsa", "Fidaa", 
  "Nuvvostanante Nenoddantana", "Ye Maaya Chesave", "Mirchi", 
  "Chatrapathi", "Godavari", "Sathamanam Bhavati", "Karthikeya", 
  "Nene Raju Nene Mantri", "Kalki 2898 AD", "RRR", "Salaar", "Devara",
  "Hanuman", "KGF", "Evaru", "Goodachari", "Kshanam", "HIT", "DJ Tillu",
  "Tillu Square", "Premam", "Billa", "Julayi", "Race Gurram", "Srimanthudu",
  "Dookudu", "Businessman", "Yamadonga", "Simhadri", "Manmadhudu"
];

const PASS_PHONE_PROMPTS = [
  "Pass the phone to someone who is always late.",
  "Pass the phone to someone who takes the most selfies.",
  "Pass the phone to someone who is the most likely to fall asleep on the bus.",
  "Pass the phone to someone who has the best smile.",
  "Pass the phone to someone who gets scared easily.",
  "Pass the phone to someone who eats the most.",
  "Pass the phone to someone who gives the best advice.",
  "Pass the phone to someone you trust the most.",
  "Pass the phone to the funniest person here.",
  "Pass the phone to someone who never replies on time.",
  "Pass the phone to the person who takes the best photos.",
  "Pass the phone to the drama queen/king.",
  "Pass the phone to the one most likely to survive a zombie apocalypse.",
  "Pass the phone to the person who laughs the loudest.",
  "Pass the phone to the person most likely to become a millionaire.",
  "Pass the phone to the clumsiest person in the room.",
  "Pass the phone to the person with the best sense of style.",
  "Pass the phone to someone who is most likely to move to another country.",
  "Pass the phone to the person who watches the most movies.",
  "Pass the phone to someone who always has snacks."
];

const COUPLE_QUIZ = [
  "Who takes longer to get ready?",
  "Who says 'I love you' more often?",
  "Who is the better cook?",
  "Who falls asleep first?",
  "Who is more organized?",
  "Who talks more?",
  "Who is more likely to start an argument?",
  "Who apologizes first?",
  "Who is the bigger romantic?",
  "Who is more stubborn?",
  "Who is the better driver?",
  "Who spends more money?",
  "Who is the better listener?",
  "Who is more likely to lose their keys?",
  "Who has better taste in music?",
  "Who gets angry faster?",
  "Who is more likely to suggest ordering takeout?",
  "Who is the bigger flirt?",
  "Who takes the longest showers?",
  "Who is more likely to forget an important date?"
];

// 🦷 Dental Viva Study Flashcards Database (15 cards per subject, 120 total)
const DENTAL_FLASHCARDS = [
  // 1. Oral Medicine & Radiology (IDs 1-15)
  {
    id: 1,
    subject: "Oral Medicine & Radiology",
    difficulty: "Easy",
    question: "What is the primary diagnostic use of Bitewing radiography?",
    answer: "To detect interproximal dental caries (decay between teeth) and evaluate alveolar crestal bone levels."
  },
  {
    id: 2,
    subject: "Oral Medicine & Radiology",
    difficulty: "Medium",
    question: "What is the classic radiographic appearance of Ameloblastoma on a panoramic X-ray?",
    answer: "A multilocular radiolucency with a 'soap bubble' or 'honeycomb' appearance."
  },
  {
    id: 3,
    subject: "Oral Medicine & Radiology",
    difficulty: "Hard",
    question: "Classify mucosal lesions and name the primary etiologic agent of Oral Hairy Leukoplakia.",
    answer: "Epstein-Barr Virus (EBV). It occurs primarily on the lateral borders of the tongue in immunocompromised individuals."
  },
  {
    id: 4,
    subject: "Oral Medicine & Radiology",
    difficulty: "Easy",
    question: "Which major salivary gland is most commonly affected by sialolithiasis (salivary stones) and why?",
    answer: "The submandibular gland. Its duct (Wharton's) has a long, tortuous path, and the saliva it produces is highly mucinous and alkaline."
  },
  {
    id: 5,
    subject: "Oral Medicine & Radiology",
    difficulty: "Medium",
    question: "Explain the SLOB rule used in radiographic localization.",
    answer: "Same Lingual, Opposite Buccal. When shifting the X-ray tube head, if an object moves in the same direction, it lies on the lingual side; if opposite, the buccal side."
  },
  {
    id: 6,
    subject: "Oral Medicine & Radiology",
    difficulty: "Hard",
    question: "What is the diagnostic triad of Sjögren's Syndrome?",
    answer: "Keratoconjunctivitis sicca (dry eyes), xerostomia (dry mouth), and presence of a connective tissue/rheumatoid disease."
  },
  {
    id: 7,
    subject: "Oral Medicine & Radiology",
    difficulty: "Medium",
    question: "Describe the typical radiographic appearance of fibrous dysplasia.",
    answer: "A diffuse, radiopaque lesion presenting a classic 'ground-glass' or 'orange peel' appearance blending into normal bone."
  },
  {
    id: 8,
    subject: "Oral Medicine & Radiology",
    difficulty: "Hard",
    question: "Describe the classic 'sunburst' appearance in dental radiography and what it indicates.",
    answer: "It refers to radiating bone spicules forming a sunburst pattern, characteristic of Osteosarcoma."
  },
  {
    id: 9,
    subject: "Oral Medicine & Radiology",
    difficulty: "Easy",
    question: "What does the inverse square law state regarding X-ray radiation intensity?",
    answer: "The intensity of the radiation beam is inversely proportional to the square of the distance from the source."
  },
  {
    id: 10,
    subject: "Oral Medicine & Radiology",
    difficulty: "Medium",
    question: "What is the hallmark radiographic feature of a Radicular Cyst?",
    answer: "A well-circumscribed, round or ovoid radiolucency surrounding the root apex of a non-vital tooth, surrounded by a thin radiopaque border."
  },
  {
    id: 11,
    subject: "Oral Medicine & Radiology",
    difficulty: "Easy",
    question: "What is xerostomia and what is its most common systemic cause?",
    answer: "Subjective feeling of dry mouth, most commonly caused by medications (anti-cholinergics, anti-histamines, diuretics) or Sjögren's Syndrome."
  },
  {
    id: 12,
    subject: "Oral Medicine & Radiology",
    difficulty: "Medium",
    question: "What does a 'cotton-wool' radiographic appearance of bone indicate?",
    answer: "Paget's Disease of bone (osteitis deformans) in its late sclerotic stage."
  },
  {
    id: 13,
    subject: "Oral Medicine & Radiology",
    difficulty: "Hard",
    question: "Differentiate between Pemphigus Vulgaris and Mucous Membrane Pemphigoid.",
    answer: "Pemphigus: Intraepithelial clefting, acantholysis, positive Nikolsky's sign, target is desmoglein 3. Pemphigoid: Subepithelial clefting, target is hemidesmosomes, negative Nikolsky's sign."
  },
  {
    id: 14,
    subject: "Oral Medicine & Radiology",
    difficulty: "Medium",
    question: "What is the radiographic appearance of Stafne's bone defect?",
    answer: "A well-circumscribed, oval radiolucency below the inferior alveolar nerve canal, near the angle of the mandible, caused by salivary gland indentation."
  },
  {
    id: 15,
    subject: "Oral Medicine & Radiology",
    difficulty: "Easy",
    question: "What is the main clinical difference between leukoplakia and candidiasis?",
    answer: "Leukoplakia cannot be rubbed/wiped off, whereas pseudomembranous candidiasis (thrush) leaves a red, raw, bleeding surface when scraped off."
  },

  // 2. Oral Maxillofacial Surgery (IDs 16-30)
  {
    id: 16,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Easy",
    question: "What is dry socket scientifically known as, and when does it typically occur?",
    answer: "Alveolar Osteitis. It usually occurs 3-4 days post-extraction due to premature dissolution or loss of the blood clot."
  },
  {
    id: 17,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Medium",
    question: "Which nerve is at highest risk of injury during mandibular third molar extraction, and what are the symptoms?",
    answer: "Inferior Alveolar Nerve (IAN). Symptoms include temporary or permanent numbness of the lower lip, chin, and anterior teeth on the affected side."
  },
  {
    id: 18,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Hard",
    question: "Define Ludwig's Angina, its typical origin, and the key space involvements.",
    answer: "A bilateral, rapidly spreading cellulitis of the submandibular, sublingual, and submental spaces, usually originating from an infected mandibular molar. Airway compromise is the chief danger."
  },
  {
    id: 19,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Hard",
    question: "Differentiate between Le Fort I, Le Fort II, and Le Fort III midface fractures.",
    answer: "Le Fort I: Horizontal fracture above teeth roots. Le Fort II: Pyramidal fracture across nose bridge and infraorbital rims. Le Fort III: Craniofacial disjunction separating face bones from the skull."
  },
  {
    id: 20,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Medium",
    question: "What maneuver is used to reduce a TMJ dislocation, and how is it executed?",
    answer: "Nelaton's maneuver. The surgeon places thumbs on the mandibular molars, applying downward pressure while pulling the chin upward and backward."
  },
  {
    id: 21,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Easy",
    question: "What is trismus and what are its common dental causes?",
    answer: "Inability to open the mouth normally. Causes include infection, TMJ disorders, spasm of masticatory muscles, and local inflammation after extraction."
  },
  {
    id: 22,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Medium",
    question: "Name three clinical signs of a mandibular body fracture.",
    answer: "Step deformity in occlusion, sublingual ecchymosis (Coleman's sign), and localized pain/mobility on manual testing."
  },
  {
    id: 23,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Hard",
    question: "What are the absolute systemic contraindications for a routine tooth extraction?",
    answer: "Uncontrolled bleeding disorders, severe leukemia/thrombocytopenia, and very recent myocardial infarction (within 6 months)."
  },
  {
    id: 24,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Medium",
    question: "What is a Gunning splint and when is it utilized?",
    answer: "A customized acrylic dental splint used to immobilize and stabilize fractures of the mandible or maxilla in completely edentulous patients."
  },
  {
    id: 25,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Easy",
    question: "What is the maximum recommended dose of 2% Lidocaine with 1:100,000 epinephrine?",
    answer: "7 mg/kg of body weight for adults, up to a maximum absolute limit of 500 mg (about 13-14 cartridges)."
  },
  {
    id: 26,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Easy",
    question: "What is the primary reason for using a vasoconstrictor in local anesthesia?",
    answer: "To prolong duration of action, reduce systemic toxicity, and achieve local hemostasis (reduce bleeding)."
  },
  {
    id: 27,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Medium",
    question: "What is a cyst, and how does it differ from a pseudocyst?",
    answer: "A true cyst is a pathological cavity lined by epithelium. A pseudocyst lacks an epithelial lining (e.g., Traumatic/Simple Bone Cyst)."
  },
  {
    id: 28,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Hard",
    question: "Classify impaction of mandibular third molars according to Pell & Gregory.",
    answer: "Based on space relative to ramus (Class A/B/C) and depth relative to occlusal plane of second molar (Position I/II/III)."
  },
  {
    id: 29,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Medium",
    question: "What are the main clinical signs of an oroantral fistula (OAF)?",
    answer: "Fluid escaping from nose when drinking, air passing into mouth on nose-blowing, unilateral epistaxis, and regurgitation of food."
  },
  {
    id: 30,
    subject: "Oral Maxillofacial Surgery",
    difficulty: "Hard",
    question: "What is the primary management for a patient presenting with an acute submandibular space infection?",
    answer: "Securing the airway, followed by surgical incision and drainage, and high-dose intravenous empirical antibiotics."
  },

  // 3. Conservative Dentistry & Endodontics (IDs 31-45)
  {
    id: 31,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Easy",
    question: "What is the primary irrigant used to dissolve organic tissue and disinfect root canals?",
    answer: "Sodium Hypochlorite (NaOCl), typically used in concentrations of 0.5% to 6.0%."
  },
  {
    id: 32,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Medium",
    question: "What is the smear layer and what chemical is used to remove its inorganic component?",
    answer: "A microcrystalline layer of dentinal debris, plaque, and organic matter created during root canal instrumentation. EDTA (17%) is used to remove the inorganic portion."
  },
  {
    id: 33,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Hard",
    question: "Differentiate between reversible pulpitis, irreversible pulpitis, and pulpal necrosis based on thermal pulp testing.",
    answer: "Reversible: Sharp pain that resolves immediately when stimulus is removed. Irreversible: Lingering throbbing pain after stimulus removal. Necrosis: No response to thermal testing."
  },
  {
    id: 34,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Hard",
    question: "Differentiate between Apexogenesis and Apexification.",
    answer: "Apexogenesis is vital pulp therapy (like pulpotomy) to encourage root end completion. Apexification is inducing a calcified barrier at the root end of a non-vital tooth."
  },
  {
    id: 35,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Medium",
    question: "What is the typical thickness of the smear layer on dentinal walls after instrumentation?",
    answer: "It typically ranges from 1 to 2 microns in thickness."
  },
  {
    id: 36,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Medium",
    question: "What are the primary therapeutic effects of Calcium Hydroxide paste in root canal treatment?",
    answer: "High alkalinity (pH 12.5) provides potent antibacterial action, dissolves remaining organic tissue, and promotes hard tissue barrier formation."
  },
  {
    id: 37,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Easy",
    question: "What are the main components of Gutta-Percha points used in canal obturation?",
    answer: "60-70% Zinc Oxide (matrix filler), 20% Gutta-Percha (organic polymer), radiopacifiers (heavy metal sulfates), and plasticizing waxes."
  },
  {
    id: 38,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Hard",
    question: "Which tooth most commonly exhibits a 'C-shaped' root canal system?",
    answer: "The mandibular second molar (particularly prevalent in Asian populations)."
  },
  {
    id: 39,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Medium",
    question: "What chemical paste is used for the 'Walking Bleach' technique in non-vital teeth?",
    answer: "A mixture of Sodium Perborate and water or saline (placed in pulp chamber and sealed for 3-7 days)."
  },
  {
    id: 40,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Easy",
    question: "Define G.V. Black's Class V classification of dental restorations.",
    answer: "Cavities occurring in the gingival third of the facial or lingual surfaces of all teeth (non-pit-and-fissure cavities near gums)."
  },
  {
    id: 41,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Easy",
    question: "What is the purpose of acid etching with 37% phosphoric acid during bonding?",
    answer: "To create micro-porosities in enamel (roughness) and remove the smear layer in dentin, enabling micromechanical retention."
  },
  {
    id: 42,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Medium",
    question: "What is the composition and function of the hybrid layer in dentin bonding?",
    answer: "The layer formed by resin monomers interpenetrating and polymerizing within the demineralized collagen network of dentin."
  },
  {
    id: 43,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Hard",
    question: "What is 'strip perforation' and where is it most likely to occur?",
    answer: "A lateral perforation along the thin inner wall (danger zone) of a curved root canal, most commonly in the mesial roots of mandibular molars."
  },
  {
    id: 44,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Medium",
    question: "Describe the main difference between K-files and Hedstrom (H-files).",
    answer: "K-files are made by twisting wire (used in filing/reaming). H-files are ground from round wire with spiral cuts (cut only on withdrawal, aggressive cut)."
  },
  {
    id: 45,
    subject: "Conservative Dentistry & Endodontics",
    difficulty: "Easy",
    question: "What is C-factor (configuration factor) in composite restorations?",
    answer: "The ratio of bonded surfaces to unbonded surfaces. A higher C-factor (e.g. Class V or Class I) leads to greater polymerization shrinkage stress."
  },

  // 4. Prosthodontics (IDs 46-60)
  {
    id: 46,
    subject: "Prosthodontics",
    difficulty: "Easy",
    question: "What is the main function of the Facebow in complete denture fabrication?",
    answer: "To record the spatial relationship of the maxillary arch to the temporomandibular joints and transfer this record to an articulator."
  },
  {
    id: 47,
    subject: "Prosthodontics",
    difficulty: "Medium",
    question: "Explain the 'snowshoe principle' in complete denture design.",
    answer: "It refers to distributing the occlusal forces over a wide denture-bearing area to minimize load per unit area and reduce tissue resorption."
  },
  {
    id: 48,
    subject: "Prosthodontics",
    difficulty: "Hard",
    question: "Define 'Balanced Occlusion' in complete dentures and explain why it is essential.",
    answer: "The simultaneous contacting of the maxillary and mandibular teeth in the right and left posterior segments and in the anterior segment in centric and eccentric positions. It prevents tipping of dentures during movement."
  },
  {
    id: 49,
    subject: "Prosthodontics",
    difficulty: "Hard",
    question: "What is the Bennett Angle in mandibular kinematics?",
    answer: "The angle formed by the sagittal plane and the path of the non-working condyle during lateral movement of the mandible."
  },
  {
    id: 50,
    subject: "Prosthodontics",
    difficulty: "Easy",
    question: "What material is most commonly used to construct custom impression trays?",
    answer: "Autopolymerizing (cold-cure) or light-cured (LC) acrylic resin sheets."
  },
  {
    id: 51,
    subject: "Prosthodontics",
    difficulty: "Medium",
    question: "Which anatomical structures must be relieved in a maxillary denture to prevent soreness or rocking?",
    answer: "The incisive papilla (prevents nerve compression) and the mid-palatal suture line."
  },
  {
    id: 52,
    subject: "Prosthodontics",
    difficulty: "Medium",
    question: "What is the primary support advantage of retaining roots for an overdenture?",
    answer: "It preserves alveolar ridge height by maintaining loading signals and preserves periodontal sensory proprioception."
  },
  {
    id: 53,
    subject: "Prosthodontics",
    difficulty: "Hard",
    question: "What is the RPI system in removable partial dentures?",
    answer: "A clasp system comprising: Rest (mesial), Proximal plate (distal), and I-bar clasp (buccal). Minimizes torque on abutment teeth."
  },
  {
    id: 54,
    subject: "Prosthodontics",
    difficulty: "Medium",
    question: "What is the minimum vertical space required for a mandibular lingual bar connector?",
    answer: "At least 7-8 mm of vertical height between the gingival margin and the floor of the mouth."
  },
  {
    id: 55,
    subject: "Prosthodontics",
    difficulty: "Easy",
    question: "Define Syneresis and Imbibition in hydrocolloid impressions.",
    answer: "Syneresis: Exudation of water causing shrinkage. Imbibition: Absorption of water causing expansion."
  },
  {
    id: 56,
    subject: "Prosthodontics",
    difficulty: "Easy",
    question: "What is the difference between an anatomical and a non-anatomical denture tooth?",
    answer: "Anatomical teeth have cusp angles of 30-33 degrees. Non-anatomical (monoplane) teeth have 0-degree cusps (reduced lateral force, for resorbed ridges)."
  },
  {
    id: 57,
    subject: "Prosthodontics",
    difficulty: "Medium",
    question: "What is the primary function of the posterior palatal seal (post-dam) in maxillary complete dentures?",
    answer: "To compensate for polymerization shrinkage of acrylic resin, prevent food ingress under the denture, and maintain a peripheral seal."
  },
  {
    id: 58,
    subject: "Prosthodontics",
    difficulty: "Hard",
    question: "What is the 'Christensen's Phenomenon'?",
    answer: "The posterior separation of denture teeth that occurs during protrusive movement of the mandible, requiring compensating curves to maintain balance."
  },
  {
    id: 59,
    subject: "Prosthodontics",
    difficulty: "Medium",
    question: "Define the 'neutral zone' in complete denture prosthodontics.",
    answer: "The potential space in the mouth where the forces of the tongue pushing outwards are equal to the forces of the lips and cheeks pushing inwards."
  },
  {
    id: 60,
    subject: "Prosthodontics",
    difficulty: "Easy",
    question: "What is the difference between absolute and relative indicators for a dental implant?",
    answer: "Absolute: Patient's desire to avoid grinding adjacent teeth. Relative: Inability to tolerate or retain a conventional denture due to bone loss."
  },

  // 5. Periodontics (IDs 61-75)
  {
    id: 61,
    subject: "Periodontics",
    difficulty: "Easy",
    question: "What is the primary difference between dental plaque and calculus?",
    answer: "Plaque is a soft, sticky, unmineralized biofilm of bacteria. Calculus is dental plaque that has mineralized (hardened) by calcium phosphate salts."
  },
  {
    id: 62,
    subject: "Periodontics",
    difficulty: "Medium",
    question: "Classify periodontal pockets based on the position of the pocket bottom relative to the alveolar crest.",
    answer: "Suprabony (pocket bottom is coronal to the alveolar crest) and Infrabony (pocket bottom is apical to the alveolar crest)."
  },
  {
    id: 63,
    subject: "Periodontics",
    difficulty: "Hard",
    question: "Identify the 'red complex' bacteria and explain their clinical significance in periodontal disease.",
    answer: "Porphyromonas gingivalis, Tannerella forsythia, and Treponema denticola. They are highly virulent pathogens strongly associated with active periodontitis."
  },
  {
    id: 64,
    subject: "Periodontics",
    difficulty: "Medium",
    question: "Which principal fibers of the periodontal ligament (PDL) are most numerous and resist vertical masticatory forces?",
    answer: "The oblique fibers, which run obliquely from cementum to the alveolar bone."
  },
  {
    id: 65,
    subject: "Periodontics",
    difficulty: "Medium",
    question: "Which area-specific Gracey curettes are indicated for instrumentation of the mesial and distal surfaces of posterior teeth?",
    answer: "Gracey 11/12 for mesial surfaces; Gracey 13/14 for distal surfaces."
  },
  {
    id: 66,
    subject: "Periodontics",
    difficulty: "Hard",
    question: "Contrast gingivectomy and periodontal flap surgery.",
    answer: "Gingivectomy: Excisional removal of the pocket wall (soft tissue only). Flap surgery: Incising and reflecting tissue to access bone defects directly."
  },
  {
    id: 67,
    subject: "Periodontics",
    difficulty: "Easy",
    question: "What is the primary etiology of inflammatory periodontal disease?",
    answer: "Bacterial plaque biofilm accumulating on dental surfaces."
  },
  {
    id: 68,
    subject: "Periodontics",
    difficulty: "Easy",
    question: "What is the first and most common clinical indicator of active gingivitis?",
    answer: "Bleeding on probing (BOP) from the sulcus."
  },
  {
    id: 69,
    subject: "Periodontics",
    difficulty: "Hard",
    question: "Describe Glickman's Classification of furcation involvement.",
    answer: "Grade I: Incipient. Grade II: Cul-de-sac (partial probe). Grade III: Through-and-through (covered by gingiva). Grade IV: Clinically exposed through-and-through."
  },
  {
    id: 70,
    subject: "Periodontics",
    difficulty: "Medium",
    question: "Define 'biologic width' and state its average dimension.",
    answer: "The combined height of the junctional epithelium and connective tissue attachment above the alveolar crest. Average is about 2.04 mm."
  },
  {
    id: 71,
    subject: "Periodontics",
    difficulty: "Easy",
    question: "What is the primary difference between gingivitis and periodontitis?",
    answer: "Gingivitis is reversible inflammation of soft tissues without attachment loss. Periodontitis involves irreversible destruction of periodontal ligament fibers and alveolar bone."
  },
  {
    id: 72,
    subject: "Periodontics",
    difficulty: "Medium",
    question: "What is the primary component of supragingival calculus?",
    answer: "Inorganic mineral salts (mainly calcium phosphate, about 70-80%), with hydroxyapatite being the predominant crystalline form."
  },
  {
    id: 73,
    subject: "Periodontics",
    difficulty: "Hard",
    question: "Classify bone defects (infraosseous defects) based on the number of osseous walls remaining.",
    answer: "One-wall, two-wall, or three-wall defects. Three-wall defects have the best prognosis for periodontal regeneration."
  },
  {
    id: 74,
    subject: "Periodontics",
    difficulty: "Medium",
    question: "What is the purpose of plaque disclosing agents?",
    answer: "Dye solutions (like erythrosin) that stain bacterial plaque to make it visible to patients, highlighting areas they missed during brushing."
  },
  {
    id: 75,
    subject: "Periodontics",
    difficulty: "Easy",
    question: "What are the main clinical signs of healthy gingiva?",
    answer: "Coral pink color, firm and resilient consistency, scalloped margin, absence of bleeding on probing, and stippled 'orange-peel' texture."
  },

  // 6. Pedodontics (IDs 76-90)
  {
    id: 76,
    subject: "Pedodontics",
    difficulty: "Easy",
    question: "What is the storage media of choice for transport of an avulsed permanent tooth?",
    answer: "Hank's Balanced Salt Solution (HBSS), cold milk, saline, or saliva. Water should be avoided because it causes cell lysis."
  },
  {
    id: 77,
    subject: "Pedodontics",
    difficulty: "Medium",
    question: "What is the significance of Primate Spaces in primary dentition, and where are they located?",
    answer: "Spacings that help accommodate larger permanent teeth. Located mesial to the maxillary canine, and distal to the mandibular canine."
  },
  {
    id: 78,
    subject: "Pedodontics",
    difficulty: "Hard",
    question: "What is the classification of traumatic dental injuries according to Ellis & Davey, and what does Class III represent?",
    answer: "Class I: Enamel fracture. Class II: Enamel and dentin fracture (no pulp). Class III: Enamel and dentin fracture with pulp exposure."
  },
  {
    id: 79,
    subject: "Pedodontics",
    difficulty: "Easy",
    question: "Which primary tooth typically erupts first in infants and at what age?",
    answer: "The mandibular central incisor, usually erupting between 6 to 8 months of age."
  },
  {
    id: 80,
    subject: "Pedodontics",
    difficulty: "Medium",
    question: "Describe the typical clinical pattern of Early Childhood Caries (nursing bottle decay).",
    answer: "Rapidly progresses in maxillary incisors, while mandibular incisors are protected by the tongue and salivary pooling."
  },
  {
    id: 81,
    subject: "Pedodontics",
    difficulty: "Medium",
    question: "Which space maintainer is indicated for premature loss of a unilateral primary mandibular first molar?",
    answer: "A band-and-loop space maintainer (attached to the second molar, looping to the canine)."
  },
  {
    id: 82,
    subject: "Pedodontics",
    difficulty: "Hard",
    question: "Distinguish between pulpotomy and pulpectomy in primary dentition.",
    answer: "Pulpotomy: Removal of coronal pulp (keeping radicular pulp vital). Pulpectomy: Complete extirpation of all pulp tissue (coronal and root)."
  },
  {
    id: 83,
    subject: "Pedodontics",
    difficulty: "Hard",
    question: "What is the primary active ingredient and role of Formocresol in primary tooth pulpotomy?",
    answer: "Formaldehyde. It fixes and devitalizes the uppermost pulp tissue, neutralizing bacteriological contamination."
  },
  {
    id: 84,
    subject: "Pedodontics",
    difficulty: "Easy",
    question: "What is the 'Tell-Show-Do' technique in pediatric behavioral management?",
    answer: "A desensitization sequence: Explain the procedure (Tell), demonstrate on a model (Show), and perform the action on the patient (Do)."
  },
  {
    id: 85,
    subject: "Pedodontics",
    difficulty: "Easy",
    question: "When is a Stainless Steel Crown (SSC) preferred over composite fillings for primary teeth?",
    answer: "For teeth with extensive decay, restorations following pulpotomy/pulpectomy, or developmental defects."
  },
  {
    id: 86,
    subject: "Pedodontics",
    difficulty: "Easy",
    question: "What is the rule of thumb for fluoride supplementation in children?",
    answer: "Supplementation depends on the child's age, fluoride concentration in local drinking water, and caries risk status."
  },
  {
    id: 87,
    subject: "Pedodontics",
    difficulty: "Medium",
    question: "What is the Frankl Behavior Rating Scale?",
    answer: "A scale classifying child behavior into four categories: Definitely Negative (- -), Negative (-), Positive (+), and Definitely Positive (+ +)."
  },
  {
    id: 88,
    subject: "Pedodontics",
    difficulty: "Hard",
    question: "Describe the eruptive sequence of permanent teeth in the mandible.",
    answer: "First molar, central incisor, lateral incisor, canine, first premolar, second premolar, second molar, third molar (6-1-2-3-4-5-7-8)."
  },
  {
    id: 89,
    subject: "Pedodontics",
    difficulty: "Medium",
    question: "What is the difference between a distal shoe and a band-and-loop space maintainer?",
    answer: "Distal shoe is used when a primary second molar is lost before eruption of the permanent first molar. Band-and-loop is for space maintenance after eruption."
  },
  {
    id: 90,
    subject: "Pedodontics",
    difficulty: "Easy",
    question: "What is the primary dental concern with thumb-sucking habits after age 4-5?",
    answer: "Development of anterior open bite, maxillary constriction, increased overjet, and posterior crossbite due to muscle pressure."
  },

  // 7. Orthodontics (IDs 91-105)
  {
    id: 91,
    subject: "Orthodontics",
    difficulty: "Easy",
    question: "Define orthodontic 'anchorage' and why it is critical.",
    answer: "The resistance to unwanted reactionary tooth movement. It is critical to ensure only target teeth move while supporting teeth remain stable."
  },
  {
    id: 92,
    subject: "Orthodontics",
    difficulty: "Medium",
    question: "Define the Leeway Space of Nance and state its average value in the mandibular arch.",
    answer: "The difference in width between primary canine/molars and permanent canine/premolars. Average is 1.7 to 2.0 mm per quadrant in the mandible."
  },
  {
    id: 93,
    subject: "Orthodontics",
    difficulty: "Hard",
    question: "Explain the difference between skeletal malocclusion and dental malocclusion.",
    answer: "Skeletal malocclusion is caused by discrepancy in jaw size or position (maxilla vs mandible). Dental malocclusion is purely a misalignment of the teeth within normally positioned jaws."
  },
  {
    id: 94,
    subject: "Orthodontics",
    difficulty: "Easy",
    question: "Describe Angle's classification of Class I, II, and III malocclusions.",
    answer: "Class I: Normal molar relation. Class II: Mandible retrognathic (distocclusion). Class III: Mandible prognathic (mesiocclusion)."
  },
  {
    id: 95,
    subject: "Orthodontics",
    difficulty: "Medium",
    question: "Which active component is primarily responsible for clasp retention in removable appliances?",
    answer: "The Adams Clasp, which engages the mesiobuccal and distobuccal undercuts of the anchor tooth."
  },
  {
    id: 96,
    subject: "Orthodontics",
    difficulty: "Hard",
    question: "What is the optimal force level recommended to induce orthodontic tooth movement without necrosis?",
    answer: "Continuous, light forces measuring approximately 20 to 26 grams per square centimeter of root surface area."
  },
  {
    id: 97,
    subject: "Orthodontics",
    difficulty: "Hard",
    question: "Where is the center of resistance of a single-rooted tooth located?",
    answer: "Approximately 1/3 to 1/2 of the root length measured from the alveolar crest margin."
  },
  {
    id: 98,
    subject: "Orthodontics",
    difficulty: "Medium",
    question: "Contrast physiological migration from orthodontic tooth movement.",
    answer: "Physiological: Slow migration due to wear/eruption. Orthodontic: Mechanically induced bone remodeling (resorption on pressure, deposition on tension)."
  },
  {
    id: 99,
    subject: "Orthodontics",
    difficulty: "Medium",
    question: "Identify the cells responsible for bone remodeling on the pressure and tension sides of a tooth.",
    answer: "Osteoclasts dissolve bone on the pressure side; Osteoblasts build bone on the tension side."
  },
  {
    id: 100,
    subject: "Orthodontics",
    difficulty: "Easy",
    question: "What components of a removable orthodontic appliance provide active force?",
    answer: "Active elements like springs (e.g. finger/Z-spring), expansion screws, or orthodontic elastics."
  },
  {
    id: 101,
    subject: "Orthodontics",
    difficulty: "Easy",
    question: "What is the difference between active and passive orthodontic retainers?",
    answer: "Active retainers apply force to make minor tooth movements. Passive retainers (e.g. Hawley or fixed lingual wire) hold teeth in their positions to prevent relapse."
  },
  {
    id: 102,
    subject: "Orthodontics",
    difficulty: "Medium",
    question: "What is the difference between tipping and translation (bodily movement) of teeth?",
    answer: "Tipping: Crown and root move in opposite directions. Translation: The entire tooth moves in the same direction (force through center of resistance)."
  },
  {
    id: 103,
    subject: "Orthodontics",
    difficulty: "Hard",
    question: "What is the hyalinized zone in the periodontal ligament during orthodontic force application?",
    answer: "An area of aseptic necrosis that forms on the pressure side when excessive force is applied, temporarily stopping tooth movement."
  },
  {
    id: 104,
    subject: "Orthodontics",
    difficulty: "Medium",
    question: "Define the term 'overbite' and differentiate it from 'overjet'.",
    answer: "Overbite: Vertical overlap of the maxillary incisors over the mandibular incisors. Overjet: Horizontal distance between mandibular and maxillary incisors."
  },
  {
    id: 105,
    subject: "Orthodontics",
    difficulty: "Easy",
    question: "What is the primary purpose of a cephalometric radiograph in orthodontics?",
    answer: "To evaluate skeletal relationships of the jaws to the cranium, track growth, and plan treatment."
  },

  // 8. Public Health Dentistry (IDs 106-120)
  {
    id: 106,
    subject: "Public Health Dentistry",
    difficulty: "Easy",
    question: "What is the optimal concentration of fluoride in drinking water recommended for dental caries prevention?",
    answer: "0.7 parts per million (ppm) or mg/L."
  },
  {
    id: 107,
    subject: "Public Health Dentistry",
    difficulty: "Medium",
    question: "What does the DMFT index stand for, and what are its components?",
    answer: "Decayed, Missing, Filled Teeth index. It measures cumulative caries experience in permanent teeth by counting decayed, missing (due to caries), and filled teeth."
  },
  {
    id: 108,
    subject: "Public Health Dentistry",
    difficulty: "Hard",
    question: "Differentiate between Primordial, Primary, Secondary, and Tertiary levels of prevention in public health.",
    answer: "Primordial: Avoid risk factor emergence. Primary: Action before disease. Secondary: Early detection & treatment. Tertiary: Limit disability (e.g. dentures)."
  },
  {
    id: 109,
    subject: "Public Health Dentistry",
    difficulty: "Medium",
    question: "What is Atraumatic Restorative Treatment (ART) and where is it indicated?",
    answer: "A caries management method using hand instruments only for excavation, followed by GIC restoration. Ideal for low-resource community campaigns."
  },
  {
    id: 110,
    subject: "Public Health Dentistry",
    difficulty: "Medium",
    question: "Distinguish between disease prevalence and disease incidence.",
    answer: "Prevalence: Proportion of total existing cases at a single point in time. Incidence: Rate of new cases developing over a specified period."
  },
  {
    id: 111,
    subject: "Public Health Dentistry",
    difficulty: "Hard",
    question: "What defluoridation technique developed in India uses Alum and Lime for rural water treatment?",
    answer: "The Nalgonda Technique (involves rapid mixing, flocculation, sedimentation, and filtration)."
  },
  {
    id: 112,
    subject: "Public Health Dentistry",
    difficulty: "Hard",
    question: "Which index groups are standard for WHO global oral health monitoring?",
    answer: "5 years, 12 years (global monitoring baseline), 15 years, 35-44 years, and 65-74 years."
  },
  {
    id: 113,
    subject: "Public Health Dentistry",
    difficulty: "Medium",
    question: "Explain sensitivity and specificity of a diagnostic screening test.",
    answer: "Sensitivity: Probability of a positive test in diseased individuals. Specificity: Probability of a negative test in healthy individuals."
  },
  {
    id: 114,
    subject: "Public Health Dentistry",
    difficulty: "Easy",
    question: "What is the primary prevention mechanism of pit and fissure sealants?",
    answer: "Acts as a physical barrier in deep groves to prevent bacterial plaque colonization and cut off nutrient supply."
  },
  {
    id: 115,
    subject: "Public Health Dentistry",
    difficulty: "Medium",
    question: "What is the primary source of community health statistics and surveys in India?",
    answer: "The National Family Health Survey (NFHS) and the Decennial Census of India."
  },
  {
    id: 116,
    subject: "Public Health Dentistry",
    difficulty: "Easy",
    question: "What is the main objective of school dental health programs?",
    answer: "To provide oral health education, screen for early dental disease, and apply preventive measures like fluoride gel or sealants."
  },
  {
    id: 117,
    subject: "Public Health Dentistry",
    difficulty: "Medium",
    question: "What is the difference between systemic fluoride and topical fluoride?",
    answer: "Systemic: Ingested (e.g. water, tablets) and pre-eruptive. Topical: Applied directly to teeth post-eruptively (e.g. toothpaste, varnish)."
  },
  {
    id: 118,
    subject: "Public Health Dentistry",
    difficulty: "Hard",
    question: "Define 'environmental monitoring' in relation to dental fluorosis.",
    answer: "Measuring fluoride levels in community drinking water supplies and soil to prevent endemic skeletal and dental fluorosis."
  },
  {
    id: 119,
    subject: "Public Health Dentistry",
    difficulty: "Medium",
    question: "What is the index used to assess dental fluorosis clinically?",
    answer: "Dean's Fluorosis Index (classifies teeth as normal, questionable, very mild, mild, moderate, or severe)."
  },
  {
    id: 120,
    subject: "Public Health Dentistry",
    difficulty: "Easy",
    question: "What is the core message of the World Health Organization (WHO) regarding oral health?",
    answer: "Oral health is integral to general health and well-being, and oral diseases are preventable through common risk factor interventions."
  }
];

const DENTAL_ENCOURAGEMENTS = [
  "Future dentist energy detected! 🦷💖",
  "One more card down, future doctor! 👑🩺",
  "Your dedication is beautiful. Proud of your hard work! 💖",
  "Keep going, chinnoda! You're going to be the best dentist. 💖",
  "Studying hard looks so good on you, smiloda! 🥰",
  "Don't worry, you've got this exam in the bag! 💪🎒",
  "Just a quick reminder: your smile is brighter than a dental curing light! 💡💕",
  "Take a deep breath. You're doing amazing! 🌸",
  "Rooting for you every single step of the way! 📣❤️",
  "One step closer to graduation. Keep shining, bujjoda! 💎",
  "Excellent recall! Your clinical brain is top-tier. 🧠🩺",
  "You've got that diagnostic instinct, smileedhanaa! ⚡🦷",
  "Classifications are tough, but you are tougher. Go crush it! 🏆",
  "No caries in your knowledge pool! Flawless! 💯",
  "Dentistry is an art, and you're the master. 🎨🦷"
];

export default function GamesSection() {
  const [activeGame, setActiveGame] = useState<'menu' | 'memory' | 'tictactoe' | 'truthdare' | 'guessing' | 'wordscramble' | 'reactionspeed' | 'oddemoji' | 'moviecharades' | 'passthephone' | 'howwelldoyouknowme' | 'dentalflashcards'>('menu');

  // Dental Flashcards States
  const [fcMode, setFcMode] = useState<'menu' | 'study' | 'exam' | 'results'>('menu');
  const [fcSubjectFilter, setFcSubjectFilter] = useState<string>('All');
  const [fcDifficultyFilter, setFcDifficultyFilter] = useState<string>('All');
  const [fcDeck, setFcDeck] = useState<any[]>([]);
  const [fcCurrentIdx, setFcCurrentIdx] = useState<number>(0);
  const [fcFlipped, setFcFlipped] = useState<boolean>(false);
  const [fcEncouragement, setFcEncouragement] = useState<string>('');
  
  // Spaced Repetition (Study Mode)
  const [fcReviewList, setFcReviewList] = useState<number[]>([]); // indexes of cards to review again
  const [fcKnownList, setFcKnownList] = useState<number[]>([]);   // indexes of cards marked as known
  
  // Streak & Exam States
  const [fcStreak, setFcStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('smilance_fc_streak') || '0', 10);
  });
  const [fcBestStreak, setFcBestStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('smilance_fc_best_streak') || '0', 10);
  });
  const [fcExamAnswers, setFcExamAnswers] = useState<boolean[]>([]); // true for correct, false for incorrect
  const [fcSubjectDropdownOpen, setFcSubjectDropdownOpen] = useState<boolean>(false);
  const [fcIncorrectDeck, setFcIncorrectDeck] = useState<any[]>([]);
  const [fcStats, setFcStats] = useState<Record<string, { attempts: number; correct: number }>>(() => {
    try {
      const saved = localStorage.getItem('smilance_fc_stats');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Memory Match State
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  // Tic Tac Toe State
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  // Truth or Dare State
  const [todCard, setTodCard] = useState<{ type: string, text: string } | null>(null);

  // Guessing Game State
  const [targetNumber, setTargetNumber] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [guessHistory, setGuessHistory] = useState<{guess: number, result: string}[]>([]);
  const [guessingWon, setGuessingWon] = useState(false);

  // Word Scramble State
  const [scrambleObj, setScrambleObj] = useState<{word: string, hint: string} | null>(null);
  const [scrambled, setScrambled] = useState('');
  const [scrambleInput, setScrambleInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [scrambleWon, setScrambleWon] = useState(false);

  // Reaction Speed State
  const [reactionState, setReactionState] = useState<'idle' | 'waiting' | 'ready' | 'finished'>('idle');
  const [reactionStartTime, setReactionStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const reactionTimerRef = useRef<any>(null);

  // Find Odd Emoji State
  const [oddLevel, setOddLevel] = useState(1);
  const [oddGrid, setOddGrid] = useState<string[]>([]);
  const [oddTargetIdx, setOddTargetIdx] = useState(-2);

  // Charades State
  const [charadesMovie, setCharadesMovie] = useState('');
  const [charadesTime, setCharadesTime] = useState(60);
  const [charadesActive, setCharadesActive] = useState(false);

  // Simple prompt games
  const [simplePrompt, setSimplePrompt] = useState<string>('');

  useEffect(() => {
    if (activeGame === 'memory') {
      initializeMemory();
    } else if (activeGame === 'tictactoe') {
      setBoard(Array(9).fill(null));
      setXIsNext(true);
    } else if (activeGame === 'truthdare') {
      setTodCard(null);
    } else if (activeGame === 'guessing') {
      initializeGuessing();
    } else if (activeGame === 'wordscramble') {
      initializeScramble();
    } else if (activeGame === 'reactionspeed') {
      setReactionState('idle');
    } else if (activeGame === 'oddemoji') {
      initializeOddEmoji(1);
    } else if (activeGame === 'moviecharades') {
      setCharadesMovie('');
      setCharadesTime(60);
      setCharadesActive(false);
    } else if (activeGame === 'passthephone') {
      nextSimplePrompt(PASS_PHONE_PROMPTS);
    } else if (activeGame === 'howwelldoyouknowme') {
      nextSimplePrompt(COUPLE_QUIZ);
    } else if (activeGame === 'dentalflashcards') {
      setFcMode('menu');
      setFcSubjectFilter('All');
      setFcDifficultyFilter('All');
      setFcDeck([]);
      setFcCurrentIdx(0);
      setFcFlipped(false);
      setFcEncouragement('');
      setFcReviewList([]);
      setFcKnownList([]);
      setFcExamAnswers([]);
      setFcSubjectDropdownOpen(false);
      setFcIncorrectDeck([]);
    }
    
    // Clear reaction timer on unmount/switch
    return () => {
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    }
  }, [activeGame]);

  const nextSimplePrompt = (list: string[]) => {
    setSimplePrompt(list[Math.floor(Math.random() * list.length)]);
  };

  const initializeScramble = () => {
    const obj = SCRAMBLE_WORDS[Math.floor(Math.random() * SCRAMBLE_WORDS.length)];
    setScrambleObj(obj);
    let arr = obj.word.split('');
    // Scramble logic
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setScrambled(arr.join(''));
    setScrambleInput('');
    setShowHint(false);
    setScrambleWon(false);
  };

  const checkScramble = (e: React.FormEvent) => {
    e.preventDefault();
    if (scrambleObj && scrambleInput.toUpperCase() === scrambleObj.word) {
      setScrambleWon(true);
    }
  };

  const startReactionTest = () => {
    setReactionState('waiting');
    setReactionTime(0);
    const delay = Math.floor(Math.random() * 3000) + 2000; // 2 to 5 seconds
    reactionTimerRef.current = setTimeout(() => {
      setReactionState('ready');
      setReactionStartTime(Date.now());
    }, delay);
  };

  const clickReaction = () => {
    if (reactionState === 'waiting') {
      clearTimeout(reactionTimerRef.current);
      setReactionState('finished');
      setReactionTime(-1); // Too early
    } else if (reactionState === 'ready') {
      const time = Date.now() - reactionStartTime;
      setReactionTime(time);
      setReactionState('finished');
    }
  };

  const initializeOddEmoji = (level: number) => {
    setOddLevel(level);
    const normalEmojis = ['🙂', '😎', '😐', '😟', '😥', '😲', '😴', '😏'];
    const oddEmojis    = ['🙃', '🤓', '😑', '🥺', '😓', '🥱', '😪', '😒'];
    const pairIdx = Math.floor(Math.random() * normalEmojis.length);
    
    const size = level < 3 ? 9 : (level < 6 ? 16 : 25);
    let newGrid = Array(size).fill(normalEmojis[pairIdx]);
    const targetIdx = Math.floor(Math.random() * size);
    newGrid[targetIdx] = oddEmojis[pairIdx];
    
    setOddGrid(newGrid);
    setOddTargetIdx(targetIdx);
  };

  const handleOddEmojiClick = (idx: number) => {
    if (idx === oddTargetIdx) {
      if (oddLevel >= 10) {
        // You won all 10 levels
        setOddTargetIdx(-1); // mark win
      } else {
        initializeOddEmoji(oddLevel + 1);
      }
    } else {
      // Wrong
      initializeOddEmoji(1);
    }
  };

  useEffect(() => {
    let interval: any;
    if (charadesActive && charadesTime > 0) {
      interval = setInterval(() => setCharadesTime(t => t - 1), 1000);
    } else if (charadesTime === 0) {
      setCharadesActive(false);
    }
    return () => clearInterval(interval);
  }, [charadesActive, charadesTime]);

  const startCharades = () => {
    setCharadesMovie(TELUGU_MOVIES[Math.floor(Math.random() * TELUGU_MOVIES.length)]);
    setCharadesTime(60);
    setCharadesActive(true);
  };

  const initializeGuessing = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuessInput('');
    setGuessHistory([]);
    setGuessingWon(false);
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guessingWon) return;
    const num = parseInt(guessInput);
    if (!num || num < 1 || num > 100) return;

    let result = '';
    if (num === targetNumber) {
      result = 'Correct!';
      setGuessingWon(true);
    } else if (num < targetNumber) {
      result = 'Too low!';
    } else {
      result = 'Too high!';
    }
    
    setGuessHistory([{ guess: num, result }, ...guessHistory]);
    setGuessInput('');
  };

  const initializeMemory = () => {
    const deck = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji }));
    setCards(deck);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
  };

  const handleCardClick = (idx: number) => {
    if (flipped.includes(idx) || solved.includes(idx) || flipped.length === 2) return;
    
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const isMatch = cards[newFlipped[0]].emoji === cards[newFlipped[1]].emoji;
      setTimeout(() => {
        if (isMatch) {
          setSolved(s => [...s, ...newFlipped]);
        }
        setFlipped([]);
      }, 1000);
    }
  };

  // Tic Tac Toe logic
  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClickTTT = (i: number) => {
    if (board[i] || calculateWinner(board)) return;
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const tttWinner = calculateWinner(board);
  const isDraw = !tttWinner && !board.includes(null);

  // Truth or Dare logic
  const drawTodCard = (type: 'Truth' | 'Dare') => {
    const list = type === 'Truth' ? TRUTHS : DARES;
    const randomItem = list[Math.floor(Math.random() * list.length)];
    setTodCard({ type, text: randomItem });
  };

  // Dental Flashcards logic
  const initializeDentalFlashcards = (mode: 'study' | 'exam') => {
    let filtered = DENTAL_FLASHCARDS.filter(card => {
      const matchSub = fcSubjectFilter === 'All' || card.subject === fcSubjectFilter;
      const matchDiff = fcDifficultyFilter === 'All' || card.difficulty === fcDifficultyFilter;
      return matchSub && matchDiff;
    });

    if (filtered.length === 0) {
      alert("No flashcards found matching the selected subject and difficulty filters.");
      return;
    }

    // Auto-shuffle on session start
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);

    setFcDeck(shuffled);
    setFcCurrentIdx(0);
    setFcFlipped(false);
    setFcExamAnswers([]);
    setFcReviewList([]);
    setFcKnownList([]);
    setFcIncorrectDeck([]); // clear incorrect list for new session
    setFcEncouragement(DENTAL_ENCOURAGEMENTS[Math.floor(Math.random() * DENTAL_ENCOURAGEMENTS.length)]);
    setFcMode(mode);
  };

  const flipDentalFlashcard = () => {
    setFcFlipped(!fcFlipped);
    if (!fcFlipped && fcMode === 'study') {
      setFcEncouragement(DENTAL_ENCOURAGEMENTS[Math.floor(Math.random() * DENTAL_ENCOURAGEMENTS.length)]);
    }
  };

  const handleDentalCardGrade = (isCorrectOrKnown: boolean) => {
    const currentCard = fcDeck[fcCurrentIdx];
    const cardId = currentCard.id;

    if (fcMode === 'study') {
      if (isCorrectOrKnown) {
        setFcKnownList(prev => [...prev, cardId]);
        setFcReviewList(prev => prev.filter(id => id !== cardId));
        
        const newStreak = fcStreak + 1;
        setFcStreak(newStreak);
        localStorage.setItem('smilance_fc_streak', newStreak.toString());
        if (newStreak > fcBestStreak) {
          setFcBestStreak(newStreak);
          localStorage.setItem('smilance_fc_best_streak', newStreak.toString());
        }
      } else {
        setFcReviewList(prev => prev.includes(cardId) ? prev : [...prev, cardId]);
        setFcKnownList(prev => prev.filter(id => id !== cardId));
        
        setFcStreak(0);
        localStorage.setItem('smilance_fc_streak', '0');
      }
      
      if (fcCurrentIdx < fcDeck.length - 1) {
        setFcFlipped(false);
        setFcCurrentIdx(prev => prev + 1);
      } else {
        setFcMode('results');
      }
    } else {
      // Exam Mode
      setFcExamAnswers(prev => [...prev, isCorrectOrKnown]);
      
      if (isCorrectOrKnown) {
        const newStreak = fcStreak + 1;
        setFcStreak(newStreak);
        localStorage.setItem('smilance_fc_streak', newStreak.toString());
        if (newStreak > fcBestStreak) {
          setFcBestStreak(newStreak);
          localStorage.setItem('smilance_fc_best_streak', newStreak.toString());
        }
      } else {
        setFcStreak(0);
        localStorage.setItem('smilance_fc_streak', '0');
        // Track incorrect card
        setFcIncorrectDeck(prev => [...prev, currentCard]);
      }

      // Record subject stats in localStorage and state
      setFcStats(prev => {
        const sub = currentCard.subject;
        const currentStats = prev[sub] || { attempts: 0, correct: 0 };
        const nextStats = {
          ...prev,
          [sub]: {
            attempts: currentStats.attempts + 1,
            correct: currentStats.correct + (isCorrectOrKnown ? 1 : 0)
          }
        };
        localStorage.setItem('smilance_fc_stats', JSON.stringify(nextStats));
        return nextStats;
      });

      if (fcCurrentIdx < fcDeck.length - 1) {
        setFcFlipped(false);
        setFcCurrentIdx(prev => prev + 1);
      } else {
        setFcMode('results');
      }
    }
  };

  const startIncorrectReviewSession = () => {
    if (fcIncorrectDeck.length === 0) return;
    const shuffled = [...fcIncorrectDeck].sort(() => Math.random() - 0.5);
    setFcDeck(shuffled);
    setFcCurrentIdx(0);
    setFcFlipped(false);
    setFcExamAnswers([]);
    setFcReviewList([]);
    setFcKnownList([]);
    setFcEncouragement(DENTAL_ENCOURAGEMENTS[Math.floor(Math.random() * DENTAL_ENCOURAGEMENTS.length)]);
    setFcMode('study'); // Study Mode for reviewing mistakes
  };

  const nextDentalFlashcard = () => {
    if (fcCurrentIdx < fcDeck.length - 1) {
      setFcFlipped(false);
      setFcCurrentIdx(prev => prev + 1);
    }
  };

  const prevDentalFlashcard = () => {
    if (fcCurrentIdx > 0) {
      setFcFlipped(false);
      setFcCurrentIdx(prev => prev - 1);
    }
  };

  const shuffleDentalFlashcards = () => {
    const shuffled = [...fcDeck].sort(() => Math.random() - 0.5);
    setFcDeck(shuffled);
    setFcCurrentIdx(0);
    setFcFlipped(false);
  };

  if (activeGame === 'menu') {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-amber-500 mb-6 flex justify-center items-center gap-2">
              <Gamepad2 className="w-6 h-6" /> Smiley's Arcade
           </h2>
           
           <h3 className="text-left text-rose-300 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
             <Circle className="w-3 h-3 fill-rose-500 stroke-rose-500" /> Solo Games
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              <button onClick={() => setActiveGame('dentalflashcards')} className="flex items-center p-3 bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/30 hover:border-amber-500/60 hover:bg-white/10 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.05)] hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] group">
                 <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight flex items-center gap-1">
                      Dental Viva Cards <span className="animate-pulse text-[9px] bg-rose-500/30 text-rose-300 border border-rose-500/50 px-1 py-0.5 rounded">NEW</span>
                    </h3>
                    <p className="text-[10px] text-amber-300/80">8 subjects study & quiz</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('memory')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Heart className="w-5 h-5 text-rose-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Memory Match</h3>
                    <p className="text-[10px] text-rose-300">Find pairs</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('wordscramble')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Shuffle className="w-5 h-5 text-amber-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Word Scramble</h3>
                    <p className="text-[10px] text-amber-300">Unscramble words</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('reactionspeed')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Zap className="w-5 h-5 text-cyan-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Reaction Speed Test</h3>
                    <p className="text-[10px] text-cyan-300">Test your reflexes</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('oddemoji')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Search className="w-5 h-5 text-emerald-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Find The Odd Emoji</h3>
                    <p className="text-[10px] text-emerald-300">Find the hidden difference</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('guessing')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Number Guess</h3>
                    <p className="text-[10px] text-blue-300">Find the secret number</p>
                 </div>
              </button>
           </div>

           <h3 className="text-left text-fuchsia-300 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
             <Circle className="w-3 h-3 fill-fuchsia-500 stroke-fuchsia-500" /> Friend Games
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              <button onClick={() => setActiveGame('moviecharades')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-fuchsia-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Film className="w-5 h-5 text-fuchsia-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Telugu Charades</h3>
                    <p className="text-[10px] text-fuchsia-300">Act movies without speaking</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('tictactoe')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Users className="w-5 h-5 text-teal-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Tic Tac Toe</h3>
                    <p className="text-[10px] text-teal-300">Classic rules</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('truthdare')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Dices className="w-5 h-5 text-purple-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Truth or Dare</h3>
                    <p className="text-[10px] text-purple-300">Party game</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('passthephone')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Smartphone className="w-5 h-5 text-orange-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Pass The Phone</h3>
                    <p className="text-[10px] text-orange-300">Perfect for bus trips</p>
                 </div>
              </button>
           </div>

           <h3 className="text-left text-pink-300 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
             <Circle className="w-3 h-3 fill-pink-500 stroke-pink-500" /> Couple Games
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button onClick={() => setActiveGame('howwelldoyouknowme')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <UserPlus className="w-5 h-5 text-pink-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">How Well Do You Know Me?</h3>
                    <p className="text-[10px] text-pink-300">Relationship Quiz</p>
                 </div>
              </button>
           </div>

        </div>
      </div>
    );
  }

  const HeartIcon = Heart;

  const showConfetti = 
    (activeGame === 'memory' && solved.length === 16) ||
    (activeGame === 'guessing' && guessingWon) ||
    (activeGame === 'tictactoe' && tttWinner) ||
    (activeGame === 'wordscramble' && scrambleWon) ||
    (activeGame === 'oddemoji' && oddTargetIdx === -1) ||
    (activeGame === 'dentalflashcards' && fcMode === 'results' && (fcExamAnswers.length === 0 || fcExamAnswers.filter(Boolean).length === fcDeck.length));

  return (
    <div className="flex flex-col gap-4 relative">
      <button onClick={() => setActiveGame('menu')} className="text-sm font-bold text-gray-300 hover:text-white flex items-center transition-colors self-start uppercase tracking-wider mb-2">
        <ChevronLeft className="w-6 h-6 mr-1" /> Back to Arcade
      </button>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti 
            width={window.innerWidth} 
            height={window.innerHeight} 
            recycle={false} 
            numberOfPieces={600} 
            gravity={0.15}
            colors={['#f43f5e', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']}
          />
        </div>
      )}

      {activeGame === 'memory' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-rose-400 mb-2 font-sans tracking-tight">Memory Match</h2>
           
           <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-3 mb-6 font-bold font-sans">
              <span className="text-rose-400">Moves: {moves}</span>
              <span className="text-emerald-400">Matches: {solved.length / 2} / 8</span>
           </div>
           
           <div className="grid grid-cols-4 gap-3 mb-8 perspective-1000">
              {cards.map((card, idx) => {
                 const isFlipped = flipped.includes(idx) || solved.includes(idx);
                 return (
                   <div 
                     key={idx} 
                     onClick={() => handleCardClick(idx)}
                     className={`relative aspect-square cursor-pointer transition-transform duration-500 preserve-3d ${
                       isFlipped ? 'rotate-y-180' : ''
                     }`}
                     style={{ transformStyle: 'preserve-3d' }}
                   >
                     {/* Front (Hidden) */}
                     <div className="absolute inset-0 backface-hidden bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center shadow-md">
                       <HeartIcon className="w-6 h-6 text-rose-500/40" />
                     </div>
                     
                     {/* Back (Revealed) */}
                     <div 
                       className="absolute inset-0 backface-hidden bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                       style={{ transform: 'rotateY(180deg)' }}
                     >
                       {card.emoji}
                     </div>
                   </div>
                 )
              })}
           </div>

           {solved.length === 16 && (
              <div className="text-center mb-6 animate-pulse">
                 <h3 className="text-xl font-bold text-amber-400 flex items-center justify-center gap-2">
                   <Heart className="w-5 h-5 text-amber-500 fill-amber-500" /> You Won Smiley!
                 </h3>
                 <p className="text-xs text-amber-400/60 mt-1">Great job!</p>
              </div>
           )}
           
           <button onClick={initializeMemory} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:scale-[1.02] transition-transform">
              <RefreshCcw className="w-5 h-5" /> Restart Game
           </button>
        </div>
      )}

      {activeGame === 'tictactoe' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-emerald-400 mb-6 font-sans tracking-tight">Tic Tac Toe</h2>
           
           <div className="flex justify-center items-center mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-bold border ${tttWinner || isDraw ? (tttWinner ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-gray-500/20 border-gray-500 text-gray-400') : (xIsNext ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-pink-500/20 border-pink-500 text-pink-400')}`}>
                 {tttWinner ? `Winner: ${tttWinner}` : isDraw ? "It's a Draw!" : `Next Player: ${xIsNext ? 'X' : 'O'}`}
              </span>
           </div>
           
           <div className="grid grid-cols-3 gap-2 w-64 mx-auto mb-8 bg-white/10 p-2 rounded-2xl">
              {board.map((cell, idx) => (
                 <button 
                   key={idx} 
                   onClick={() => handleClickTTT(idx)}
                   className="w-full aspect-square bg-gray-900/80 hover:bg-gray-800 rounded-xl flex items-center justify-center text-4xl font-black transition-colors"
                 >
                   {cell === 'X' && <X className="w-10 h-10 text-cyan-400" strokeWidth={3} />}
                   {cell === 'O' && <Circle className="w-8 h-8 text-pink-400" strokeWidth={3} />}
                 </button>
              ))}
           </div>
           
           <button onClick={() => { setBoard(Array(9).fill(null)); setXIsNext(true); }} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-transform">
              <RefreshCcw className="w-5 h-5" /> Restart Game
           </button>
        </div>
      )}

      {activeGame === 'truthdare' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-purple-400 mb-6 font-sans tracking-tight">Truth or Dare</h2>
           
           {todCard ? (
             <div className="w-full min-h-[220px] bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 border border-purple-500/30 rounded-2xl p-6 flex flex-col items-center justify-center mb-8 shadow-inner animate-fadeIn">
                <span className={`text-sm font-black uppercase tracking-widest mb-4 ${todCard.type === 'Truth' ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {todCard.type}
                </span>
                <p className="text-xl text-white font-serif italic text-balance mb-6">{todCard.text}</p>
                <button onClick={() => setTodCard(null)} className="text-xs text-white/50 hover:text-white uppercase tracking-widest font-bold px-4 py-2 border border-white/10 rounded-full transition-colors">
                  Clear Card
                </button>
             </div>
           ) : (
             <div className="w-full min-h-[220px] border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center mb-8 p-6">
                <p className="text-sm text-white/40 uppercase tracking-widest font-bold text-balance">
                  Choose your fate
                </p>
             </div>
           )}
           
           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => drawTodCard('Truth')} className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold p-4 rounded-xl transition-colors text-lg tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                 Truth
              </button>
              <button onClick={() => drawTodCard('Dare')} className="bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 font-bold p-4 rounded-xl transition-colors text-lg tracking-wide shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                 Dare
              </button>
           </div>
        </div>
      )}

      {activeGame === 'guessing' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-blue-400 mb-2 font-sans tracking-tight">Number Guess</h2>
           <p className="text-white/60 text-sm mb-6">I am thinking of a number between 1 and 100.</p>

           <div className="mb-6">
              {guessingWon ? (
                <div className="animate-pulse">
                  <h3 className="text-2xl font-black text-blue-400 mb-2">You Got It!</h3>
                  <p className="text-white text-lg">The number was {targetNumber}</p>
                </div>
              ) : (
                <form onSubmit={handleGuessSubmit} className="flex gap-2 justify-center">
                  <input 
                    type="number" 
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    className="w-24 bg-white/10 border-2 border-white/20 rounded-xl text-center text-xl font-bold text-white focus:border-blue-500 outline-none p-3"
                    placeholder="??"
                    min="1"
                    max="100"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 rounded-xl transition-colors">
                    Guess
                  </button>
                </form>
              )}
           </div>

           <div className="bg-white/5 rounded-xl p-4 min-h-[120px] max-h-[160px] overflow-y-auto w-full max-w-[240px] mx-auto flex flex-col gap-2 mb-6">
              {guessHistory.length === 0 && !guessingWon && (
                <span className="text-white/30 text-sm italic my-auto">No guesses yet...</span>
              )}
              {guessHistory.map((g, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm font-bold border-b border-white/5 pb-1">
                  <span className="text-white">{g.guess}</span>
                  <span className={g.result === 'Correct!' ? 'text-blue-400' : (g.result === 'Too low!' ? 'text-cyan-400' : 'text-rose-400')}>
                    {g.result}
                  </span>
                </div>
              ))}
           </div>

           <button onClick={initializeGuessing} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-transform">
              <RefreshCcw className="w-5 h-5" /> {guessingWon ? 'Play Again' : 'Restart Game'}
           </button>
        </div>
      )}
      {activeGame === 'wordscramble' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-amber-500 mb-6 font-sans tracking-tight">Word Scramble</h2>
           
           <div className="mb-8">
              {scrambleWon ? (
                 <div className="animate-pulse">
                   <h3 className="text-2xl font-black text-amber-400 mb-2">Correct!</h3>
                   <p className="text-white text-lg">The word was {scrambleObj?.word}</p>
                 </div>
              ) : (
                <>
                  <div className="text-4xl font-black tracking-[0.2em] text-white mb-6 bg-white/5 p-6 rounded-2xl border border-white/10 break-all shadow-inner">
                    {scrambled}
                  </div>
                  
                  {showHint && (
                    <p className="text-amber-300/80 text-sm italic mb-6">Hint: {scrambleObj?.hint}</p>
                  )}
                  
                  <form onSubmit={checkScramble} className="flex flex-col gap-4 max-w-[240px] mx-auto">
                    <input 
                      type="text" 
                      value={scrambleInput}
                      onChange={(e) => setScrambleInput(e.target.value.toUpperCase())}
                      className="bg-white/10 border-2 border-white/20 rounded-xl text-center text-xl font-bold text-white focus:border-amber-500 outline-none p-3 uppercase"
                      placeholder="Type word..."
                    />
                    <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold p-3 rounded-xl transition-colors">
                      Check Word
                    </button>
                    {!showHint && (
                      <button type="button" onClick={() => setShowHint(true)} className="text-xs text-amber-400/60 hover:text-amber-400 font-bold uppercase tracking-widest mt-2 transition-colors">
                        Show Hint
                      </button>
                    )}
                  </form>
                </>
              )}
           </div>

           <button onClick={initializeScramble} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] transition-transform">
              <RefreshCcw className="w-5 h-5" /> {scrambleWon ? 'Next Word' : 'Skip Word'}
           </button>
        </div>
      )}

      {activeGame === 'reactionspeed' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-cyan-400 mb-6 font-sans tracking-tight">Reaction Speed Test</h2>
           
           <div 
             onClick={clickReaction}
             className={`w-full aspect-square max-w-[300px] mx-auto rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-colors border-4 shadow-xl mb-6 select-none ${
               reactionState === 'idle' ? 'bg-white/5 border-white/10 hover:bg-white/10' :
               reactionState === 'waiting' ? 'bg-rose-500 border-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.5)]' :
               reactionState === 'ready' ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.5)] transform scale-[1.02]' :
               reactionTime > 0 ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-rose-500/20 border-rose-500/50'
             }`}
           >
             {reactionState === 'idle' && (
               <div className="text-white/60 font-bold">Tap here to start.<br/><br/>Wait for green.</div>
             )}
             {reactionState === 'waiting' && (
               <div className="text-white text-3xl font-black uppercase tracking-widest">Wait...</div>
             )}
             {reactionState === 'ready' && (
               <div className="text-white text-5xl font-black uppercase tracking-widest">TAP!</div>
             )}
             {reactionState === 'finished' && (
               <div className="flex flex-col items-center gap-2">
                 {reactionTime === -1 ? (
                   <>
                     <span className="text-4xl">🙈</span>
                     <span className="text-rose-400 font-bold text-xl uppercase tracking-widest">Too Early!</span>
                   </>
                 ) : (
                   <>
                     <span className="text-cyan-400 font-black text-5xl">{reactionTime}<span className="text-2xl text-cyan-500/70 ml-1">ms</span></span>
                     <span className="text-cyan-200 text-sm font-bold uppercase tracking-widest">Reaction Time</span>
                   </>
                 )}
               </div>
             )}
           </div>

           <button onClick={startReactionTest} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] transition-transform">
              <Zap className="w-5 h-5 fill-white" /> {(reactionState === 'idle') ? 'Start Test' : 'Try Again'}
           </button>
        </div>
      )}

      {activeGame === 'oddemoji' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-emerald-400 mb-2 font-sans tracking-tight">Find The Odd Emoji</h2>
           
           <div className="flex justify-between items-center mb-6">
              <span className="text-white/50 text-sm font-bold">Find the difference</span>
              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-black border border-emerald-500/30">Level {oddLevel}</span>
           </div>
           
           {oddTargetIdx === -1 ? (
              <div className="py-12 animate-pulse">
                 <h3 className="text-3xl font-black text-emerald-400 mb-2">You Won Smiley!</h3>
                 <p className="text-white text-lg">Amazing Eyesight!</p>
              </div>
           ) : (
              <div 
                className="grid gap-2 mx-auto mb-8 bg-white/5 p-4 rounded-3xl"
                style={{ 
                  gridTemplateColumns: `repeat(${Math.sqrt(oddGrid.length)}, minmax(0, 1fr))`,
                  maxWidth: oddLevel < 3 ? '240px' : oddLevel < 6 ? '280px' : '320px'
                }}
              >
                {oddGrid.map((emoji, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleOddEmojiClick(idx)}
                    className="aspect-square bg-black/20 hover:bg-white/10 rounded-xl flex items-center justify-center text-3xl transition-transform active:scale-90"
                    style={{ fontSize: oddLevel < 3 ? '40px' : oddLevel < 6 ? '32px' : '24px' }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
           )}

           <button onClick={() => initializeOddEmoji(1)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-transform">
              <RefreshCcw className="w-5 h-5" /> {oddTargetIdx === -1 ? 'Play Again' : 'Restart Game'}
           </button>
        </div>
      )}

      {activeGame === 'moviecharades' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-fuchsia-400 mb-6 font-sans tracking-tight">Telugu Charades</h2>
           
           <div className="w-full min-h-[220px] bg-gradient-to-br from-fuchsia-900/40 to-pink-900/40 border border-fuchsia-500/30 rounded-2xl p-6 flex flex-col items-center justify-center mb-8 shadow-inner shadow-[inset_0_0_40px_rgba(217,70,239,0.1)]">
              {charadesActive ? (
                <>
                  <p className="text-sm text-fuchsia-300 font-bold uppercase tracking-widest mb-4">Act this movie:</p>
                  <h3 className="text-4xl text-white font-black mb-8 leading-tight drop-shadow-md">{charadesMovie}</h3>
                  <div className="flex items-center gap-2 text-3xl font-mono text-fuchsia-400 font-bold">
                    <span className="w-3 h-3 rounded-full bg-fuchsia-500 animate-pulse"></span>
                    {charadesTime}s
                  </div>
                </>
              ) : (
                <div className="text-center opacity-60">
                  <Film className="w-16 h-16 text-white mb-4 mx-auto" />
                  <p className="text-white font-bold uppercase tracking-widest text-sm">Tap start to get a movie</p>
                </div>
              )}
           </div>

           <button onClick={startCharades} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:scale-[1.02] transition-transform">
              {charadesActive ? <RefreshCcw className="w-5 h-5" /> : <Film className="w-5 h-5" />} 
              {charadesActive ? 'Skip & Draw New' : 'Start Timer'}
           </button>
        </div>
      )}

      {(activeGame === 'passthephone' || activeGame === 'howwelldoyouknowme') && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title mb-6 font-sans tracking-tight" style={{ color: activeGame === 'passthephone' ? '#f97316' : '#ec4899' }}>
             {activeGame === 'passthephone' ? 'Pass The Phone' : 'Relationship Quiz'}
           </h2>
           
           <div className={`w-full min-h-[260px] bg-gradient-to-br ${activeGame === 'passthephone' ? 'from-orange-900/40 to-red-900/40 border-orange-500/30' : 'from-pink-900/40 to-rose-900/40 border-pink-500/30'} border rounded-2xl p-8 flex flex-col items-center justify-center mb-8 shadow-inner`}>
              <p className="text-2xl text-white font-serif italic text-balance mb-6">{simplePrompt}</p>
           </div>
           
           <button 
             onClick={() => nextSimplePrompt(activeGame === 'passthephone' ? PASS_PHONE_PROMPTS : COUPLE_QUIZ)} 
             className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r text-white font-bold p-4 rounded-xl hover:scale-[1.02] transition-transform ${activeGame === 'passthephone' ? 'from-orange-500 to-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'from-pink-500 to-pink-600 shadow-[0_0_20px_rgba(236,72,153,0.3)]'}`}
           >
              <Shuffle className="w-5 h-5" /> {activeGame === 'passthephone' ? 'Next Prompt' : 'Next Question'}
           </button>
         </div>
       )}

      {activeGame === 'dentalflashcards' && (
        <div className="dark-card text-center p-6 bg-black/40">
          <h2 className="heading-title text-amber-500 mb-2 font-sans tracking-tight flex justify-center items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-400" /> Dental Viva Cards
          </h2>
          <p className="text-white/60 text-xs mb-6 font-sans">Master your 8 dental subjects with study cards & mock exams.</p>

          {/* Setup Menu */}
          {fcMode === 'menu' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Streak Board */}
              <div className="flex justify-around items-center bg-white/5 border border-white/10 rounded-2xl p-4 font-sans">
                <div className="text-center">
                  <span className="block text-white/50 text-[10px] uppercase font-bold tracking-wider">Current Streak</span>
                  <span className="text-2xl font-black text-amber-400">🔥 {fcStreak}</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <span className="block text-white/50 text-[10px] uppercase font-bold tracking-wider">Best Streak</span>
                  <span className="text-2xl font-black text-rose-400">🏆 {fcBestStreak}</span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-4 text-left">
                <div className="relative">
                  <label className="block text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 font-sans">Filter by Subject</label>
                  <button
                    type="button"
                    onClick={() => setFcSubjectDropdownOpen(!fcSubjectDropdownOpen)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl p-3 text-sm text-white font-semibold outline-none flex justify-between items-center transition-all focus:border-amber-500"
                  >
                    <span>{fcSubjectFilter === 'All' ? 'All Subjects (8 subjects)' : fcSubjectFilter}</span>
                    <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${fcSubjectDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {fcSubjectDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setFcSubjectDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 mt-2 bg-neutral-900/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 backdrop-blur-md animate-fadeIn max-h-60 overflow-y-auto">
                        {[
                          { value: 'All', label: 'All Subjects (8 subjects)' },
                          { value: 'Oral Medicine & Radiology', label: 'Oral Medicine & Radiology' },
                          { value: 'Oral Maxillofacial Surgery', label: 'Oral Maxillofacial Surgery' },
                          { value: 'Conservative Dentistry & Endodontics', label: 'Conservative Dentistry & Endodontics' },
                          { value: 'Prosthodontics', label: 'Prosthodontics' },
                          { value: 'Periodontics', label: 'Periodontics' },
                          { value: 'Pedodontics', label: 'Pedodontics' },
                          { value: 'Orthodontics', label: 'Orthodontics' },
                          { value: 'Public Health Dentistry', label: 'Public Health Dentistry' }
                        ].map((sub) => (
                          <button
                            key={sub.value}
                            type="button"
                            onClick={() => {
                              setFcSubjectFilter(sub.value);
                              setFcSubjectDropdownOpen(false);
                            }}
                            className={`w-full text-left p-3 text-sm transition-colors hover:bg-white/10 ${
                              fcSubjectFilter === sub.value ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-white/80'
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 font-sans">Difficulty Level</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setFcDifficultyFilter(diff)}
                        className={`p-2 text-xs font-bold rounded-xl border transition-all ${
                          fcDifficultyFilter === diff 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subject Mastery Dashboard */}
              {Object.keys(fcStats).length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 font-sans text-left">
                  <h3 className="text-xs font-black text-rose-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" /> Subject Mastery Dashboard
                  </h3>
                  <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-1">
                    {[
                      "Oral Medicine & Radiology",
                      "Oral Maxillofacial Surgery",
                      "Conservative Dentistry & Endodontics",
                      "Prosthodontics",
                      "Periodontics",
                      "Pedodontics",
                      "Orthodontics",
                      "Public Health Dentistry"
                    ].map(sub => {
                      const stats = fcStats[sub] || { attempts: 0, correct: 0 };
                      const pct = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
                      return (
                        <div key={sub} className="text-xs">
                          <div className="flex justify-between items-center text-white/80 mb-1">
                            <span className="font-semibold truncate max-w-[240px]">{sub}</span>
                            <span className="font-bold text-amber-400">
                              {stats.attempts > 0 ? `${pct}% (${stats.correct}/${stats.attempts})` : '0% (no attempts)'}
                            </span>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : stats.attempts > 0 ? 'bg-rose-500' : 'bg-white/10'
                              }`}
                              style={{ width: `${stats.attempts > 0 ? pct : 0}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to reset your subject stats?")) {
                        setFcStats({});
                        localStorage.removeItem('smilance_fc_stats');
                      }
                    }}
                    className="mt-3 text-[10px] text-white/40 hover:text-rose-400 transition-colors uppercase font-bold tracking-wider"
                  >
                    Reset Dashboard Stats
                  </button>
                </div>
              )}

              {/* Start Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <button
                  onClick={() => initializeDentalFlashcards('study')}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/30 rounded-2xl transition-all shadow-[0_4px_15px_rgba(245,158,11,0.1)] hover:scale-[1.02]"
                >
                  <span className="text-2xl mb-1">📖</span>
                  <span className="text-white font-bold text-base">Study Mode</span>
                  <span className="text-[10px] text-amber-300/60 mt-1">Study cards & view sweet notes</span>
                </button>

                <button
                  onClick={() => initializeDentalFlashcards('exam')}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-rose-500/20 to-rose-600/20 hover:from-rose-500/30 hover:to-rose-600/30 border border-rose-500/30 rounded-2xl transition-all shadow-[0_4px_15px_rgba(244,63,94,0.1)] hover:scale-[1.02]"
                >
                  <span className="text-2xl mb-1">✍️</span>
                  <span className="text-white font-bold text-base">Exam Mode</span>
                  <span className="text-[10px] text-rose-300/60 mt-1">Self-grade your recall & score</span>
                </button>
              </div>
            </div>
          )}

          {/* Card Study/Exam Screen */}
          {(fcMode === 'study' || fcMode === 'exam') && fcDeck.length > 0 && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              {/* Header Info */}
              <div className="flex justify-between items-center text-xs">
                <button 
                  onClick={() => setFcMode('menu')} 
                  className="text-white/50 hover:text-white font-bold uppercase tracking-wider flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-0.5" /> Options
                </button>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-amber-400 font-bold">{fcDeck[fcCurrentIdx].subject}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black border ${
                    fcDeck[fcCurrentIdx].difficulty === 'Easy' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                    fcDeck[fcCurrentIdx].difficulty === 'Medium' ? 'bg-amber-500/20 border-amber-500 text-amber-400' :
                    'bg-rose-500/20 border-rose-500 text-rose-400'
                  }`}>
                    {fcDeck[fcCurrentIdx].difficulty}
                  </span>
                </div>
                <span className="text-white/40 font-bold">{fcCurrentIdx + 1} / {fcDeck.length}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
                  style={{ width: `${((fcCurrentIdx + 1) / fcDeck.length) * 100}%` }}
                />
              </div>

              {/* Streak Tracker during study */}
              <div className="flex justify-center text-xs font-black text-amber-400 bg-white/5 border border-white/10 rounded-full py-1.5 px-4 self-center">
                🔥 Current Streak: {fcStreak}
              </div>

              {/* 3D Flashcard */}
              <div 
                onClick={flipDentalFlashcard}
                className="w-full aspect-[4/3] max-w-[420px] min-h-[260px] mx-auto cursor-pointer relative transition-transform duration-500 preserve-3d animate-fadeIn"
                style={{ transform: fcFlipped ? 'rotateY(180deg)' : 'none', transformStyle: 'preserve-3d' }}
              >
                {/* Question Face (Front) */}
                <div className="absolute inset-0 backface-hidden bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
                  <div className="text-left text-[10px] uppercase font-bold text-rose-300 tracking-widest font-sans">Question</div>
                  <div className="my-auto text-base md:text-lg text-white font-serif leading-relaxed text-balance">
                    {fcDeck[fcCurrentIdx].question}
                  </div>
                  <div className="text-xs text-white/30 uppercase tracking-widest font-black flex items-center justify-center gap-1.5 font-sans">
                     🔄 Tap Card to Reveal Answer
                  </div>
                </div>

                {/* Answer Face (Back) */}
                <div 
                  className="absolute inset-0 backface-hidden bg-gray-900/95 border border-white/20 rounded-3xl p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <div className="text-left text-[10px] uppercase font-bold text-emerald-400 tracking-widest font-sans">Answer</div>
                  <div className="my-auto text-xs md:text-sm text-gray-200 leading-relaxed font-sans text-left">
                    {fcDeck[fcCurrentIdx].answer}
                  </div>

                  {/* Study Mode: Kanna's Encouragement */}
                  {fcMode === 'study' && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-left animate-fadeIn mt-2 shrink-0">
                      <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-black uppercase tracking-wider mb-1 font-sans">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> Message from Kanna
                      </div>
                      <p className="text-xs text-rose-300 italic font-serif leading-snug">
                        "{fcEncouragement}"
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-white/30 uppercase tracking-widest font-black shrink-0 font-sans">
                     🔄 Tap Card to flip back
                  </div>
                </div>
              </div>

              {/* Action Buttons (Appears under flipped card) */}
              {fcFlipped && (
                <div className="grid grid-cols-2 gap-4 max-w-[420px] w-full mx-auto animate-slideDown">
                  {fcMode === 'study' ? (
                    <>
                      <button 
                        onClick={() => handleDentalCardGrade(false)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold p-3.5 rounded-2xl transition-colors text-sm flex items-center justify-center gap-1.5 font-sans"
                      >
                        🔄 Review Again
                      </button>
                      <button 
                        onClick={() => handleDentalCardGrade(true)}
                        className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-bold p-3.5 rounded-2xl transition-colors text-sm flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-sans"
                      >
                        ✅ I Know This
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleDentalCardGrade(false)}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold p-3.5 rounded-2xl transition-colors text-sm flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.2)] font-sans"
                      >
                        ❌ Incorrect
                      </button>
                      <button 
                        onClick={() => handleDentalCardGrade(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3.5 rounded-2xl transition-colors text-sm flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-sans"
                      >
                        ✔️ Correct
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Bottom Standard Study Navigation (Study Mode only) */}
              {fcMode === 'study' && (
                <div className="flex justify-between items-center max-w-[420px] w-full mx-auto border-t border-white/5 pt-4 mt-2 font-sans">
                  <button 
                    onClick={prevDentalFlashcard} 
                    disabled={fcCurrentIdx === 0}
                    className="text-xs font-bold text-white/50 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors uppercase tracking-wider"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={shuffleDentalFlashcards}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors uppercase tracking-wider"
                  >
                    <Shuffle className="w-3.5 h-3.5" /> Shuffle
                  </button>
                  <button 
                    onClick={nextDentalFlashcard} 
                    disabled={fcCurrentIdx === fcDeck.length - 1}
                    className="text-xs font-bold text-white/50 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors uppercase tracking-wider"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Screen */}
          {fcMode === 'results' && (
            <div className="flex flex-col gap-6 max-w-[420px] mx-auto animate-fadeIn font-sans">
              <div className="text-center">
                <span className="text-6xl block mb-2">🎉</span>
                <h3 className="text-2xl font-black text-white">Deck Finished!</h3>
                <p className="text-white/60 text-sm mt-1">Excellent job reviewing your material.</p>
              </div>

              {/* Study Mode Results Summary */}
              {fcExamAnswers.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 text-left text-sm font-semibold">
                  <div className="flex justify-between text-white border-b border-white/5 pb-2">
                    <span>Total Cards Studied:</span>
                    <span className="font-bold">{fcDeck.length}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Marked as Known:</span>
                    <span className="font-bold">{fcKnownList.length}</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>Need to Review:</span>
                    <span className="font-bold">{fcReviewList.length}</span>
                  </div>
                </div>
              ) : (
                /* Exam Mode Results Summary */
                <div className="flex flex-col gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    <span className="text-xs uppercase font-black text-rose-300 tracking-widest block mb-2">Final Score</span>
                    <span className="text-5xl font-black text-amber-400">
                      {fcExamAnswers.filter(Boolean).length} <span className="text-2xl text-white/40">/ {fcDeck.length}</span>
                    </span>
                    <span className="block text-xs text-white/60 mt-3 font-semibold">
                      {fcExamAnswers.filter(Boolean).length === fcDeck.length 
                        ? "🏆 Perfect Score! You're a Dental Genius! 👑" 
                        : "👍 Great effort! Review your mistakes below to lock in the facts."}
                    </span>
                  </div>

                  {/* Wrong Answers Review */}
                  <div className="text-left">
                    <h4 className="text-xs font-black text-rose-300 uppercase tracking-widest mb-3">Exam Review</h4>
                    <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto bg-white/5 border border-white/10 rounded-2xl p-3">
                      {fcDeck.map((card, idx) => (
                        <div key={idx} className="border-b border-white/5 pb-2 last:border-b-0">
                          <div className="flex items-start gap-2 text-xs">
                            <span className={fcExamAnswers[idx] ? 'text-emerald-400' : 'text-rose-400'}>
                              {fcExamAnswers[idx] ? '✔️' : '❌'}
                            </span>
                            <div className="flex-1">
                              <p className="text-white font-bold">{card.question}</p>
                              <p className="text-white/60 mt-1">Ans: {card.answer}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* End Card Encouragement */}
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-left">
                <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-black uppercase tracking-wider mb-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> End-of-Session Love
                </div>
                <p className="text-xs text-rose-300 italic font-serif leading-relaxed">
                  "Every minute you spend studying is a minute closer to building our dream future. I am so proud of how hard you work, my little doctor! Rest your eyes now. 💕"
                </p>
              </div>

              {/* Retry / exit buttons */}
              <div className="flex flex-col gap-2">
                {fcIncorrectDeck.length > 0 && (
                  <button
                    onClick={startIncorrectReviewSession}
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold p-4 rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                  >
                    🔄 Review Mistakes ({fcIncorrectDeck.length} {fcIncorrectDeck.length === 1 ? 'card' : 'cards'})
                  </button>
                )}
                <button
                  onClick={() => {
                    setFcMode('menu');
                    setFcStreak(0);
                    localStorage.setItem('smilance_fc_streak', '0');
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold p-4 rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  Configure New Study Session
                </button>
                <button
                  onClick={() => setActiveGame('menu')}
                  className="w-full text-xs text-white/50 hover:text-white uppercase font-bold tracking-widest py-2 hover:bg-white/5 rounded-xl transition-all"
                >
                  Exit to Arcade Menu
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HeartIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}
