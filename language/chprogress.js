// === Chinese Progress Tracking System ===
const CHINESE_PROGRESS_KEY = 'linguaKidsChineseProgress';

function initChineseProgress() {
  if (!localStorage.getItem(CHINESE_PROGRESS_KEY)) {
    const defaultProgress = {
      level1: {
        initials: { completed: 0, total: 23 },
        finals: { completed: 0, total: 35 },
        numbers: { completed: 0, total: 100 }
      },
      level2: {
        fruits: { completed: 0, total: 10 },
        vegetables: { completed: 0, total: 10 },
        animals: { completed: 0, total: 10 },
        nature: { completed: 0, total: 10 }
      },
      level3: {
        greetings: { completed: 0, total: 10 },
        activities: { completed: 0, total: 10 }
      },
      games: {
        'yes-no': { completed: 0, total: 10 },
        'count-apples': { completed: 0, total: 10 }
      },
      achievements: {
        firstSteps: false,
        initialMaster: false,
        finalMaster: false,
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
      sessionDate: null
    };
    localStorage.setItem(CHINESE_PROGRESS_KEY, JSON.stringify(defaultProgress));
  }
  
  updateStreak();
  return JSON.parse(localStorage.getItem(CHINESE_PROGRESS_KEY));
}

function updateStreak() {
  const progress = JSON.parse(localStorage.getItem(CHINESE_PROGRESS_KEY));
  const today = new Date().toDateString();
  
  // Update streak only if this is a new day
  if (progress.sessionDate !== today) {
    const lastDate = progress.streak.lastDate ? new Date(progress.streak.lastDate) : null;
    const todayDate = new Date(today);
    
    if (lastDate) {
      const diffTime = Math.abs(todayDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day - increment streak
        progress.streak.count++;
      } else if (diffDays > 1) {
        // Streak broken - reset to 1
        progress.streak.count = 1;
      }
      // If diffDays === 0, same day - no change
    } else {
      // First time - start streak
      progress.streak.count = 1;
    }
    
    progress.streak.lastDate = today;
    progress.sessionDate = today;
    localStorage.setItem(CHINESE_PROGRESS_KEY, JSON.stringify(progress));
    
    checkStreakAchievements(progress.streak.count);
  }
  
  return progress.streak.count;
}

function updateProgress(level, category, increment = 1) {
  let progress = JSON.parse(localStorage.getItem(CHINESE_PROGRESS_KEY));
  
  if (!progress) progress = initChineseProgress();

  if (progress[level] && progress[level][category]) {
    progress[level][category].completed = Math.min(
      progress[level][category].completed + increment, 
      progress[level][category].total
    );
    
    checkCompletionAchievements(progress);
    localStorage.setItem(CHINESE_PROGRESS_KEY, JSON.stringify(progress));
    return true;
  }
  return false;
}

function checkStreakAchievements(streak) {
  const progress = JSON.parse(localStorage.getItem(CHINESE_PROGRESS_KEY));
  let earnedAchievement = false;
  
  if (streak >= 7 && !progress.achievements.weekStreak) {
    progress.achievements.weekStreak = true;
    earnedAchievement = true;
    showAchievementToast("7-Day Streak!", "You've practiced Chinese for 7 days in a row!");
  }
  
  if (streak >= 30 && !progress.achievements.monthStreak) {
    progress.achievements.monthStreak = true;
    earnedAchievement = true;
    showAchievementToast("30-Day Streak!", "You're a dedicated Chinese learner!");
  }
  
  if (earnedAchievement) {
    localStorage.setItem(CHINESE_PROGRESS_KEY, JSON.stringify(progress));
  }
}

function checkCompletionAchievements(progress) {
  let earnedAchievement = false;
  
  // First Steps - any activity completed
  if (!progress.achievements.firstSteps) {
    const anyProgress = 
      Object.values(progress.level1).some(cat => cat.completed > 0) ||
      Object.values(progress.level2).some(cat => cat.completed > 0) ||
      Object.values(progress.level3).some(cat => cat.completed > 0) ||
      Object.values(progress.games).some(game => game.completed > 0);
    
    if (anyProgress) {
      progress.achievements.firstSteps = true;
      earnedAchievement = true;
      showAchievementToast("First Steps!", "You've completed your first Chinese activity!");
    }
  }
  
  // Initials Master - complete all initials
  const initialsProgress = progress.level1.initials.completed / progress.level1.initials.total;
  if (initialsProgress >= 1 && !progress.achievements.initialMaster) {
    progress.achievements.initialMaster = true;
    earnedAchievement = true;
    showAchievementToast("Initials Master!", "You've learned all Chinese initials!");
  }
  
  // Finals Master - complete all finals
  const finalsProgress = progress.level1.finals.completed / progress.level1.finals.total;
  if (finalsProgress >= 1 && !progress.achievements.finalMaster) {
    progress.achievements.finalMaster = true;
    earnedAchievement = true;
    showAchievementToast("Finals Master!", "You've learned all Chinese finals!");
  }
  
  // Number Whiz - learn 50 numbers
  if (progress.level1.numbers.completed >= 50 && !progress.achievements.numberWhiz) {
    progress.achievements.numberWhiz = true;
    earnedAchievement = true;
    showAchievementToast("Number Whiz!", "You know your Chinese numbers well!");
  }
  
  // Word Expert - complete 3 level2 categories
  const level2Categories = Object.keys(progress.level2);
  const completedLevel2 = level2Categories.filter(cat => 
    progress.level2[cat].completed / progress.level2[cat].total >= 1
  ).length;
  
  if (completedLevel2 >= 3 && !progress.achievements.wordExpert) {
    progress.achievements.wordExpert = true;
    earnedAchievement = true;
    showAchievementToast("Word Expert!", "You've mastered 3 Chinese word categories!");
  }
  
  // Sentence Builder - complete all level3 categories
  const level3Categories = Object.keys(progress.level3);
  const completedLevel3 = level3Categories.filter(cat => 
    progress.level3[cat].completed / progress.level3[cat].total >= 1
  ).length;
  
  if (completedLevel3 >= 2 && !progress.achievements.sentenceBuilder) {
    progress.achievements.sentenceBuilder = true;
    earnedAchievement = true;
    showAchievementToast("Sentence Builder!", "You can form simple Chinese sentences!");
  }
  
  // Game Champion - play all games
  const gamesPlayed = Object.values(progress.games).filter(game => game.completed > 0).length;
  if (gamesPlayed >= 2 && !progress.achievements.gameChampion) {
    progress.achievements.gameChampion = true;
    earnedAchievement = true;
    showAchievementToast("Game Champion!", "You've tried all the Chinese games!");
  }
  
  if (earnedAchievement) {
    localStorage.setItem(CHINESE_PROGRESS_KEY, JSON.stringify(progress));
  }
}

function showAchievementToast(title, description) {
  // Create toast element if it doesn't exist
  let toast = document.getElementById('achievementToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'achievementToast';
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="fas fa-trophy"></i>
      <div>
        <div id="toastTitle">${title}</div>
        <div id="toastDesc">${description}</div>
      </div>
    `;
    document.body.appendChild(toast);
    
    // Add basic toast styles if not already present
    if (!document.querySelector('#toastStyles')) {
      const style = document.createElement('style');
      style.id = 'toastStyles';
      style.textContent = `
        .toast {
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
          transform: translateY(100px);
          opacity: 0;
          transition: transform 0.3s, opacity 0.3s;
        }
        .toast.show {
          transform: translateY(0);
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastDesc').textContent = description;
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Make functions globally available
window.initChineseProgress = initChineseProgress;
window.updateProgress = updateProgress;
window.updateStreak = updateStreak;
window.CHINESE_PROGRESS_KEY = CHINESE_PROGRESS_KEY;

// Initialize progress system when script loads
initChineseProgress();