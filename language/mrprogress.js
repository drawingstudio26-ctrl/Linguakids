// File: mrprogress.js
// This file contains all the master logic for Marathi progress tracking, streaks, and achievements.

// Replace the old initMarathiProgress function with this one in mrprogress.js

function initMarathiProgress() {
  if (!localStorage.getItem('linguaKidsMarathiProgress')) {
    const defaultProgress = {
      level1: {
        alphabets: { completed: 0, total: 48 },
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
        questions: { completed: 0, total: 10 }
      },
      games: {
        'fill-blanks': { completed: 0, total: 1 },
        'match-words': { completed: 0, total: 1 }, 
        'count-apples': { completed: 0, total: 1 }
      },
      achievements: {
        firstSteps: false, alphabetMaster: false, numberWhiz: false,
        wordExpert: false, sentenceBuilder: false, gameChampion: false,
        weekStreak: false, monthStreak: false
      },
      streak: {
        count: 0,
        lastDate: null
      },
      // This is the crucial fix: It must start as null.
      sessionDate: null 
    };
    localStorage.setItem('linguaKidsMarathiProgress', JSON.stringify(defaultProgress));
  }
  
  updateMarathiStreak();
  return JSON.parse(localStorage.getItem('linguaKidsMarathiProgress'));
}

function updateMarathiStreak() {
  const progress = JSON.parse(localStorage.getItem('linguaKidsMarathiProgress'));
  const today = new Date().toDateString();
  
  if (!progress.streak) {
    progress.streak = { count: 0, lastDate: null };
  }
  
  if (progress.sessionDate !== today) {
    const lastDate = progress.streak.lastDate ? new Date(progress.streak.lastDate) : null;
    const todayDate = new Date();
    
    if (lastDate) {
      const diffTime = todayDate.setHours(0,0,0,0) - lastDate.setHours(0,0,0,0);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        progress.streak.count++;
      } else if (diffDays > 1) {
        progress.streak.count = 1;
      }
    } else {
      progress.streak.count = 1;
    }
    
    progress.streak.lastDate = todayDate.toISOString();
    progress.sessionDate = today;
    localStorage.setItem('linguaKidsMarathiProgress', JSON.stringify(progress));
    
    checkMarathiStreakAchievements(progress);
  }
}

function updateMarathiProgress(level, category, itemId = null, increment = 1) {
  const sessionKey = `progress_${level}_${category}_${itemId !== null ? itemId : 'category'}`;
  
  if (sessionStorage.getItem(sessionKey)) {
    return false; // Already tracked this item in this session
  }

  const progress = JSON.parse(localStorage.getItem('linguaKidsMarathiProgress'));
  
  if (progress[level] && progress[level][category] && progress[level][category].completed < progress[level][category].total) {
    progress[level][category].completed += increment;
    
    progress.sessionDate = new Date().toDateString();
    
    localStorage.setItem('linguaKidsMarathiProgress', JSON.stringify(progress));
    sessionStorage.setItem(sessionKey, 'true');
    
    checkMarathiCompletionAchievements(progress);
    updateMarathiStreak(); // Ensure streak is updated on activity
    return true;
  }
  return false;
}

function checkMarathiCompletionAchievements(progress) {
  let earnedAchievement = false;
  
  const totalCompleted = 
    progress.level1.alphabets.completed + 
    progress.level1.numbers.completed + 
    Object.values(progress.level2).reduce((sum, cat) => sum + cat.completed, 0) +
    Object.values(progress.level3).reduce((sum, cat) => sum + cat.completed, 0) +
    Object.values(progress.games).reduce((sum, game) => sum + game.completed, 0);
  
  if (totalCompleted > 0 && !progress.achievements.firstSteps) {
    progress.achievements.firstSteps = true; earnedAchievement = true;
    showMarathiAchievementToast("पहिले पाऊल! (First Steps!)", "तुम्ही तुमची पहिली क्रियाकलाप पूर्ण केली आहे!");
  }
  
  const alphabetProgress = progress.level1.alphabets.completed / progress.level1.alphabets.total;
  if (alphabetProgress >= 0.8 && !progress.achievements.alphabetMaster) {
    progress.achievements.alphabetMaster = true; earnedAchievement = true;
    showMarathiAchievementToast("मुळाक्षरे विशेषज्ञ! (Alphabet Master!)", "तुम्ही बहुतेक मुळाक्षरे शिकलात!");
  }
  
  if (progress.level1.numbers.completed >= 50 && !progress.achievements.numberWhiz) {
    progress.achievements.numberWhiz = true; earnedAchievement = true;
    showMarathiAchievementToast("अंक विशेषज्ञ! (Number Whiz!)", "तुम्हाला अंक चांगले माहिती आहेत!");
  }
  
  const completedLevel2 = Object.values(progress.level2).filter(cat => cat.completed / cat.total >= 0.8).length;
  if (completedLevel2 >= 3 && !progress.achievements.wordExpert) {
    progress.achievements.wordExpert = true; earnedAchievement = true;
    showMarathiAchievementToast("शब्द विशेषज्ञ! (Word Expert!)", "तुम्ही 3 शब्द श्रेणींमध्ये प्रावीण्य मिळवले आहे!");
  }
  
  const completedLevel3 = Object.values(progress.level3).filter(cat => cat.completed / cat.total >= 0.8).length;
  if (completedLevel3 >= 2 && !progress.achievements.sentenceBuilder) {
    progress.achievements.sentenceBuilder = true; earnedAchievement = true;
    showMarathiAchievementToast("वाक्य बांधकाम करणारा! (Sentence Builder!)", "तुम्ही साधी वाक्ये तयार करू शकता!");
  }
  
  const gamesPlayed = Object.values(progress.games).filter(game => game.completed > 0).length;
  if (gamesPlayed >= 2 && !progress.achievements.gameChampion) {
    progress.achievements.gameChampion = true; earnedAchievement = true;
    showMarathiAchievementToast("खेळ चॅम्पियन! (Game Champion!)", "तुम्ही बहुतेक खेळांचा प्रयत्न केला आहे!");
  }

  if (earnedAchievement) {
    localStorage.setItem('linguaKidsMarathiProgress', JSON.stringify(progress));
    if (document.getElementById('achievementsContainer')) {
        displayMarathiAchievements(progress.achievements);
    }
  }
}

function checkMarathiStreakAchievements(progress) {
    let earned = false;
    if (progress.streak.count >= 7 && !progress.achievements.weekStreak) {
        progress.achievements.weekStreak = true;
        showMarathiAchievementToast("7-दिवस सलग शिक्षण!", "तुम्ही सलग 7 दिवस सराव केला आहे!");
        earned = true;
    }
    if (progress.streak.count >= 30 && !progress.achievements.monthStreak) {
        progress.achievements.monthStreak = true;
        showMarathiAchievementToast("30-दिवस सलग शिक्षण!", "तुम्ही एक समर्पित शिकणारे आहात!");
        earned = true;
    }
    if (earned) {
        localStorage.setItem('linguaKidsMarathiProgress', JSON.stringify(progress));
        if (document.getElementById('achievementsContainer')) {
            displayMarathiAchievements(progress.achievements);
        }
    }
}

function showMarathiAchievementToast(title, description) {
  let toastEl = document.getElementById('achievementToastGlobal');
  if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'achievementToastGlobal';
      toastEl.className = 'toast';
      toastEl.style.position = 'fixed';
      toastEl.style.bottom = '20px';
      toastEl.style.right = '20px';
      toastEl.style.background = '#58cc02';
      toastEl.style.color = 'white';
      toastEl.style.padding = '15px 20px';
      toastEl.style.borderRadius = '8px';
      toastEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      toastEl.style.zIndex = '2000';
      toastEl.style.display = 'flex';
      toastEl.style.alignItems = 'center';
      toastEl.style.gap = '10px';
      toastEl.style.transform = 'translateY(100px)';
      toastEl.style.opacity = '0';
      toastEl.style.transition = 'transform 0.3s, opacity 0.3s';
      toastEl.innerHTML = `<i class="fas fa-trophy"></i><div><div class="toast-title" style="font-weight: bold;"></div><div class="toast-desc"></div></div>`;
      document.body.appendChild(toastEl);
  }
  
  toastEl.querySelector('.toast-title').textContent = title;
  toastEl.querySelector('.toast-desc').textContent = description;
  
  setTimeout(() => {
    toastEl.style.transform = 'translateY(0)';
    toastEl.style.opacity = '1';
  }, 10);
  
  setTimeout(() => {
    toastEl.style.transform = 'translateY(100px)';
    toastEl.style.opacity = '0';
  }, 3000);
}