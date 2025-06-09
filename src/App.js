import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Dumbbell, BarChart2, Activity, Info, Trophy, Target, TrendingUp, ArrowLeft, Camera } from 'lucide-react';

/* global __firebase_config, __app_id, __initial_auth_token */

// --- Firebase Configuration ---
const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG ? JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG) : {};
const appId = process.env.REACT_APP_APP_ID || 'default-boug-app';

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- SVG Flag Components ---
const FlagUSA = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 10">
    <defs><clipPath id="a"><path d="M0 0h19v10H0z"/></clipPath></defs>
    <g clipPath="url(#a)">
      <path fill="#D2232C" d="M0 0h19v10H0z"/>
      <path stroke="#FFF" strokeWidth="1.25" d="M0 1.25h19M0 3.75h19M0 6.25h19M0 8.75h19"/>
      <path fill="#002664" d="M0 0h9.5v5H0z"/>
    </g>
  </svg>
);

const FlagFrance = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
    <path fill="#002654" d="M0 0h300v600H0z"/>
    <path fill="#fff" d="M300 0h300v600H300z"/>
    <path fill="#ED2939" d="M600 0h300v600H600z"/>
  </svg>
);


// --- Internationalization & Workout Data ---
const locales = {
  en: {
    ui: {
      appName: "Bou G",
      loading: "Loading Your Personalized Workout...",
      workout: "Workout",
      report: "Report",
      day: "Day",
      weekId: "Week",
      reportTitle: "Weekly Report",
      completion: "Completion",
      completed: "Completed",
      totalExercises: "Total Exercises",
      dailyBreakdown: "Daily Breakdown",
      suggestionTitle: "Suggestion for Next Week",
      generateIllustration: "Generate Illustration",
      generating: "Generating...",
      showInfo: "Show Info",
      hideInfo: "Hide Info",
      yourUserId: "Your User ID",
      footerNote: "Workout plan customized for your goals. Stay consistent!",
      reportError: "Could not load your weekly report. Please try again later.",
      noReportData: "No data available to generate a report."
    },
    motivationMessages: [
      "Awesome work!", "You've got this!", "Keep pushing!", "One step closer!", "Nailed it!", "Feeling strong!"
    ],
    suggestions: {
      start: "Let's get started this week!",
      goodStart: "Good start! Aim for consistency on all workout days.",
      greatWork: "Great work! You're building a strong habit. Push for a few more exercises next week.",
      excellent: "Excellent consistency! You're very close to a perfect week. Keep up the momentum!",
      perfect: "Perfect week! You've crushed your goals. Consider increasing weights or reps next week."
    },
    workoutPlan: {
      1: {
        dayName: "Upper Body Push & HIIT",
        focus: "Chest, Shoulders, Triceps",
        exercises: [
          { name: "Barbell Bench Press", sets: "4 sets", reps: "6-8 reps", advice: "Keep your back flat on the bench and feet firmly on the ground for stability.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing a barbell bench press, showing proper form. Fitness diagram style, white background." },
          { name: "Incline Dumbbell Press", sets: "3 sets", reps: "8-12 reps", advice: "Focus on squeezing your chest at the top of the movement. Don't lock out your elbows.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing an incline dumbbell press on a bench. Fitness diagram style, white background." },
          { name: "Overhead Press", sets: "4 sets", reps: "6-8 reps", advice: "Engage your core to protect your lower back. Press the bar straight up.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing a standing barbell overhead press. Fitness diagram style, white background." },
          { name: "Lateral Raises", sets: "3 sets", reps: "12-15 reps", advice: "Avoid using momentum. Lift the weights with a controlled motion, leading with your elbows.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing dumbbell lateral raises. Fitness diagram style, white background." },
          { name: "Tricep Pushdowns", sets: "3 sets", reps: "10-15 reps", advice: "Keep your elbows tucked into your sides throughout the entire movement.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing a tricep pushdown with a cable machine. Fitness diagram style, white background." },
          { name: "HIIT: Treadmill Sprints", sets: "10 rounds", reps: "30s sprint, 60s walk", advice: "Push your hardest during the sprints, and use the walk to recover your breath.", prompt: "Dynamic action shot of a fit man sprinting at high speed on a treadmill. Fitness illustration style, sense of motion." },
        ]
      },
      2: {
        dayName: "Upper Body Pull & LISS",
        focus: "Back, Biceps",
        exercises: [
          { name: "Barbell Rows", sets: "4 sets", reps: "6-8 reps", advice: "Maintain a flat back and pull the bar towards your lower chest. Squeeze your shoulder blades together.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing a bent-over barbell row. Fitness diagram style, white background." },
          { name: "Lat Pulldowns", sets: "4 sets", reps: "8-12 reps", advice: "Lead with your elbows and pull the bar down to your upper chest. Focus on using your back muscles.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing a lat pulldown on a cable machine. Fitness diagram style, white background." },
          { name: "Seated Cable Rows", sets: "3 sets", reps: "10-12 reps", advice: "Keep your torso upright and pull the handle to your stomach. Avoid leaning back too much.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing a seated cable row. Fitness diagram style, white background." },
          { name: "Face Pulls", sets: "3 sets", reps: "15-20 reps", advice: "Pull the rope towards your face, aiming to get your hands by your ears. Great for shoulder health.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing a face pull with a rope on a cable machine. Fitness diagram style, white background." },
          { name: "Dumbbell Bicep Curls", sets: "3 sets", reps: "10-15 reps", advice: "Keep your elbows stationary at your sides. Avoid swinging the weights.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing standing dumbbell bicep curls. Fitness diagram style, white background." },
          { name: "LISS: Incline Walk", sets: "1 session", reps: "30 mins, steady pace", advice: "Maintain a consistent pace at a challenging incline to keep your heart rate elevated.", prompt: "Illustration of a man walking at a steady pace on an inclined treadmill. Fitness style." },
        ]
      },
       3: {
        dayName: "Leg Day",
        focus: "Quads, Hamstrings, Glutes",
        exercises: [
          { name: "Barbell Squats", sets: "4 sets", reps: "6-8 reps", advice: "Keep your chest up and back straight. Go down until your thighs are at least parallel to the floor.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing a barbell back squat. Fitness diagram style, white background." },
          { name: "Romanian Deadlifts", sets: "3 sets", reps: "8-12 reps", advice: "Hinge at your hips, keeping your legs almost straight (slight bend). Feel the stretch in your hamstrings.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing a Romanian deadlift with a barbell. Fitness diagram style, white background." },
          { name: "Leg Press", sets: "3 sets", reps: "10-15 reps", advice: "Don't let your lower back round off the pad. Control the weight on the way down.", prompt: "A clear, detailed, anatomically correct visual illustration of a man using a leg press machine. Fitness diagram style, white background." },
          { name: "Leg Curls", sets: "3 sets", reps: "12-15 reps", advice: "Focus on squeezing your hamstrings to curl the weight. Avoid using your lower back.", prompt: "A clear, detailed, anatomically correct visual illustration of a man using a lying leg curl machine. Fitness diagram style, white background." },
          { name: "Calf Raises", sets: "4 sets", reps: "15-20 reps", advice: "Get a full stretch at the bottom and a powerful squeeze at the top of the movement.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing standing calf raises. Fitness diagram style, white background." },
          { name: "Treadmill Cool-down", sets: "1 session", reps: "15 mins, light jog", advice: "Gradually lower your heart rate. This helps with recovery.", prompt: "Illustration of a man doing a light jog on a treadmill for a cool-down. Relaxed fitness style." },
        ]
      },
      4: {
        dayName: "Full Body & Core",
        focus: "Strength & Stability",
        exercises: [
          { name: "Dumbbell Goblet Squats", sets: "3 sets", reps: "8-10 reps", advice: "Hold one dumbbell vertically against your chest. Keep your torso upright as you squat.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing a dumbbell goblet squat. Fitness diagram style, white background." },
          { name: "Dumbbell Bench Press", sets: "3 sets", reps: "8-10 reps", advice: "Provides more stability challenge than a barbell. Control the dumbbells through the full range of motion.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing a flat dumbbell bench press. Fitness diagram style, white background." },
          { name: "One-Arm Dumbbell Rows", sets: "3 sets", reps: "8-10 reps / arm", advice: "Support yourself with one hand on a bench. Pull the dumbbell up towards your hip, not your chest.", prompt: "A clear, detailed, anatomically correct visual illustration of a man performing a one-arm dumbbell row. Fitness diagram style, white background." },
          { name: "Arnold Press", sets: "3 sets", reps: "10-12 reps", advice: "This exercise involves rotation, so use a lighter weight to master the form first.", prompt: "A clear, detailed, anatomically correct visual illustration showing the sequence of an Arnold press with dumbbells. Fitness diagram style, white background." },
          { name: "Plank", sets: "3 sets", reps: "Hold to failure", advice: "Keep a straight line from your head to your heels. Don't let your hips sag.", prompt: "A clear, detailed, anatomically correct visual illustration of a man holding a proper plank position. Fitness diagram style, white background." },
          { name: "Treadmill Run", sets: "1 session", reps: "15 mins, moderate pace", advice: "Find a pace you can maintain for the full 15 minutes to build cardiovascular endurance.", prompt: "Illustration of a man running at a steady, moderate pace on a treadmill. Fitness style." },
        ]
      },
      5: {
        dayName: "Active Recovery & Cardio",
        focus: "Endurance & Flexibility",
        exercises: [
          { name: "LISS Cardio: Treadmill Walk", sets: "1 session", reps: "45 mins, brisk walk", advice: "Keep your heart rate in a steady, low-intensity zone. This is great for burning fat and recovery.", prompt: "Illustration of a man doing a brisk walk on a treadmill for a long-duration cardio session. Fitness style." },
          { name: "Foam Rolling", sets: "1 session", reps: "10-15 mins", advice: "Slowly roll over tight muscle groups to release tension and improve flexibility.", prompt: "A clear illustration of a person using a foam roller on their leg muscles. Relaxed fitness diagram style, white background." },
          { name: "Stretching", sets: "1 session", reps: "10-15 mins", advice: "Hold each stretch for 20-30 seconds. Focus on major muscle groups worked during the week.", prompt: "A clear illustration of a person doing a full-body stretching routine, holding a hamstring stretch. Fitness diagram style, white background." },
        ]
      }
    }
  },
  fr: {
    ui: {
      appName: "Bou G",
      loading: "Chargement de votre entraînement personnalisé...",
      workout: "Entraînement",
      report: "Rapport",
      day: "Jour",
      weekId: "Semaine",
      reportTitle: "Rapport Hebdomadaire",
      completion: "Complétion",
      completed: "Terminés",
      totalExercises: "Total d'exercices",
      dailyBreakdown: "Répartition quotidienne",
      suggestionTitle: "Suggestion pour la semaine prochaine",
      generateIllustration: "Générer l'illustration",
      generating: "Génération...",
      showInfo: "Plus d'infos",
      hideInfo: "Cacher infos",
      yourUserId: "Votre ID utilisateur",
      footerNote: "Plan d'entraînement personnalisé pour vos objectifs. Restez constant!",
      reportError: "Impossible de charger votre rapport hebdomadaire. Veuillez réessayer plus tard.",
      noReportData: "Aucune donnée disponible pour générer un rapport."
    },
    motivationMessages: [
      "Super travail!", "Tu es capable!", "Continue comme ça!", "Un pas de plus!", "Réussi!", "En pleine forme!"
    ],
    suggestions: {
      start: "Commençons cette semaine!",
      goodStart: "Bon début! Essayez d'être constant tous les jours d'entraînement.",
      greatWork: "Excellent travail! Vous créez une bonne habitude. Essayez quelques exercices de plus la semaine prochaine.",
      excellent: "Excellente constance! Vous êtes très près d'une semaine parfaite. Gardez cet élan!",
      perfect: "Semaine parfaite! Vous avez pulvérisé vos objectifs. Envisagez d'augmenter les poids ou les répétitions la semaine prochaine."
    },
    workoutPlan: {
      1: {
        dayName: "Haut du corps (Poussée) & HIIT",
        focus: "Pectoraux, Épaules, Triceps",
        exercises: [
          { name: "Développé couché à la barre", sets: "4 séries", reps: "6-8 reps", advice: "Gardez votre dos plat sur le banc et les pieds fermement au sol pour la stabilité.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant un développé couché à la barre, montrant la bonne forme. Style de diagramme de fitness, fond blanc." },
          { name: "Développé incliné avec haltères", sets: "3 séries", reps: "8-12 reps", advice: "Concentrez-vous sur la contraction de vos pectoraux en haut du mouvement. Ne bloquez pas vos coudes.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant un développé incliné avec haltères sur un banc. Style de diagramme de fitness, fond blanc." },
          { name: "Développé militaire à la barre", sets: "4 séries", reps: "6-8 reps", advice: "Contractez vos abdominaux pour protéger votre bas du dos. Poussez la barre bien droit.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant un développé militaire debout à la barre. Style de diagramme de fitness, fond blanc." },
          { name: "Élévations latérales", sets: "3 séries", reps: "12-15 reps", advice: "Évitez d'utiliser l'élan. Soulevez les poids de manière contrôlée, en menant avec les coudes.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant des élévations latérales avec haltères. Style de diagramme de fitness, fond blanc." },
          { name: "Poussées à la poulie pour triceps", sets: "3 séries", reps: "10-15 reps", advice: "Gardez vos coudes près de vos flancs pendant tout le mouvement.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant une poussée pour les triceps à la machine à câble. Style de diagramme de fitness, fond blanc." },
          { name: "HIIT: Sprints sur tapis roulant", sets: "10 tours", reps: "30s sprint, 60s marche", advice: "Donnez tout pendant les sprints et utilisez la marche pour récupérer votre souffle.", prompt: "Photo d'action dynamique d'un homme en forme sprintant à grande vitesse sur un tapis roulant. Style d'illustration de fitness, sensation de mouvement." },
        ]
      },
       2: {
        dayName: "Haut du corps (Tirage) & LISS",
        focus: "Dos, Biceps",
        exercises: [
            { name: "Rowing barre buste penché", sets: "4 séries", reps: "6-8 reps", advice: "Gardez le dos plat et tirez la barre vers le bas de votre poitrine. Serrez les omoplates.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant un rowing barre buste penché. Style de diagramme de fitness, fond blanc." },
            { name: "Tirage vertical à la poulie haute", sets: "4 séries", reps: "8-12 reps", advice: "Menez avec les coudes et tirez la barre vers le haut de votre poitrine. Concentrez-vous sur l'utilisation de vos muscles du dos.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant un tirage vertical à la machine à câble. Style de diagramme de fitness, fond blanc." },
            { name: "Rowing assis à la poulie basse", sets: "3 séries", reps: "10-12 reps", advice: "Gardez le torse droit et tirez la poignée vers votre ventre. Évitez de trop vous pencher en arrière.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant un rowing assis à la poulie basse. Style de diagramme de fitness, fond blanc." },
            { name: "Face pulls", sets: "3 séries", reps: "15-20 reps", advice: "Tirez la corde vers votre visage, en visant à amener vos mains près de vos oreilles. Excellent pour la santé des épaules.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant un face pull avec une corde à la machine à câble. Style de diagramme de fitness, fond blanc." },
            { name: "Flexions des biceps avec haltères", sets: "3 séries", reps: "10-15 reps", advice: "Gardez vos coudes immobiles sur les côtés. Évitez de balancer les poids.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant des flexions de biceps debout avec haltères. Style de diagramme de fitness, fond blanc." },
            { name: "LISS: Marche inclinée", sets: "1 session", reps: "30 mins, rythme constant", advice: "Maintenez un rythme constant sur une pente difficile pour garder votre fréquence cardiaque élevée.", prompt: "Illustration d'un homme marchant à un rythme constant sur un tapis roulant incliné. Style fitness." },
        ]
      },
      3: {
        dayName: "Jour des jambes",
        focus: "Quadriceps, Ischio-jambiers, Fessiers",
        exercises: [
            { name: "Squats à la barre", sets: "4 séries", reps: "6-8 reps", advice: "Gardez la poitrine haute et le dos droit. Descendez jusqu'à ce que vos cuisses soient au moins parallèles au sol.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant un squat arrière à la barre. Style de diagramme de fitness, fond blanc." },
            { name: "Soulevé de terre roumain", sets: "3 séries", reps: "8-12 reps", advice: "Basculez au niveau des hanches, en gardant les jambes presque droites (légère flexion). Sentez l'étirement dans vos ischio-jambiers.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant un soulevé de terre roumain avec une barre. Style de diagramme de fitness, fond blanc." },
            { name: "Presse à cuisses", sets: "3 séries", reps: "10-15 reps", advice: "Ne laissez pas le bas de votre dos s'arrondir sur le coussin. Contrôlez le poids en descendant.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme utilisant une presse à cuisses. Style de diagramme de fitness, fond blanc." },
            { name: "Flexions des jambes", sets: "3 séries", reps: "12-15 reps", advice: "Concentrez-vous sur la contraction de vos ischio-jambiers pour enrouler le poids. Évitez d'utiliser le bas de votre dos.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme utilisant une machine de flexion des jambes allongée. Style de diagramme de fitness, fond blanc." },
            { name: "Élévations des mollets", sets: "4 séries", reps: "15-20 reps", advice: "Obtenez un étirement complet en bas et une forte contraction en haut du mouvement.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant des élévations de mollets debout. Style de diagramme de fitness, fond blanc." },
            { name: "Récupération sur tapis roulant", sets: "1 session", reps: "15 mins, jogging léger", advice: "Abaissez progressivement votre fréquence cardiaque. Cela aide à la récupération.", prompt: "Illustration d'un homme faisant un jogging léger sur un tapis roulant pour récupérer. Style fitness décontracté." },
        ]
      },
      4: {
        dayName: "Corps complet & Tronc",
        focus: "Force & Stabilité",
        exercises: [
            { name: "Goblet Squats avec haltère", sets: "3 séries", reps: "8-10 reps", advice: "Tenez un haltère verticalement contre votre poitrine. Gardez le torse droit pendant que vous squattez.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant un goblet squat avec haltère. Style de diagramme de fitness, fond blanc." },
            { name: "Développé couché avec haltères", sets: "3 séries", reps: "8-10 reps", advice: "Fournit un plus grand défi de stabilité qu'une barre. Contrôlez les haltères sur toute l'amplitude du mouvement.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant un développé couché plat avec haltères. Style de diagramme de fitness, fond blanc." },
            { name: "Rowing à un bras avec haltère", sets: "3 séries", reps: "8-10 reps / bras", advice: "Soutenez-vous avec une main sur un banc. Tirez l'haltère vers votre hanche, pas votre poitrine.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme effectuant un rowing à un bras avec haltère. Style de diagramme de fitness, fond blanc." },
            { name: "Développé Arnold", sets: "3 séries", reps: "10-12 reps", advice: "Cet exercice implique une rotation, alors utilisez un poids plus léger pour maîtriser la forme d'abord.", prompt: "Une illustration visuelle claire et anatomiquement correcte montrant la séquence d'un développé Arnold avec des haltères. Style de diagramme de fitness, fond blanc." },
            { name: "Planche", sets: "3 séries", reps: "Tenir jusqu'à l'échec", advice: "Gardez une ligne droite de la tête aux talons. Ne laissez pas vos hanches s'affaisser.", prompt: "Une illustration visuelle claire, détaillée et anatomiquement correcte d'un homme tenant une position de planche correcte. Style de diagramme de fitness, fond blanc." },
            { name: "Course sur tapis roulant", sets: "1 session", reps: "15 mins, rythme modéré", advice: "Trouvez un rythme que vous pouvez maintenir pendant les 15 minutes pour développer l'endurance cardiovasculaire.", prompt: "Illustration d'un homme courant à un rythme régulier et modéré sur un tapis roulant. Style fitness." },
        ]
      },
      5: {
        dayName: "Récupération active & Cardio",
        focus: "Endurance & Flexibilité",
        exercises: [
            { name: "Cardio LISS: Marche sur tapis roulant", sets: "1 session", reps: "45 mins, marche rapide", advice: "Maintenez votre fréquence cardiaque dans une zone stable et de faible intensité. C'est excellent pour brûler les graisses et récupérer.", prompt: "Illustration d'un homme faisant une marche rapide sur un tapis roulant pour une séance de cardio de longue durée. Style fitness." },
            { name: "Roulage avec rouleau en mousse", sets: "1 session", reps: "10-15 mins", advice: "Roulez lentement sur les groupes musculaires tendus pour relâcher la tension et améliorer la flexibilité.", prompt: "Une illustration claire d'une personne utilisant un rouleau en mousse sur les muscles de ses jambes. Style de diagramme de fitness décontracté, fond blanc." },
            { name: "Étirements", sets: "1 session", reps: "10-15 mins", advice: "Maintenez chaque étirement pendant 20 à 30 secondes. Concentrez-vous sur les principaux groupes musculaires travaillés pendant la semaine.", prompt: "Une illustration claire d'une personne faisant une routine d'étirements du corps entier, tenant un étirement des ischio-jambiers. Style de diagramme de fitness, fond blanc." },
        ]
      }
    }
  }
};


// --- Helper Functions ---
const getWeekId = (date = new Date()) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return `${date.getFullYear()}-W${Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)}`;
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- Main App Component ---
export default function App() {
  const [lang, setLang] = useState('en');
  const [currentDay, setCurrentDay] = useState(() => new Date().getDay() || 1);
  const [view, setView] = useState('workout');
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [motivation, setMotivation] = useState({ show: false, text: '' });

  const t = locales[lang].ui;
  const workoutPlan = locales[lang].workoutPlan;

  // --- Authentication Effect ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                 await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                 await signInAnonymously(auth);
            }
        } catch (error) {
            console.error("Authentication Error:", error);
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const showMotivation = () => {
    const message = getRandomItem(locales[lang].motivationMessages);
    setMotivation({ show: true, text: message });
    setTimeout(() => {
      setMotivation({ show: false, text: '' });
    }, 2500);
  };
  
  const changeDay = (direction) => {
    setCurrentDay(prev => {
      let nextDay = prev + direction;
      if (nextDay > 5) nextDay = 1;
      if (nextDay < 1) nextDay = 5;
      return nextDay;
    });
  };

  if (!isAuthReady) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Dumbbell className="w-12 h-12 animate-bounce text-indigo-400" />
          <p className="text-lg text-gray-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
      <MotivationalToast message={motivation.text} show={motivation.show} />
      <header className="bg-gray-800/80 backdrop-blur-sm p-4 sticky top-0 z-20 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-indigo-400" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{t.appName}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setView('workout')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${view === 'workout' ? 'bg-indigo-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
              {t.workout}
            </button>
            <button onClick={() => setView('report')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${view === 'report' ? 'bg-indigo-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
              {t.report}
            </button>
            <button onClick={() => setLang(lang === 'en' ? 'fr' : 'en')} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center">
                {lang === 'en' ? <FlagFrance className="w-6 h-auto rounded-sm" /> : <FlagUSA className="w-6 h-auto rounded-sm" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6">
        {view === 'workout' ? (
          <WorkoutView
            userId={userId}
            isAuthReady={isAuthReady}
            currentDay={currentDay}
            workoutData={workoutPlan[currentDay]}
            changeDay={changeDay}
            t={t}
            onComplete={showMotivation}
          />
        ) : (
          <WeeklyReportView
            userId={userId}
            isAuthReady={isAuthReady}
            setView={setView}
            t={t}
            locales={locales}
            lang={lang}
          />
        )}
      </main>

      <footer className="text-center p-4 text-gray-500 text-xs border-t border-gray-800">
        <p>{t.yourUserId}: <span className="font-mono bg-gray-800 p-1 rounded">{userId}</span></p>
        <p className="mt-1">{t.footerNote}</p>
      </footer>
    </div>
  );
}

function MotivationalToast({ message, show }) {
  if (!show) return null;
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
      <p className="font-semibold">{message}</p>
    </div>
  );
}

function WorkoutView({ userId, isAuthReady, currentDay, workoutData, changeDay, t, onComplete }) {
  const weekId = getWeekId();
  const [completion, setCompletion] = useState({});

  useEffect(() => {
    if (!isAuthReady || !userId) return;
    const docRef = doc(db, 'artifacts', appId, 'users', userId, 'progress', weekId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setCompletion(docSnap.exists() ? docSnap.data() : {});
    }, console.error);
    return () => unsubscribe();
  }, [isAuthReady, userId, weekId]);

  const handleToggleComplete = async (exerciseName, currentStatus) => {
    if (!userId) return;
    const newStatus = !currentStatus;
    if (newStatus) { // Only show motivation on completion
      onComplete();
    }
    const docRef = doc(db, 'artifacts', appId, 'users', userId, 'progress', weekId);
    try {
      await setDoc(docRef, { [exerciseName]: newStatus }, { merge: true });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl shadow-lg">
        <button onClick={() => changeDay(-1)} className="p-2 rounded-full bg-gray-700 hover:bg-indigo-500 transition-colors"><ChevronLeft /></button>
        <div className="text-center">
          <p className="text-sm text-indigo-400 font-semibold">{t.day} {currentDay}</p>
          <h2 className="text-xl md:text-2xl font-bold">{workoutData.dayName}</h2>
          <p className="text-gray-400 text-sm">{workoutData.focus}</p>
        </div>
        <button onClick={() => changeDay(1)} className="p-2 rounded-full bg-gray-700 hover:bg-indigo-500 transition-colors"><ChevronRight /></button>
      </div>

      <div className="space-y-4">
        {workoutData.exercises.map((exercise, index) => (
          <ExerciseCard
            key={`${currentDay}-${index}`}
            exercise={exercise}
            isCompleted={!!completion[exercise.name]}
            onToggleComplete={() => handleToggleComplete(exercise.name, !!completion[exercise.name])}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}

function ExerciseCard({ exercise, isCompleted, onToggleComplete, t }) {
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateImage = async () => {
      if (imgSrc) { // If image already exists, just toggle visibility
          setIsInfoVisible(!isInfoVisible);
          return;
      }
      setIsInfoVisible(true);
      setIsLoading(true);
      setError(null);

      try {
          const payload = { instances: [{ prompt: exercise.prompt }], parameters: { "sampleCount": 1 } };
          const apiKey = "";
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

          const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
              throw new Error(`API error: ${response.statusText}`);
          }

          const result = await response.json();
          if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
              setImgSrc(`data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`);
          } else {
              throw new Error("No image data in API response.");
          }
      } catch (err) {
          console.error("Image generation failed:", err);
          setError("Failed to generate image.");
      } finally {
          setIsLoading(false);
      }
  };


  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-indigo-500/20 hover:ring-1 hover:ring-indigo-500">
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-white">{exercise.name}</h3>
          <p className="text-indigo-300 text-sm">{exercise.sets}, {exercise.reps}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={generateImage} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <Info className="w-5 h-5 text-gray-400" />
          </button>
          <button onClick={onToggleComplete} className="flex items-center gap-2 text-lg">
            {isCompleted ? <CheckCircle2 className="w-8 h-8 text-green-400" /> : <Circle className="w-8 h-8 text-gray-600" />}
          </button>
        </div>
      </div>
      {isInfoVisible && (
        <div className="p-4 bg-gray-800/50 border-t border-gray-700 space-y-4">
            <div className="italic text-gray-400 bg-gray-700/50 p-3 rounded-lg">
                <p>{exercise.advice}</p>
            </div>
            {isLoading && 
                <div className="w-full h-64 flex flex-col justify-center items-center bg-gray-700/50 rounded-lg">
                    <Camera className="w-10 h-10 text-indigo-400 animate-pulse" />
                    <p className="mt-2 text-gray-400">{t.generating}</p>
                </div>
            }
            {error && <p className="text-red-400 text-center">{error}</p>}
            {imgSrc && !isLoading && 
                <img src={imgSrc} alt={`Illustration of ${exercise.name}`} className="w-full h-auto rounded-lg object-cover" />
            }
        </div>
      )}
    </div>
  );
}


function WeeklyReportView({ userId, isAuthReady, setView, t, locales, lang }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const generateReport = useCallback(async () => {
        if (!isAuthReady || !userId) return;
        setLoading(true);
        setError(null);
        
        try {
            const weekId = getWeekId();
            const progressRef = doc(db, 'artifacts', appId, 'users', userId, 'progress', weekId);
            const progressSnap = await getDoc(progressRef);
            const progressData = progressSnap.exists() ? progressSnap.data() : {};

            const originalWorkoutPlan = locales['en'].workoutPlan; // Use english names for keys
            const localizedWorkoutPlan = locales[lang].workoutPlan;

            let totalExercises = 0;
            let completedExercises = 0;
            const dailyCompletion = {};

            Object.keys(originalWorkoutPlan).forEach(day => {
                const dayExercises = originalWorkoutPlan[day].exercises;
                totalExercises += dayExercises.length;
                let completedToday = 0;
                
                dayExercises.forEach(ex => {
                    if (progressData[ex.name]) { // check completion using non-translated name
                        completedExercises++;
                        completedToday++;
                    }
                });
                dailyCompletion[day] = {
                    total: dayExercises.length,
                    completed: completedToday,
                    dayName: localizedWorkoutPlan[day].dayName
                };
            });
            
            const completionPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
            
            const suggestions = locales[lang].suggestions;
            let suggestion = suggestions.start;
            if (completionPercentage >= 100) suggestion = suggestions.perfect;
            else if (completionPercentage >= 80) suggestion = suggestions.excellent;
            else if (completionPercentage >= 50) suggestion = suggestions.greatWork;
            else if (completionPercentage > 0) suggestion = suggestions.goodStart;

            setReport({ totalExercises, completedExercises, completionPercentage, dailyCompletion, suggestion, weekId });
        } catch (err) {
            console.error("Error generating report:", err);
            setError(t.reportError);
        } finally {
            setLoading(false);
        }
    }, [isAuthReady, userId, t, lang, locales]);

    useEffect(() => {
        generateReport();
    }, [generateReport]);

    if (loading) {
        return <div className="text-center p-10"><Dumbbell className="w-10 h-10 mx-auto animate-spin text-indigo-400"/> <p className="mt-4">{t.generating}</p></div>;
    }

    if (error) {
        return <div className="text-center p-10 bg-red-900/20 rounded-lg"><p className="text-red-400">{error}</p></div>;
    }
    
    if (!report) {
         return <div className="text-center p-10"><p>{t.noReportData}</p></div>
    }

    return (
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 space-y-6 animate-fade-in">
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{t.reportTitle}</h2>
                    <p className="text-indigo-400">{t.weekId} {report.weekId.split('-W')[1]}</p>
                </div>
                <button onClick={() => setView('workout')} className="p-2 rounded-full bg-gray-700 hover:bg-indigo-500 transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
                    <Target className="w-8 h-8 text-green-400" />
                    <div><p className="text-gray-400 text-sm">{t.completion}</p><p className="text-2xl font-bold">{report.completionPercentage}%</p></div>
                </div>
                 <div className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    <div><p className="text-gray-400 text-sm">{t.completed}</p><p className="text-2xl font-bold">{report.completedExercises}</p></div>
                </div>
                 <div className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
                    <Dumbbell className="w-8 h-8 text-red-400" />
                    <div><p className="text-gray-400 text-sm">{t.totalExercises}</p><p className="text-2xl font-bold">{report.totalExercises}</p></div>
                </div>
            </div>

            <div>
                 <h3 className="font-bold text-lg mb-3">{t.dailyBreakdown}</h3>
                 <div className="space-y-2">
                     {Object.keys(report.dailyCompletion).map(day => {
                         const dayData = report.dailyCompletion[day];
                         const percentage = dayData.total > 0 ? (dayData.completed / dayData.total) * 100 : 0;
                         return (
                            <div key={day} className="bg-gray-700/50 p-3 rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-sm">{dayData.dayName}</span>
                                    <span className="text-xs text-gray-400">{dayData.completed} / {dayData.total}</span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-2.5">
                                    <div className="bg-indigo-500 h-2.5 rounded-full" style={{width: `${percentage}%`}}></div>
                                </div>
                            </div>
                         )
                     })}
                 </div>
            </div>

            <div className="bg-indigo-900/30 border border-indigo-700 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-indigo-300 flex items-center gap-2"><TrendingUp/> {t.suggestionTitle}</h3>
                <p className="text-gray-300">{report.suggestion}</p>
            </div>
        </div>
    );
}
