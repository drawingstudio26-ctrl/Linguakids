// grprogress.js - Enhanced Progress Tracking System for German Learning App

// === Progress Data Structure ===
function getDefaultProgress() {
  return {
    level1: {
      alphabets: { completed: 0, total: 30 },
      numbers: { completed: 0, total: 100 }
    },
    level2: {
      fruits: { completed: 0, total: 10 },
      vegetables: { completed: 0, total: 10 },
      animals: { completed: 0, total: 10 },
      birds: { completed: 0, total: 10 },
      vehicles: { completed: 0, total: 10 },
      colors: { completed: 0, total: 10 }
    },
    level3: {
      greetings: { completed: 0, total: 10 },
      activities: { completed: 0, total: 10 },
      questions: { completed: 0, total: 5 }
    },
    games: {
      // FIX 1: Change 'total' to 1 for all games.
      // One completion (increment=1) now equals 100% completion for this category.
      'fill-blanks': { completed: 0, total: 1 }, 
      'match-words': { completed: 0, total: 1 }, 
      'count-apples': { completed: 0, total: 1 } 
    },
    achievements: {
      firstSteps: false,
      alphabetMaster: false,
      numberWhiz: false,
      wordExpert: false,
      sentenceBuilder: false,
      gameChampion: false,
      weekStreak: false,
      monthStreak: false
    },
    streak: {
      count: 0,
      lastDate: null
    },
    sessionDate: new Date().toDateString()
  };
}

// === Initialize Progress System ===
function initProgress() {
  if (!localStorage.getItem('grprogress')) {
    const defaultProgress = getDefaultProgress();
    localStorage.setItem('grprogress', JSON.stringify(defaultProgress));
    console.log("Created new progress data");
  }
  
  // Always update streak when initializing
  updateStreak();
  return JSON.parse(localStorage.getItem('grprogress'));
}

// === Update Streak ===
function updateStreak() {
  const progress = JSON.parse(localStorage.getItem('grprogress'));
  const today = new Date().toDateString();
  
  console.log("Streak update - Current:", progress.streak.count, "Last date:", progress.streak.lastDate, "Today:", today);
  
  // If no last date, start streak
  if (!progress.streak.lastDate) {
    progress.streak.count = 1;
    progress.streak.lastDate = today;
    progress.sessionDate = today;
    localStorage.setItem('grprogress', JSON.stringify(progress));
    console.log("New streak started: 1 day");
    return;
  }
  
  // If already visited today, no change needed
  if (progress.streak.lastDate === today) {
    console.log("Already visited today, streak unchanged:", progress.streak.count);
    return;
  }
  
  // Calculate day difference
  const lastDate = new Date(progress.streak.lastDate);
  const todayDate = new Date(today);
  const diffTime = Math.abs(todayDate - lastDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  console.log("Days since last visit:", diffDays);
  
  if (diffDays === 1) {
    // Consecutive day - increment streak
    progress.streak.count++;
    console.log("Consecutive day! Streak increased to:", progress.streak.count);
    checkStreakAchievements(progress.streak.count);
  } else if (diffDays > 1) {
    // Broken streak - reset to 1
    progress.streak.count = 1;
    console.log("Streak broken. Reset to 1");
  }
  
  // Update dates
  progress.streak.lastDate = today;
  progress.sessionDate = today;
  localStorage.setItem('grprogress', JSON.stringify(progress));
  
  console.log("Final streak:", progress.streak.count);
}

// === Enhanced Update Progress (General category view / Game completion) ===
function updateProgress(level, category, increment = 1) {
  const progress = JSON.parse(localStorage.getItem('grprogress'));
  
  console.log(`Updating progress: Level=${level}, Category=${category}, Increment=${increment}`);
  
  if (progress[level] && progress[level][category]) {
    // Check if progress is already tracked for this specific general activity today
    const progressKey = `${level}_${category}_${new Date().toDateString()}`;
    if (sessionStorage.getItem(progressKey) && increment >= 1) {
      console.log(`General progress for ${level}.${category} already tracked today.`);
      return false; 
    }

    // Use standard increment, capped at total
    progress[level][category].completed += increment;
    
    // Ensure we don't exceed total
    if (progress[level][category].completed > progress[level][category].total) {
      progress[level][category].completed = progress[level][category].total;
    }
    
    // Set session lock only if increment is >= 1 (full activity completed)
    if (increment >= 1) {
      sessionStorage.setItem(progressKey, 'true');
    }
    
    console.log(`New progress: ${progress[level][category].completed}/${progress[level][category].total}`);
    
    checkCompletionAchievements(progress);
    localStorage.setItem('grprogress', JSON.stringify(progress));
    return true;
  }
  
  console.error(`Progress category not found: ${level}.${category}`);
  return false;
}

// === Enhanced Level 2 Progress Tracking (Per Item) ===
function updateLevel2WordProgress(category, wordIndex) {
  const progress = JSON.parse(localStorage.getItem('grprogress'));
  
  if (progress.level2 && progress.level2[category]) {
    const wordKey = `word_${category}_${wordIndex}_tracked_${new Date().toDateString()}`; // Use date for daily reset
    
    if (sessionStorage.getItem(wordKey)) {
      console.log(`Word ${wordIndex} in ${category} already tracked today.`);
      return false;
    }

    // Increment completed count by 1
    if (progress.level2[category].completed < progress.level2[category].total) {
      progress.level2[category].completed = Math.min(
        progress.level2[category].completed + 1,
        progress.level2[category].total
      );
      
      sessionStorage.setItem(wordKey, 'true'); // Set lock for this specific item
      
      console.log(`Level 2 progress updated: ${category} - ${progress.level2[category].completed}/${progress.level2[category].total}`);
      
      checkCompletionAchievements(progress);
      localStorage.setItem('grprogress', JSON.stringify(progress));
    }
    return true;
  }
  
  return false;
}

// === Enhanced Level 3 Progress Tracking (Per Item) ===
function updateLevel3SentenceProgress(category, sentenceIndex) {
  const progress = JSON.parse(localStorage.getItem('grprogress'));
  
  if (progress.level3 && progress.level3[category]) {
    const sentenceKey = `sentence_${category}_${sentenceIndex}_tracked_${new Date().toDateString()}`; // Use date for daily reset
    
    if (sessionStorage.getItem(sentenceKey)) {
      console.log(`Sentence ${sentenceIndex} in ${category} already tracked today.`);
      return false;
    }

    // Increment completed count by 1
    if (progress.level3[category].completed < progress.level3[category].total) {
      progress.level3[category].completed = Math.min(
        progress.level3[category].completed + 1,
        progress.level3[category].total
      );
      
      sessionStorage.setItem(sentenceKey, 'true'); // Set lock for this specific item
      
      console.log(`Level 3 progress updated: ${category} - ${progress.level3[category].completed}/${progress.level3[category].total}`);
      
      checkCompletionAchievements(progress);
      localStorage.setItem('grprogress', JSON.stringify(progress));
    }
    return true;
  }
  
  return false;
}

// === Check Achievements ===
function checkCompletionAchievements(progress) {
  let earnedAchievement = false;
  
  // Check if any progress has been made
  const totalProgress = 
    Object.values(progress.level1).reduce((sum, cat) => sum + cat.completed, 0) +
    Object.values(progress.level2).reduce((sum, cat) => sum + cat.completed, 0) +
    Object.values(progress.level3).reduce((sum, cat) => sum + cat.completed, 0) +
    Object.values(progress.games).reduce((sum, cat) => sum + cat.completed, 0);
  
  if (totalProgress > 0 && !progress.achievements.firstSteps) {
    progress.achievements.firstSteps = true;
    earnedAchievement = true;
    showAchievementToast("Erste Schritte! (First Steps!)", "You've completed your first activity!");
  }
  
  // Alphabet Master - learn all letters
  const alphabetProgress = progress.level1.alphabets.completed / progress.level1.alphabets.total;
  if (alphabetProgress >= 0.8 && !progress.achievements.alphabetMaster) {
    progress.achievements.alphabetMaster = true;
    earnedAchievement = true;
    showAchievementToast("Alphabet-Meister! (Alphabet Master!)", "You've learned most of the letters!");
  }
  
  // Number Whiz - know 50+ numbers
  if (progress.level1.numbers.completed >= 50 && !progress.achievements.numberWhiz) {
    progress.achievements.numberWhiz = true;
    earnedAchievement = true;
    showAchievementToast("Zahlen-Ass! (Number Whiz!)", "You know your numbers well!");
  }
  
  // Word Expert - master 3 word categories (80% completion)
  const level2Categories = Object.keys(progress.level2);
  const completedLevel2 = level2Categories.filter(cat => 
    progress.level2[cat].completed / progress.level2[cat].total >= 0.8
  ).length;
  
  if (completedLevel2 >= 3 && !progress.achievements.wordExpert) {
    progress.achievements.wordExpert = true;
    earnedAchievement = true;
    showAchievementToast("Wort-Experte! (Word Expert!)", "You've mastered 3 word categories!");
  }
  
  // Sentence Builder - complete 2 sentence categories
  const level3Categories = Object.keys(progress.level3);
  const completedLevel3 = level3Categories.filter(cat => 
    progress.level3[cat].completed / progress.level3[cat].total >= 0.8
  ).length;
  
  if (completedLevel3 >= 2 && !progress.achievements.sentenceBuilder) {
    progress.achievements.sentenceBuilder = true;
    earnedAchievement = true;
    showAchievementToast("Satz-Bauer! (Sentence Builder!)", "You can form simple sentences!");
  }
  
  // Game Champion - play 2 different games (Checks if completed >= 1)
  const gamesPlayed = Object.values(progress.games).filter(game => game.completed >= 1).length;
  if (gamesPlayed >= 2 && !progress.achievements.gameChampion) {
    progress.achievements.gameChampion = true;
    earnedAchievement = true;
    showAchievementToast("Spiele-Champion! (Game Champion!)", "You've tried multiple games!");
  }
  
  if (earnedAchievement) {
    localStorage.setItem('grprogress', JSON.stringify(progress));
  }
}

// === Check Streak Achievements ===
function checkStreakAchievements(streak) {
  const progress = JSON.parse(localStorage.getItem('grprogress'));
  let earnedAchievement = false;
  
  if (streak >= 7 && !progress.achievements.weekStreak) {
    progress.achievements.weekStreak = true;
    earnedAchievement = true;
    showAchievementToast("7-Tage-Serie! (7-Day Streak!)", "You've practiced for 7 days in a row!");
  }
  
  if (streak >= 30 && !progress.achievements.monthStreak) {
    progress.achievements.monthStreak = true;
    earnedAchievement = true;
    showAchievementToast("30-Tage-Serie! (30-Day Streak!)", "You're a dedicated learner!");
  }
  
  if (earnedAchievement) {
    localStorage.setItem('grprogress', JSON.stringify(progress));
  }
}

// === Show Achievement Toast ===
function showAchievementToast(title, description) {
  let toast = document.getElementById('achievementToast');
  
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'achievementToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #58cc02;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Quicksand', Arial, sans-serif;
      transform: translateY(100px);
      opacity: 0;
      transition: transform 0.3s, opacity 0.3s;
      max-width: 400px;
    `;
    document.body.appendChild(toast);
  }
  
  toast.innerHTML = `
    <i class="fas fa-trophy"></i>
    <div>
      <div style="font-weight: bold;">${title}</div>
      <div>${description}</div>
    </div>
  `;
  
  // Show toast
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';
  
  setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
  }, 4000);
}

// === Get Progress Data ===
function getProgressData() {
  return JSON.parse(localStorage.getItem('grprogress') || JSON.stringify(getDefaultProgress()));
}

// Initialize when script loads
if (typeof window !== 'undefined') {
  initProgress();
}
