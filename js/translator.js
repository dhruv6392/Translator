const fromText = document.querySelector('.from-text');
const toText = document.querySelector('.to-text');
const exchangeIcon = document.querySelector('.change');
const selectTags = document.querySelectorAll('select');
const translateBtn = document.querySelector('button');
const speakBtn = document.querySelector('#speakBtn');
const startListeningBtn = document.querySelector('#startListeningBtn');
let voices = [];

// Populate select options on page load
const populateSelectOptions = () => {
    selectTags.forEach((tag, id) => {
        for (let country_code in countries) {
            let selected = id === 0 ? country_code === "en-GB" ? "selected" : "" : country_code === "hi-IN" ? "selected" : "";
            let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
            tag.insertAdjacentHTML("beforeend", option);
        }
    });
};
populateSelectOptions();

// Fetch and store available voices
const populateVoiceList = () => {
    voices = window.speechSynthesis.getVoices();
};
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Translate text
translateBtn.addEventListener("click", () => {
    let text = fromText.value.trim();
    let translateFrom = selectTags[0].value;
    let translateTo = selectTags[1].value;
    if (!text) return;
    toText.setAttribute("placeholder", "Translating...");
    let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;

    fetch(apiUrl)
        .then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok ' + res.statusText);
            }
            return res.json();
        })
        .then(data => {
            if (data.responseData) {
                toText.value = data.responseData.translatedText;
            } else {
                toText.value = "Error in translation response";
            }
            toText.setAttribute("placeholder", "Translation");
        })
        .catch(error => {
            toText.value = "Error in Translation";
            toText.setAttribute("placeholder", "Translation");
            console.error("Error:", error);
        });
});

// Inter-switch languages
exchangeIcon.addEventListener('click', () => {
    let tempText = fromText.value;
    let tempLang = selectTags[0].value;
    fromText.value = toText.value;
    toText.value = tempText;
    selectTags[0].value = selectTags[1].value;
    selectTags[1].value = tempLang;
});

// Speak the translated text
speakBtn.addEventListener('click', () => {
    
    let textToSpeak = toText.value;
    if (!textToSpeak) return;

    let utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = selectTags[1].value;

    // Select the best voice for Hindi
    let selectedVoice = voices.find(voice => voice.lang === 'hi-IN');
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
});

// Start speech recognition
startListeningBtn.addEventListener('click', () => {
    fromText.value=""
    toText.value=""
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert("Your browser does not support speech recognition. Please use Microsoft Edge or Google Chrome.");
        return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = selectTags[0].value;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        fromText.value = speechResult;
        console.log('Speech result:', speechResult);
    };

    recognition.onspeechend = () => {
        recognition.stop();
        console.log('Speech recognition service disconnected');
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error detected: ' + event.error);
        if (event.error === 'network') {
            alert('Network error: Please check your internet connection.');
        } else {
            alert('Speech recognition error detected: ' + event.error);
        }
    };

    recognition.start();
    console.log('Speech recognition service started');
});
