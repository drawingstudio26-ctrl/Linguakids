// File: progress.js - FIXED VERSION
// This file contains all the master logic for English progress tracking.

function initProgress() {
  let progress = localStorage.getItem('linguaKidsProgress');
  
  if (!progress) {
    const defaultProgress = {
      level1: { 
        alphabets: { completed: 0, total: 26 }, 
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
        'fill-blanks': { completed: 0, total: 10 },
        'match-words': { completed: 0, total: 3 },
        'count-apples': { completed: 0, total: 5 }
      },
      achievements: {
        firstSteps: false, alphabetMaster: false, numberWhiz: false, wordExpert: false,
        sentenceBuilder: false, gameChampion: false, weekStreak: false, monthStreak: false
      },
      streak: { count: 0, lastDate: null },
      sessionDate: null
    };
    localStorage.setItem('linguaKidsProgress', JSON.stringify(defaultProgress));
    return defaultProgress;
  }
  
  let progressData = JSON.parse(progress);
  progressData = migrateProgressData(progressData);
  updateStreak(progressData);
  return progressData;
}

function migrateProgressData(progress) {
  // Ensure all structures exist
  if (!progress.level1) progress.level1 = { alphabets: { completed: 0, total: 26 }, numbers: { completed: 0, total: 100 } };
  if (!progress.level2) progress.level2 = { fruits: { completed: 0, total: 10 }, vegetables: { completed: 0, total: 10 }, animals: { completed: 0, total: 10 }, birds: { completed: 0, total: 10 }, vehicles: { completed: 0, total: 10 }, colors: { completed: 0, total: 10 } };
  if (!progress.level3) progress.level3 = { greetings: { completed: 0, total: 10 }, activities: { completed: 0, total: 10 }, questions: { completed: 0, total: 5 } };
  if (!progress.games) progress.games = { 'fill-blanks': { completed: 0, total: 10 }, 'match-words': { completed: 0, total: 3 }, 'count-apples': { completed: 0, total: 5 } };
  if (!progress.achievements) progress.achievements = { firstSteps: false, alphabetMaster: false, numberWhiz: false, wordExpert: false, sentenceBuilder: false, gameChampion: false, weekStreak: false, monthStreak: false };
  if (!progress.streak) progress.streak = { count: 0, lastDate: null };
  
  localStorage.setItem('linguaKidsProgress', JSON.stringify(progress));
  return progress;
}

function updateProgress(level, category, itemId = null) {
    const progress = initProgress();
    
    const sessionKey = `lingua_progress_${level}_${category}_${itemId !== null ? itemId : 'general'}_${new Date().toDateString()}`;
    
    if (sessionStorage.getItem(sessionKey)) {
        console.log(`Progress already tracked for: ${sessionKey}`);
        return false;
    }

    if (!progress[level] || !progress[level][category]) {
        console.error(`Invalid progress category: ${level}.${category}`);
        return false;
    }
    
    const categoryData = progress[level][category];
    
    if (categoryData.completed < categoryData.total) {
        categoryData.completed = Math.min(categoryData.completed + 1, categoryData.total);
        
        localStorage.setItem('linguaKidsProgress', JSON.stringify(progress));
        sessionStorage.setItem(sessionKey, 'true');
        
        console.log(`Progress updated: ${level}.${category} - ${categoryData.completed}/${categoryData.total}`);
        
        checkCompletionAchievements(progress);
        updateStreak(progress);
        return true;
    }
    
    return false;
}

function updateStreak(progress = null) {
  if (!progress) {
    progress = JSON.parse(localStorage.getItem('linguaKidsProgress'));
    if (!progress) return;
  }
  
  const today = new Date().toDateString();
  
  if (progress.sessionDate === today) {
    return;
  }
  
  const lastDate = progress.streak.lastDate ? new Date(progress.streak.lastDate) : null;
  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);
  
  if (lastDate) {
    lastDate.setHours(0, 0, 0, 0);
    const diffTime = todayObj - lastDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      progress.streak.count++;
    } else if (diffDays > 1) {
      progress.streak.count = 1;
    }
  } else {
    progress.streak.count = 1;
  }
  
  progress.streak.lastDate = todayObj.toISOString();
  progress.sessionDate = today;
  localStorage.setItem('linguaKidsProgress', JSON.stringify(progress));
  
  checkStreakAchievements(progress);
}

function checkCompletionAchievements(progress) {
  let earned = false;
  
  const totalCompleted = Object.values(progress.level1)
    .concat(Object.values(progress.level2))
    .concat(Object.values(progress.level3))
    .concat(Object.values(progress.games))
    .reduce((sum, cat) => sum + cat.completed, 0);

  if (totalCompleted > 0 && !progress.achievements.firstSteps) {
    progress.achievements.firstSteps = true; 
    earned = true;
    showAchievementToast("First Steps!", "You've completed your first activity!");
  }
  
  if (progress.level1.alphabets.completed >= progress.level1.alphabets.total && !progress.achievements.alphabetMaster) {
    progress.achievements.alphabetMaster = true; 
    earned = true;
    showAchievementToast("Alphabet Master!", "You've learned all the letters!");
  }
  
  if (progress.level1.numbers.completed >= progress.level1.numbers.total && !progress.achievements.numberWhiz) {
    progress.achievements.numberWhiz = true; 
    earned = true;
    showAchievementToast("Number Whiz!", "You've mastered numbers 1-100!");
  }
  
  const level2Completed = Object.values(progress.level2).every(cat => cat.completed >= cat.total);
  if (level2Completed && !progress.achievements.wordExpert) {
    progress.achievements.wordExpert = true; 
    earned = true;
    showAchievementToast("Word Expert!", "You've learned all basic words!");
  }
  
  const level3Completed = Object.values(progress.level3).every(cat => cat.completed >= cat.total);
  if (level3Completed && !progress.achievements.sentenceBuilder) {
    progress.achievements.sentenceBuilder = true; 
    earned = true;
    showAchievementToast("Sentence Builder!", "You've mastered sentences!");
  }
  
  const gamesCompleted = Object.values(progress.games).every(cat => cat.completed >= cat.total);
  if (gamesCompleted && !progress.achievements.gameChampion) {
    progress.achievements.gameChampion = true; 
    earned = true;
    showAchievementToast("Game Champion!", "You've completed all games!");
  }

  if (earned) {
    localStorage.setItem('linguaKidsProgress', JSON.stringify(progress));
  }
}

function checkStreakAchievements(progress) {
    let earned = false;
    if (progress.streak.count >= 7 && !progress.achievements.weekStreak) {
        progress.achievements.weekStreak = true; 
        earned = true;
        showAchievementToast("7-Day Streak!", "You've practiced for 7 days in a row!");
    }
    if (progress.streak.count >= 30 && !progress.achievements.monthStreak) {
        progress.achievements.monthStreak = true; 
        earned = true;
        showAchievementToast("30-Day Streak!", "You are a dedicated learner!");
    }
    if (earned) {
        localStorage.setItem('linguaKidsProgress', JSON.stringify(progress));
    }
}

function showAchievementToast(title, description) {
  let toastEl = document.getElementById('achievementToastGlobal');
  if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'achievementToastGlobal';
      toastEl.className = 'toast';
      toastEl.style.cssText = `
        position: fixed; 
        bottom: 20px; 
        right: 20px; 
        background: #58cc02; 
        color: white; 
        padding: 15px 20px; 
        border-radius: 8px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
        z-index: 2000; 
        display: flex; 
        align-items: center; 
        gap: 10px; 
        transform: translateY(120px); 
        opacity: 0; 
        transition: transform 0.4s ease-out, opacity 0.4s ease-out;
      `;
      toastEl.innerHTML = `<i class="fas fa-trophy"></i><div><div class="toast-title" style="font-weight:bold;"></div><div class="toast-desc"></div></div>`;
      document.body.appendChild(toastEl);
  }
  
  toastEl.querySelector('.toast-title').textContent = title;
  toastEl.querySelector('.toast-desc').textContent = description;
  
  setTimeout(() => { 
    toastEl.style.transform = 'translateY(0)'; 
    toastEl.style.opacity = '1'; 
  }, 10);
  
  setTimeout(() => { 
    toastEl.style.transform = 'translateY(120px)'; 
    toastEl.style.opacity = '0'; 
  }, 4000);
}


if (typeof window !== 'undefined') {
  window.initProgress = initProgress;
  window.updateProgress = updateProgress;
  window.updateStreak = updateStreak;
  window.showAchievementToast = showAchievementToast;
}