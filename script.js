// --- Constants ---
const WEBHOOK_URL = 'https://shreelaxmi21-rk.app.n8n.cloud/webhook-test/complaint'; // User to replace this with actual webhook URL

const TRACKING_WEBHOOK_URL = 'https://shreelaxmi21-rk.app.n8n.cloud/webhook-test/check-status'; // User to replace this with actual tracking webhook URL

const MOCK_OTP = '1234';

// --- State Variables ---
let currentUser = {
    name: '',
    phone: '',
    gmail: '',
    state: '',
    district: '',
    aadhar: '',
    age: '',
    isLoggedIn: false
};
let uploadedImages = [];
let uploadedVideos = [];

// --- DOM Elements ---
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const complaintForm = document.getElementById('complaint-form');
const loginPhoneInput = document.getElementById('login-phone');
const loginGmailInput = document.getElementById('login-gmail');
const loginNameInput = document.getElementById('login-name');
const loginStateInput = document.getElementById('login-state');
const loginDistrictInput = document.getElementById('login-district');
const loginAadharInput = document.getElementById('login-aadhar');
const loginAgeInput = document.getElementById('login-age');
const loginOtpInput = document.getElementById('login-otp');
const userPhoneInput = document.getElementById('user-phone');
const userNameInput = document.getElementById('user-name');
const imageFileInput = document.getElementById('image-files');
const imageFileList = document.getElementById('image-file-list');
const videoFileInput = document.getElementById('video-files');
const videoFileList = document.getElementById('video-file-list');
const toast = document.getElementById('toast');
const trackBtn = document.getElementById('track-btn');
const trackRegistrationIdInput = document.getElementById('track-registration-id');
const statusModal = document.getElementById('status-modal');
const statusBody = document.getElementById('status-body');
const closeModalBtn = document.getElementById('close-modal-btn');

// --- Event Listeners ---

// 1. Login Handling
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = loginNameInput.value.trim();
    const phone = loginPhoneInput.value.trim();
    const gmail = loginGmailInput.value.trim();
    const state = loginStateInput.value.trim();
    const district = loginDistrictInput.value.trim();
    const aadhar = loginAadharInput.value.trim();
    const age = loginAgeInput.value.trim();
    const otp = loginOtpInput.value.trim();

    if (!name || !phone || !gmail || !state || !district || !aadhar || !age || !otp) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Validate Gmail format
    if (!gmail.toLowerCase().endsWith('@gmail.com')) {
        showToast('Please enter a valid Gmail ID', 'error');
        return;
    }

    // Validate age
    if (parseInt(age) < 16) {
        showToast('Age must be greater than 15', 'error');
        return;
    }

    // Validate Aadhar (12 digits)
    if (!/^\d{12}$/.test(aadhar)) {
        showToast('Aadhar Number must be 12 digits', 'error');
        return;
    }

    if (otp !== MOCK_OTP) {
        showToast('Invalid OTP. Try 1234', 'error');
        return;
    }

    // Success — store all user details
    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.gmail = gmail;
    currentUser.state = state;
    currentUser.district = district;
    currentUser.aadhar = aadhar;
    currentUser.age = age;
    currentUser.isLoggedIn = true;

    // Auto-fill dashboard form fields from login data
    if (userPhoneInput) userPhoneInput.value = phone;
    if (userNameInput) userNameInput.value = name;

    // Show user's first name in the header chip
    const headerUsername = document.getElementById('header-username');
    if (headerUsername) headerUsername.textContent = name.split(' ')[0];

    // Smooth transition to dashboard
    loginView.classList.remove('active');
    setTimeout(() => {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        void dashboardView.offsetHeight;
        dashboardView.classList.add('active');
    }, 400);

    showToast('Welcome to UrbanVoice', 'success');
});

// Hide registration message when user starts making changes to form
function setupFormChangeListeners() {
    const formInputs = complaintForm.querySelectorAll('input, textarea');
    const responseDiv = document.getElementById('responseMessage');

    const hideResponseMessage = () => {
        if (responseDiv && responseDiv.style.display !== 'none') {
            responseDiv.style.display = 'none';
            responseDiv.innerHTML = '';
        }
    };

    // Add event listener to all form inputs
    formInputs.forEach(input => {
        // Hide on first input/change
        input.addEventListener('input', hideResponseMessage, { once: true });
        input.addEventListener('change', hideResponseMessage, { once: true });
    });

    // Also hide when files are selected
    imageFileInput.addEventListener('change', hideResponseMessage, { once: true });
    videoFileInput.addEventListener('change', hideResponseMessage, { once: true });
}

// Call this when page loads
setupFormChangeListeners();

// 2. File Upload Handling


imageFileInput.addEventListener('change', (e) => {
    const newFiles = Array.from(e.target.files);
    uploadedImages = [...uploadedImages, ...newFiles];
    renderFileList(uploadedImages, imageFileList, 'image');
});

videoFileInput.addEventListener('change', (e) => {
    const newFiles = Array.from(e.target.files);
    uploadedVideos = [...uploadedVideos, ...newFiles];
    renderFileList(uploadedVideos, videoFileList, 'video');
});

function renderFileList(files, listEl, type) {
    listEl.innerHTML = '';
    if (files.length === 0) return;

    files.forEach((file, index) => {
        const item = document.createElement('div');
        item.style.cssText = 'margin-top: 6px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;';
        const iconName = type === 'image' ? 'image-outline' : 'film-outline';
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        item.innerHTML = `
            <span style="color: var(--accent); display: inline-flex; align-items: center; gap: 4px;">
                <ion-icon name="${iconName}"></ion-icon> ${file.name}
            </span>
            <span style="color: var(--text-muted); font-size: 0.8em;">(${sizeMB} MB)</span>
            <span style="cursor: pointer; color: var(--error); margin-left: 4px; display: inline-flex; align-items: center;" 
                  onclick="removeFile('${type}', ${index})" title="Remove">
                <ion-icon name="close-circle-outline"></ion-icon>
            </span>
        `;
        listEl.appendChild(item);
    });
}

window.removeFile = (type, index) => {
    if (type === 'image') {
        uploadedImages.splice(index, 1);
        renderFileList(uploadedImages, imageFileList, 'image');
    } else {
        uploadedVideos.splice(index, 1);
        renderFileList(uploadedVideos, videoFileList, 'video');
    }
};

// --- Base64 Conversion Helpers (used for images only) ---

/**
 * Converts a File object to a Base64 string (data portion only, no prefix).
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // reader.result is "data:<mime>;base64,<data>" — extract only the base64 part
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}



// 4. Form Submission — Structured JSON for n8n / OpenAI
complaintForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = complaintForm.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');

    // Validation
    const userName = userNameInput.value.trim();
    const complaint = document.getElementById('user-complaint').value.trim();

    if (!userName || !complaint) {
        showToast('Name and Complaint are mandatory.', 'error');
        return;
    }

    // UI Loading State
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    loader.style.display = 'block';

    try {
        // Build structured metadata as JSON
        const metadata = {
            timestamp: new Date().toISOString(),
            source: 'public-complaint-portal',
            version: '1.0'
        };
        const complaintData = {
            text: complaint,
            address: document.getElementById('user-address').value.trim() || null,
            language: 'auto'
        };

        // Use FormData to send files natively (avoids Base64 size inflation & webhook body limits)
        const formData = new FormData();
        formData.append('metadata', JSON.stringify(metadata));

        // User fields sent separately for easy access in n8n
        formData.append('name', currentUser.name || userName);
        formData.append('phone', currentUser.phone);
        formData.append('gmail', currentUser.gmail);
        formData.append('address', document.getElementById('user-address').value.trim() || '');
        formData.append('state', currentUser.state);
        formData.append('district', currentUser.district);
        formData.append('aadhar', currentUser.aadhar);
        formData.append('age', currentUser.age);

        formData.append('complaint', JSON.stringify(complaintData));

        // Append image files
        uploadedImages.forEach((file, i) => {
            formData.append(`image_${i}`, file, file.name);
        });
        formData.append('image_count', uploadedImages.length);

        // Append video files
        uploadedVideos.forEach((file, i) => {
            formData.append(`video_${i}`, file, file.name);
        });
        formData.append('video_count', uploadedVideos.length);

        console.log('Sending payload with', uploadedImages.length, 'image(s) and', uploadedVideos.length, 'video(s)');

        // Send as multipart/form-data to webhook (no Content-Type header — browser sets boundary automatically)
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });

        console.log('Webhook response status:', response.status);
        console.log('User:', userName, currentUser.phone, currentUser.gmail);

        // Parse the response JSON
        if (!response.ok) {
            throw new Error('Webhook request failed');
        }

        const responseData = await response.json();
        console.log('Webhook response data:', responseData);

        // Extract registration ID from response
        const registrationId = responseData.registration_id || responseData.registrationId || responseData.id;

        if (registrationId) {
            // Display registration ID on the page
            displayRegistrationId(registrationId);
        } else {
            // Fallback to toast if no registration ID in response
            showToast(`Complaint Successfully Registered! Registration ID will be sent to ${currentUser.gmail}`, 'success');
        }

        resetForm();

    } catch (error) {
        console.error('Submission Error:', error);
        // Display error message
        displayErrorMessage();
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        loader.style.display = 'none';
    }
});

function resetForm() {
    complaintForm.reset();
    userPhoneInput.value = currentUser.phone; // Re-fill phone after reset
    uploadedImages = [];
    uploadedVideos = [];
    renderFileList(uploadedImages, imageFileList, 'image');
    renderFileList(uploadedVideos, videoFileList, 'video');

    // Note: responseMessage is NOT hidden here - it persists until user makes changes
}

// --- Utilities ---
let toastTimeout = null;

function showToast(message, type = 'success') {
    // Clear any existing timeout to prevent stacking
    if (toastTimeout) clearTimeout(toastTimeout);

    toast.textContent = message;
    toast.className = `toast ${type}`;

    toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
        toastTimeout = null;
    }, 3000);
}

// --- Display Registration ID Response ---
function displayRegistrationId(registrationId) {
    const responseDiv = document.getElementById('responseMessage');
    responseDiv.innerHTML = `
        <div style="color: var(--success); font-size: var(--step-0); margin-bottom: var(--space-sm);">
            <ion-icon name="checkmark-circle" style="font-size: 2.5rem; display: block; margin: 0 auto var(--space-sm);"></ion-icon>
            Complaint Registered Successfully
        </div>
        <div style="color: var(--text-main); font-size: var(--step-0);">
            Your Registration ID: <strong style="color: var(--accent); font-size: var(--step-1); letter-spacing: 1px;">${registrationId}</strong>
        </div>
        <div style="color: var(--text-muted); font-size: var(--step--1); margin-top: var(--space-md);">
            Please save this ID to track your complaint status.
        </div>
    `;
    responseDiv.style.display = 'block';

    // Scroll to the message
    responseDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Also show toast
    showToast('Complaint submitted successfully!', 'success');
}

function displayErrorMessage() {
    const responseDiv = document.getElementById('responseMessage');
    responseDiv.innerHTML = `
        <div style="color: var(--error); font-size: var(--step-0);">
            <ion-icon name="alert-circle" style="font-size: 2.5rem; display: block; margin: 0 auto var(--space-sm);"></ion-icon>
            Submission failed. Please try again.
        </div>
    `;
    responseDiv.style.display = 'block';

    // Scroll to the message
    responseDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Also show toast
    showToast('Submission failed. Please try again.', 'error');
}

// --- Track Complaint Status ---
trackBtn.addEventListener('click', async () => {
    const registrationId = trackRegistrationIdInput.value.trim();

    if (!registrationId) {
        showToast('Please enter a Registration ID', 'error');
        return;
    }

    // Disable button and show loading state
    trackBtn.disabled = true;
    trackBtn.innerHTML = '<div class="loader" style="display:block; width: 16px; height: 16px;"></div>';

    try {
        await fetchComplaintStatus(registrationId);
    } catch (error) {
        console.error('Error tracking complaint:', error);
        showToast('Failed to fetch status. Please try again.', 'error');
    } finally {
        trackBtn.disabled = false;
        trackBtn.innerHTML = '<ion-icon name="search-outline"></ion-icon> Track Status';
    }
});

async function fetchComplaintStatus(registrationId) {
    try {
        const payload = {
            registrationId: registrationId,
            requestedBy: currentUser.gmail || 'Unknown',
            timestamp: new Date().toISOString()
        };

        const response = await fetch(TRACKING_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('Tracking webhook response status:', response.status);
        console.log('Payload sent to tracking webhook:', payload);

        if (!response.ok) {
            throw new Error('Failed to fetch complaint status');
        }

        const statusData = await response.json();
        console.log('Tracking webhook raw response:', JSON.stringify(statusData, null, 2));
        displayComplaintStatus(statusData);

    } catch (error) {
        console.error('Tracking webhook error:', error);
        showErrorInModal(registrationId);
    }
}

function displayComplaintStatus(rawData) {
    // n8n returns an array — unwrap the first element
    const statusData = Array.isArray(rawData) ? rawData[0] : rawData;

    // Use bracket notation for space-separated keys returned by n8n
    const regId = statusData['registration id'] || statusData.registration_id || statusData.registrationId || statusData.id || 'N/A';
    const status = statusData.status || 'pending';
    const assignedTo = statusData['assigned to'] || statusData.assigned_to || statusData.assignedTo || 'Not Assigned';
    const remarks = statusData.remarks || '';

    const statusHTML = `
        <div class="status-info">
            <div class="status-info-row">
                <span class="status-label">Registration ID</span>
                <span class="status-value">${regId}</span>
            </div>
            <div class="status-info-row">
                <span class="status-label">Status</span>
                <span class="status-badge ${status}">${status.replace('-', ' ')}</span>
            </div>
            <div class="status-info-row">
                <span class="status-label">Assigned To</span>
                <span class="status-value">${assignedTo}</span>
            </div>
            ${remarks ? `
            <div class="status-info-row">
                <span class="status-label">Remarks</span>
                <span class="status-value">${remarks}</span>
            </div>
            ` : ''}
        </div>
    `;

    statusBody.innerHTML = statusHTML;
    statusModal.classList.remove('hidden');
}

function showErrorInModal(registrationId) {
    const errorHTML = `
        <div class="status-info">
            <div class="status-info-row">
                <span class="status-label">Registration ID</span>
                <span class="status-value">${registrationId}</span>
            </div>
            <div class="status-info-row">
                <span class="status-label">Status</span>
                <span class="status-badge rejected">Not Found</span>
            </div>
        </div>
        <p style="color: var(--text-muted); font-size: var(--step--1); margin-top: var(--space-md); text-align: center;">
            Unable to find complaint with this registration ID. Please verify the ID and try again.
        </p>
    `;

    statusBody.innerHTML = errorHTML;
    statusModal.classList.remove('hidden');
}

// Modal Close Handlers
closeModalBtn.addEventListener('click', () => {
    statusModal.classList.add('hidden');
});

// Close modal when clicking outside
statusModal.addEventListener('click', (e) => {
    if (e.target === statusModal) {
        statusModal.classList.add('hidden');
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !statusModal.classList.contains('hidden')) {
        statusModal.classList.add('hidden');
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    location.reload();
});
