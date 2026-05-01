// Iron Forge Network Logic

document.addEventListener('DOMContentLoaded', async () => {
  // Wait a tiny bit for i18n to settle if needed, but standard boot is usually fine.
  
  // Elements
  const signupView = document.getElementById('signup-view');
  const appView = document.getElementById('app-view');
  const signupForm = document.getElementById('signup-form');
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabs = {
    'tab-chat': document.getElementById('tab-chat'),
    'tab-radar': document.getElementById('tab-radar'),
    'tab-profile': document.getElementById('tab-profile')
  };
  
  // App State
  let currentUser = null;
  let userLocation = null;
  let simulatedMessages = window.generateSimulatedChat ? window.generateSimulatedChat(40) : [];
  
  function requestLocation() {
    if (navigator.geolocation && !userLocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const subtitle = document.querySelector('[data-i18n="app.radar_subtitle"]');
        if (subtitle) {
           subtitle.removeAttribute('data-i18n');
           subtitle.textContent = `Scanning near ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}...`;
        }
      }, (err) => {
        console.warn('Location access denied or failed.', err);
      });
    }
  }

  // Initialize App
  async function init() {
    try {
      const stored = await miniappsAI.storage.getItem('iron_forge_user');
      if (stored) {
        currentUser = JSON.parse(stored);
        showApp();
      } else {
        showSignup();
      }
    } catch (e) {
      console.error('Storage error:', e);
      showSignup();
    }
  }

  // View routing
  function showSignup() {
    signupView.classList.add('active');
    appView.classList.remove('active');
  }

  function showApp() {
    signupView.classList.remove('active');
    appView.classList.add('active');
    
    // Populate header & profile
    document.getElementById('header-user-role').textContent = currentUser.role;
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-role-val').textContent = currentUser.role;
    document.getElementById('profile-region-val').textContent = currentUser.region;
    
    const profileAvatarImg = document.getElementById('profile-avatar-img');
    if (profileAvatarImg) {
      profileAvatarImg.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name) + '&background=1a1a1a&color=8b0000&bold=true';
    }
    
    // Render initial data
    renderChat();
    renderRadar();
    
    // Start simulation
    simulateIncomingMessages();
  }

  // Signup Handling
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('user-name').value.trim();
    const region = document.getElementById('user-region').value;
    const roleRadio = document.querySelector('input[name="role"]:checked');
    
    if (!name || !roleRadio) return;
    
    currentUser = {
      id: 'local_' + Date.now(),
      name: name,
      region: region,
      role: roleRadio.value,
      joinedAt: Date.now()
    };
    
    await miniappsAI.storage.setItem('iron_forge_user', JSON.stringify(currentUser));
    showApp();
  });

  // Navigation
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Reset styles
      navBtns.forEach(b => {
        b.classList.remove('text-blood');
        b.classList.add('text-gray-500');
      });
      // Active style
      btn.classList.add('text-blood');
      btn.classList.remove('text-gray-500');
      
      // Hide all tabs
      Object.values(tabs).forEach(tab => {
        tab.style.opacity = '0';
        tab.style.pointerEvents = 'none';
        tab.style.zIndex = '0';
      });
      
      // Show target tab
      const targetId = btn.getAttribute('data-target');
      
      if (targetId === 'tab-radar') {
        requestLocation();
      }

      const targetTab = tabs[targetId];
      if (targetTab) {
        targetTab.style.opacity = '1';
        targetTab.style.pointerEvents = 'auto';
        targetTab.style.zIndex = '10';
        
        if (targetId === 'tab-chat') {
          scrollToBottom();
        }        
        const fab = document.getElementById('fab-mentorship');
        if (fab) {
          fab.style.display = targetId === 'tab-profile' ? 'none' : 'flex';
        }
      }
    });
  });

  // Chat Logic
  const chatMessagesContainer = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');

  function renderMessage(msg) {
    const isMe = msg.user.id === currentUser?.id;
    const div = document.createElement('div');
    div.className = `flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`;
    
    const avatarColor = msg.user.role === 'Trainer' ? 'border-blood' : 'border-yellow-600';
    const nameColor = msg.user.role === 'Trainer' ? 'text-blood' : 'text-yellow-600';
    
    const avatarUrl = msg.user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(msg.user.name) + '&background=1a1a1a&color=8b0000&bold=true';
    
    div.innerHTML = `
      <div class="shrink-0">
        <img src="${avatarUrl}" class="w-10 h-10 rounded-full border-2 ${avatarColor} object-cover grayscale mix-blend-screen" alt="avatar">
      </div>
      <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]">
        <div class="flex items-baseline gap-2 mb-1">
          <span class="font-heavy text-sm ${nameColor} uppercase tracking-wider">${msg.user.name}</span>
          <span class="text-[10px] text-gray-600 uppercase">${msg.user.region} • ${msg.user.role}</span>
        </div>
        <div class="bg-iron border ${isMe ? 'border-bloodDark text-white' : 'border-gray-800 text-gray-300'} px-4 py-2 text-sm">
          ${msg.content}
        </div>
      </div>
    `;
    chatMessagesContainer.appendChild(div);
  }

  function renderChat() {
    chatMessagesContainer.innerHTML = '';
    // Sort by time ascending
    const sorted = [...simulatedMessages].sort((a, b) => a.time - b.time);
    sorted.forEach(renderMessage);
    scrollToBottom();
  }

  function scrollToBottom() {
    setTimeout(() => {
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }, 50);
  }

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text || !currentUser) return;
    
    const newMsg = {
      user: currentUser,
      content: text,
      time: new Date()
    };
    
    renderMessage(newMsg);
    simulatedMessages.push(newMsg);
    chatInput.value = '';
    scrollToBottom();
  });

  // Simulated Chat Incoming Stream
  function simulateIncomingMessages() {
    setInterval(() => {
      // 30% chance every 4 seconds to receive a message
      if (Math.random() < 0.3) {
        const generated = window.generateSimulatedChat(1)[0];
        generated.time = new Date();
        simulatedMessages.push(generated);
        // Only render if chat tab is active (or render anyway, DOM will update)
        renderMessage(generated);
        const chatTab = document.getElementById('tab-chat');
        if (chatTab.style.opacity === '1' || chatTab.style.opacity === '') {
          scrollToBottom();
        }
      }
    }, 4000);
  }

  // Radar Logic
  const radarMap = document.getElementById('radar-map');
  const radarModal = document.getElementById('radar-modal');
  const modalContent = document.getElementById('radar-modal-content');
  const closeModalBtn = document.getElementById('close-modal');

  function renderRadar() {
    if (!window.mockUsers) return;
    
    // Keep grid and sweep, remove old blips
    const blips = radarMap.querySelectorAll('.radar-blip');
    blips.forEach(b => b.remove());
    
    window.mockUsers.forEach(user => {
      // Only show users in the same region, or just scatter them all to make it look busy
      // For visual density, let's show all but highlight region
      const blip = document.createElement('div');
      blip.className = `radar-blip ${user.role.toLowerCase()}`;
      
      // Map -40 to 40 logic to 10% to 90% purely for visual spread within circle
      const top = 50 + user.lat;
      const left = 50 + user.lng;
      
      // Simple bounds check so they stay inside the circle roughly
      const dist = Math.sqrt(user.lat*user.lat + user.lng*user.lng);
      if (dist > 48) return; // Keep inside circle
      
      blip.style.top = `${top}%`;
      blip.style.left = `${left}%`;
      blip.style.animationDelay = `${Math.random() * 2}s`;
      
      blip.addEventListener('click', () => {
        openModal(user);
      });
      
      radarMap.appendChild(blip);
    });
  }

  function openModal(user) {
    document.getElementById('modal-avatar').src = user.avatar;
    document.getElementById('modal-name').textContent = user.name;
    document.getElementById('modal-role').innerHTML = `${user.role} &bull; ${user.region}`;
    document.getElementById('modal-bio').textContent = `"${user.bio}"`;
    
    radarModal.style.opacity = '1';
    radarModal.style.pointerEvents = 'auto';
    setTimeout(() => {
      modalContent.style.transform = 'scale(1)';
    }, 50);
  }

  closeModalBtn.addEventListener('click', () => {
    modalContent.style.transform = 'scale(0.95)';
    setTimeout(() => {
      radarModal.style.opacity = '0';
      radarModal.style.pointerEvents = 'none';
    }, 300);
  });
  
  document.getElementById('modal-message-btn').addEventListener('click', () => {
    // Just switch to chat tab and populate input
    closeModalBtn.click();
    navBtns[0].click(); // Chat is index 0
    chatInput.value = `@${document.getElementById('modal-name').textContent} `;
    chatInput.focus();
  });

  // Logout / Restart
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await miniappsAI.storage.removeItem('iron_forge_user');
    currentUser = null;
    location.reload();
  });

  // Mentorship Modal Logic
  const mentorshipModal = document.getElementById('mentorship-modal');
  const mentorshipModalContent = document.getElementById('mentorship-modal-content');
  const closeMentorship = document.getElementById('close-mentorship');
  const fabMentorship = document.getElementById('fab-mentorship');

  if (fabMentorship && mentorshipModal) {
    fabMentorship.addEventListener('click', () => {
      mentorshipModal.style.opacity = '1';
      mentorshipModal.style.pointerEvents = 'auto';
      setTimeout(() => {
        mentorshipModalContent.style.transform = 'scale(1)';
      }, 50);
    });

    closeMentorship.addEventListener('click', () => {
      mentorshipModalContent.style.transform = 'scale(0.95)';
      setTimeout(() => {
        mentorshipModal.style.opacity = '0';
        mentorshipModal.style.pointerEvents = 'none';
      }, 300);
    });
  }

  // Start
  init();
});
