// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC6sV6a9-2V6v6V6v6v6v6v6v6v6v6v6v6",
    authDomain: "lotto-app-production.firebaseapp.com",
    projectId: "lotto-app-production",
    storageBucket: "lotto-app-production.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let selectedNumbers = [];
const MAX_NUMBERS = 6;
const MIN_NUMBER = 1;
const MAX_NUMBER = 50;

// Initialize number grid
function initializeNumberGrid() {
    const numberGrid = document.getElementById('numberGrid');
    numberGrid.innerHTML = '';
    
    for (let i = MIN_NUMBER; i <= MAX_NUMBER; i++) {
        const button = document.createElement('button');
        button.className = 'number-btn';
        button.textContent = i;
        button.onclick = () => toggleNumber(i);
        numberGrid.appendChild(button);
    }
    
    updatePurchaseButton();
}

// Toggle number selection
function toggleNumber(number) {
    const index = selectedNumbers.indexOf(number);
    
    if (index === -1) {
        if (selectedNumbers.length < MAX_NUMBERS) {
            selectedNumbers.push(number);
            updateSelectedNumbersDisplay();
            updateNumberButtons();
            updatePurchaseButton();
        } else {
            alert(`You can only select ${MAX_NUMBERS} numbers.`);
        }
    } else {
        selectedNumbers.splice(index, 1);
        updateSelectedNumbersDisplay();
        updateNumberButtons();
        updatePurchaseButton();
    }
}

// Update selected numbers display
function updateSelectedNumbersDisplay() {
    const container = document.getElementById('selectedNumbers');
    
    if (selectedNumbers.length === 0) {
        container.innerHTML = '<div class="selection-placeholder" style="color: #666; width: 100%; text-align: center; padding: 20px;">Selected numbers will appear here...</div>';
    } else {
        container.innerHTML = '';
        selectedNumbers.forEach(num => {
            const div = document.createElement('div');
            div.className = 'selected-number';
            div.textContent = num;
            container.appendChild(div);
        });
    }
}

// Update number buttons appearance
function updateNumberButtons() {
    document.querySelectorAll('.number-btn').forEach(btn => {
        const num = parseInt(btn.textContent);
        if (selectedNumbers.includes(num)) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

// Update purchase button state
function updatePurchaseButton() {
    const btn = document.getElementById('purchaseBtn');
    btn.disabled = selectedNumbers.length !== MAX_NUMBERS;
}

// Clear all selections
function clearSelection() {
    selectedNumbers = [];
    updateSelectedNumbersDisplay();
    updateNumberButtons();
    updatePurchaseButton();
}

// Generate random numbers
function generateRandom() {
    selectedNumbers = [];
    const numbers = [];
    
    while (numbers.length < MAX_NUMBERS) {
        const num = Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    
    selectedNumbers = numbers.sort((a, b) => a - b);
    updateSelectedNumbersDisplay();
    updateNumberButtons();
    updatePurchaseButton();
}

// Show purchase modal
function showPurchaseModal() {
    if (selectedNumbers.length !== MAX_NUMBERS) {
        alert(`Please select exactly ${MAX_NUMBERS} numbers.`);
        return;
    }
    
    document.getElementById('modalNumbers').textContent = selectedNumbers.join(', ');
    document.getElementById('purchaseModal').style.display = 'flex';
}

// Close purchase modal
function closePurchaseModal() {
    document.getElementById('purchaseModal').style.display = 'none';
}

// Close success modal
function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    clearSelection();
}

// Purchase ticket
async function purchaseTicket() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const dob = document.getElementById('dob').value;
    const phone = document.getElementById('phone').value;
    
    // Validation
    if (!fullName || !email || !dob || !phone) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Age validation
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age < 21) {
        alert('You must be 21 years or older to purchase LOTTO tickets.');
        return;
    }
    
    // Create ticket
    const ticketData = {
        ticketId: generateTicketId(),
        numbers: selectedNumbers,
        fullName: fullName,
        email: email,
        phone: phone,
        dob: dob,
        purchaseDate: new Date().toISOString(),
        drawDate: getNextDrawDate(),
        status: 'active',
        price: 2.00
    };
    
    try {
        // Save to Firebase
        await db.collection('tickets').doc(ticketData.ticketId).set(ticketData);
        
        // Show success
        document.getElementById('successTicketId').textContent = ticketData.ticketId;
        document.getElementById('purchaseModal').style.display = 'none';
        document.getElementById('successModal').style.display = 'flex';
        
        // Display ticket
        displayTicket(ticketData);
        
        // Clear form
        document.getElementById('fullName').value = '';
        document.getElementById('email').value = '';
        document.getElementById('dob').value = '';
        document.getElementById('phone').value = '';
        
    } catch (error) {
        console.error('Error saving ticket:', error);
        alert('An error occurred. Please try again.');
    }
}

// Generate unique ticket ID
function generateTicketId() {
    return 'TKT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Get next draw date (every Saturday)
function getNextDrawDate() {
    const today = new Date();
    const nextSaturday = new Date();
    nextSaturday.setDate(today.getDate() + (6 - today.getDay() + 7) % 7);
    nextSaturday.setHours(20, 0, 0, 0); // 8 PM
    return nextSaturday.toISOString();
}

// Display purchased ticket
function displayTicket(ticketData) {
    document.getElementById('ticketDisplay').style.display = 'block';
    document.getElementById('ticketId').textContent = ticketData.ticketId;
    document.getElementById('ticketDate').textContent = new Date(ticketData.purchaseDate).toLocaleDateString();
    
    const numbersDisplay = document.getElementById('ticketNumbersDisplay');
    numbersDisplay.innerHTML = '';
    
    ticketData.numbers.forEach(num => {
        const div = document.createElement('div');
        div.className = 'ticket-number';
        div.textContent = num;
        numbersDisplay.appendChild(div);
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeNumberGrid();
    
    // Close modals when clicking outside
    window.onclick = function(event) {
        const purchaseModal = document.getElementById('purchaseModal');
        const successModal = document.getElementById('successModal');
        
        if (event.target === purchaseModal) {
            purchaseModal.style.display = 'none';
        }
        if (event.target === successModal) {
            successModal.style.display = 'none';
        }
    };
});
