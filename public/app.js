// State Management
const state = {
  sessionId: '',
  activeTab: 'image',
  selectedImage: null,
  webcamStream: null,
  currentAnalysis: null,
  history: []
};

// Mock Circuit Netlists for Judge Demo Desk
const DEMO_CIRCUITS = {
  'incorrect-led': `Battery 9V (Pos: pinA, Neg: pinB)\nResistor 220 (Pin1: pinA, Pin2: pinC)\nLED (Anode: pinB, Cathode: pinC)`,
  'short-circuit': `Battery 9V (Pos: pinA, Neg: pinB)\nJumperWire (Pin1: pinA, Pin2: pinB)`,
  'correct-led': `Battery 9V (Pos: pinA, Neg: pinB)\nResistor 1000 (Pin1: pinA, Pin2: pinC)\nLED (Anode: pinC, Cathode: pinB)`
};

// DOM Elements
const els = {
  sessionDisplay: document.getElementById('display-session-id'),
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  dropZone: document.getElementById('image-drop-zone'),
  imageInput: document.getElementById('image-input'),
  imagePreviewContainer: document.getElementById('image-preview-container'),
  imagePreview: document.getElementById('image-preview'),
  webcamBtn: document.getElementById('webcam-btn'),
  cameraContainer: document.getElementById('camera-container'),
  video: document.getElementById('video'),
  captureBtn: document.getElementById('capture-btn'),
  netlistTextarea: document.getElementById('netlist-textarea'),
  analyzeBtn: document.getElementById('analyze-btn'),
  loadingOverlay: document.getElementById('loading-overlay'),
  feedbackPlaceholder: document.getElementById('feedback-placeholder'),
  feedbackContent: document.getElementById('feedback-content'),
  feedbackStatusBanner: document.getElementById('feedback-status-banner'),
  feedbackStatusIcon: document.getElementById('feedback-status-icon'),
  feedbackStatusTitle: document.getElementById('feedback-status-title'),
  componentsContainer: document.getElementById('component-tags-container'),
  errorsSection: document.getElementById('errors-section'),
  errorsContainer: document.getElementById('errors-container'),
  checklistContainer: document.getElementById('checklist-container'),
  statusDot: document.getElementById('diagnostic-status-dot'),
  statusText: document.getElementById('diagnostic-status-text'),
  historyContainer: document.getElementById('history-container'),
  demoBtns: document.querySelectorAll('.demo-btn')
};

// Init session
function initSession() {
  let id = localStorage.getItem('bv_session_id');
  if (!id) {
    id = `session-${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('bv_session_id', id);
  }
  state.sessionId = id;
  els.sessionDisplay.textContent = id;
}

// Tab Switching
function switchTab(tabName) {
  state.activeTab = tabName;
  els.tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
  });
  els.tabContents.forEach(content => {
    content.classList.toggle('active', content.id === `tab-${tabName}`);
  });
  validateInput();
}

// Input Validation
function validateInput() {
  let isValid = false;
  if (state.activeTab === 'image') {
    isValid = !!state.selectedImage;
  } else if (state.activeTab === 'netlist') {
    isValid = els.netlistTextarea.value.trim().length > 0;
  }
  els.analyzeBtn.disabled = !isValid;
}

// Image handling
function handleFileSelect(file) {
  if (!file || !file.type.startsWith('image/')) return;
  state.selectedImage = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    els.imagePreview.src = e.target.result;
    els.imagePreviewContainer.classList.remove('hide');
    els.dropZone.querySelector('.drop-icon').classList.add('hide');
    els.dropZone.querySelector('.drop-text').classList.add('hide');
    validateInput();
  };
  reader.readAsDataURL(file);
}

// Webcam stream management
async function startWebcam() {
  try {
    state.webcamStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    els.video.srcObject = state.webcamStream;
    els.cameraContainer.classList.remove('hide');
    els.webcamBtn.innerHTML = '<span class="material-icons" style="font-size: 18px; margin-right: 6px; vertical-align: middle;">flip_camera_ios</span>Stop Camera';
  } catch (err) {
    alert('Webcam access denied or unavailable: ' + err.message);
  }
}

function stopWebcam() {
  if (state.webcamStream) {
    state.webcamStream.getTracks().forEach(track => track.stop());
    state.webcamStream = null;
  }
  els.cameraContainer.classList.add('hide');
  els.webcamBtn.innerHTML = '<span class="material-icons" style="font-size: 18px; margin-right: 6px; vertical-align: middle;">photo_camera</span>Use Webcam';
}

function captureSnapshot() {
  const canvas = document.createElement('canvas');
  canvas.width = els.video.videoWidth || 640;
  canvas.height = els.video.videoHeight || 480;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(els.video, 0, 0, canvas.width, canvas.height);
  
  canvas.toBlob((blob) => {
    const file = new File([blob], 'captured_circuit.png', { type: 'image/png' });
    handleFileSelect(file);
    stopWebcam();
  }, 'image/png');
}

// Inject Mock Demo Netlists
function injectDemo(demoName) {
  const netlist = DEMO_CIRCUITS[demoName];
  if (!netlist) return;

  switchTab('netlist');
  els.netlistTextarea.value = netlist;
  validateInput();
  
  // Auto-submit for rapid judging demo
  analyzeCircuit();
}

// API Submission Handler
async function analyzeCircuit() {
  els.loadingOverlay.classList.remove('hide');
  
  try {
    let response;
    
    if (state.activeTab === 'image') {
      const formData = new FormData();
      formData.append('sessionId', state.sessionId);
      formData.append('image', state.selectedImage);
      
      response = await fetch('/api/analyze/image', {
        method: 'POST',
        body: formData
      });
    } else {
      response = await fetch('/api/analyze/netlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          netlist: els.netlistTextarea.value
        })
      });
    }

    if (!response.ok) throw new Error('Diagnosis failed on server side');
    
    const data = await response.json();
    if (data.success) {
      renderAnalysis(data.analysis);
      fetchHistory();
    }
  } catch (err) {
    alert('Error running diagnostics: ' + err.message);
  } finally {
    els.loadingOverlay.classList.add('hide');
  }
}

// Rendering UI results
function renderAnalysis(analysis) {
  state.currentAnalysis = analysis;
  
  // Toggle Visibility
  els.feedbackPlaceholder.classList.add('hide');
  els.feedbackContent.classList.remove('hide');

  // 1. Status Indicator
  els.statusDot.className = `status-dot status-${analysis.status}`;
  els.statusText.textContent = analysis.status.toUpperCase();

  // 2. Status Banner
  els.feedbackStatusBanner.className = `status-banner ${analysis.status}`;
  els.feedbackStatusTitle.textContent = 
    analysis.status === 'correct' ? 'Circuit Closed - No Errors Detected' :
    analysis.status === 'warning' ? 'Circuit Review Recommended' :
    'Critical Wiring Errors Detected';
  
  els.feedbackStatusIcon.className = 'material-icons';
  els.feedbackStatusIcon.textContent = (
    analysis.status === 'correct' ? 'check_circle' :
    analysis.status === 'warning' ? 'warning' :
    'error'
  );

  // 3. Components Tags
  els.componentsContainer.innerHTML = '';
  analysis.detectedComponents.forEach(comp => {
    const tag = document.createElement('span');
    tag.className = 'component-tag';
    tag.textContent = comp;
    els.componentsContainer.appendChild(tag);
  });

  // 4. Errors List
  els.errorsContainer.innerHTML = '';
  if (analysis.detectedErrors && analysis.detectedErrors.length > 0) {
    els.errorsSection.classList.remove('hide');
    analysis.detectedErrors.forEach(err => {
      const card = document.createElement('div');
      card.className = 'error-card';
      
      card.innerHTML = `
        <span class="error-card-meta">${err.type}</span>
        <span class="error-card-title">${err.component}</span>
        <p class="error-card-desc">${err.description}</p>
      `;
      els.errorsContainer.appendChild(card);
    });
  } else {
    els.errorsSection.classList.add('hide');
  }

  // 5. Remediation Checklist
  els.checklistContainer.innerHTML = '';
  if (analysis.guideSteps && analysis.guideSteps.length > 0) {
    analysis.guideSteps.forEach(step => {
      const item = document.createElement('div');
      item.className = 'checklist-item';
      
      item.innerHTML = `
        <div class="checklist-checkbox"><span class="material-icons" style="font-size: 12px; color: #ffffff;">check</span></div>
        <p class="checklist-text">${step}</p>
      `;
      
      item.addEventListener('click', () => {
        item.classList.toggle('checked');
      });
      
      els.checklistContainer.appendChild(item);
    });
  } else {
    const successItem = document.createElement('div');
    successItem.className = 'checklist-item checked';
    successItem.innerHTML = `
      <div class="checklist-checkbox"><span class="material-icons" style="font-size: 12px; color: #ffffff;">check</span></div>
      <p class="checklist-text">Everything looks perfect. No modifications required.</p>
    `;
    els.checklistContainer.appendChild(successItem);
  }
}

// Fetch Session History
async function fetchHistory() {
  try {
    const response = await fetch(`/api/sessions/${state.sessionId}/history`);
    if (!response.ok) return;
    
    const rows = await response.json();
    state.history = rows;
    
    renderHistoryList();
  } catch (err) {
    console.error('Failed to load history:', err);
  }
}

// Render History Panel
function renderHistoryList() {
  els.historyContainer.innerHTML = '';
  
  if (state.history.length === 0) {
    els.historyContainer.innerHTML = `
      <div class="empty-state-history">
        <p>No past submissions in this session.</p>
      </div>
    `;
    return;
  }

  state.history.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    
    const timeStr = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    card.innerHTML = `
      <div class="history-card-header">
        <span class="history-type-badge">
          <span class="material-icons" style="font-size: 12px; margin-right: 4px; vertical-align: middle;">${item.type === 'image' ? 'image' : 'description'}</span> ${item.type}
        </span>
        <span class="history-time">${timeStr}</span>
      </div>
      <div class="history-status-indicator ${item.status}">
        <span class="material-icons" style="font-size: 14px; margin-right: 4px; vertical-align: middle;">${item.status === 'correct' ? 'check_circle' : 'error'}</span>
        <span>${item.status.toUpperCase()}</span>
      </div>
      <p class="history-summary">${
        item.status === 'correct' 
          ? 'Circuit operating correctly.' 
          : `${item.detectedErrors.length} error(s) flagged.`
      }</p>
    `;

    card.addEventListener('click', () => {
      // Re-render this past feedback
      renderAnalysis(item);
    });

    els.historyContainer.appendChild(card);
  });
}

// Event Listeners Registration
function registerEvents() {
  // Tabs
  els.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  // Image Upload Dropzone
  els.dropZone.addEventListener('click', () => {
    if (!state.webcamStream) els.imageInput.click();
  });
  
  els.imageInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
  });

  // Drag and Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    els.dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      els.dropZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    els.dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      els.dropZone.classList.remove('dragover');
      if (eventName === 'drop') {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    }, false);
  });

  // Webcam Actions
  els.webcamBtn.addEventListener('click', () => {
    if (state.webcamStream) {
      stopWebcam();
    } else {
      startWebcam();
    }
  });

  els.captureBtn.addEventListener('click', captureSnapshot);

  // Netlist Area Input
  els.netlistTextarea.addEventListener('input', validateInput);

  // Submit Run button
  els.analyzeBtn.addEventListener('click', analyzeCircuit);

  // Judge Demo Buttons
  els.demoBtns.forEach(btn => {
    btn.addEventListener('click', () => injectDemo(btn.getAttribute('data-demo')));
  });
}

// Bootstrap Application
window.addEventListener('DOMContentLoaded', () => {
  initSession();
  registerEvents();
  fetchHistory();
});
