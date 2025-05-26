// --- Home Page as Vue Component (your main interactive grid) ---
const Home = {
  // Add editMode as a prop
  props: {
    editMode: Boolean
  },
  template: `
    <div>
      <!-- v-if now uses the editMode prop -->
      <div v-if="editMode" class="edit-panel">
        <h3>Add Widgets:</h3>
        <div class="widget-checkboxes">
          <label v-for="widget in availableWidgets" :key="widget.id">
            <input type="checkbox" 
                   :checked="activeWidgets.some(w => w.id === widget.id)"
                   @change="toggleWidget(widget)">
            {{ widget.name }}
          </label>
        </div>
      </div>
      <div class="grid-container">
        <!-- v-if on widget controls now uses the editMode prop -->
        <div v-for="(widget, index) in activeWidgets" :key="widget.id" 
             :class="['box', widget.class]">
          <div v-if="editMode" class="widget-controls">
            <button @click="moveWidget(index, -1)" :disabled="index === 0" class="move-btn">↑</button>
            <button @click="moveWidget(index, 1)" :disabled="index === activeWidgets.length - 1" class="move-btn">↓</button>
            <button @click="removeWidget(index)" class="remove-btn">×</button>
          </div>
          
          <!-- Cat Fact Widget -->
          <div v-if="widget.id === 'catFact'">
            <h3>Fun cat fact!</h3>
            <p>{{ catFact }}</p>
            <button @click="getCatFact" :disabled="catFactLoading">Get new fact!</button>
          </div>
          
          <!-- Cat Photo Widget -->
          <div v-if="widget.id === 'catPhoto'">
            <h3>Fun cat photo!</h3>
            <div class="photo-content-area" :style="photoAreaStyle">
              <div v-if="catPicUrlLoading" class="photo-placeholder">
                <div class="loading-indicator-wrapper">
                  <div class="spinner"></div>
                  <span class="placeholder-text">Loading image...</span>
                </div>
              </div>
              <img v-else-if="catPicUrl" alt="A cute cat" :src="catPicUrl">
              <div v-else-if="catPicLoadError" class="photo-placeholder error">
                <span class="placeholder-text">Could not load image. Try again!</span>
              </div>
              <div v-else class="photo-placeholder"> 
                <span class="placeholder-text">Click "Get new photo!"</span>
              </div>
            </div>
            <button @click="getCatPhoto" :disabled="catPicUrlLoading">Get new photo!</button>
          </div>
          
          <!-- AQI Widget -->
          <div v-if="widget.id === 'aqi'">
            <h3>AQI</h3>
            <div v-if="weatherDataLoading">
              <h5>Loading...</h5>
              <h2 class='big'>Loading...</h2>
            </div>
            <div v-else-if="weatherData && weatherData.location && weatherData.current && weatherData.current.air_quality">
              <h5>{{ weatherData.location.name }}, {{ weatherData.location.country }}</h5>
              <h2 class="big">{{ weatherData.current.air_quality.pm2_5 !== undefined ? weatherData.current.air_quality.pm2_5 : 'N/A' }}</h2>
            </div>
            <div v-else>
              <h5>Error</h5>
              <p>{{ (weatherData && weatherData.error) ? weatherData.error : 'Could not load AQI data.' }}</p>
            </div>
            <p>Because all cats want to be healthy...</p>
            <button @click="getWeatherData" :disabled="weatherDataLoading">Refresh</button>
          </div>
          
          <!-- Clock Widget -->
          <div v-if="widget.id === 'clock'">
            <h3>Time</h3>
            <h2 class="big">{{ currentTime }}</h2>
          </div>
          
          <!-- Trivia Widget -->
          <div v-if="widget.id === 'trivia'">
            <h3>Trivia!</h3>
            <p>{{ triviaq }}</p>
            <button @click="truePressed" :class="trueButton" :disabled="triviaButtonDisabled">True</button>
            <button @click="falsePressed" :class="falseButton" :disabled="triviaButtonDisabled">False</button>
            <button @click="getTriviaQuestion" :disabled="newQuestionLoading">Get new question!</button>
          </div>
          
          <!-- Weather Widget -->
          <div v-if="widget.id === 'weather'">
            <h3>Weather</h3>
            <div v-if="weatherDataLoading">
              <p>Loading weather...</p>
            </div>
            <div v-else-if="weatherData && weatherData.current && weatherData.current.condition && weatherData.location">
              <p class='weathertitle1'>{{ weatherData.location.name }}</p>
              <img class="weathericon1" :src="weatherData.current.condition.icon" alt="Weather icon">
              <p class='weathertemp1'>{{ weatherData.current.temp_c !== undefined ? weatherData.current.temp_c + '°C' : 'N/A' }}</p>
            </div>
            <div v-else>
              <h5>Error</h5>
              <p>{{ (weatherData && weatherData.error) ? weatherData.error : 'Could not load weather data.' }}</p>
            </div>
            <button @click="getWeatherData" :disabled="weatherDataLoading">Refresh</button>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      // editMode is removed from here
      availableWidgets: [
        { id: 'catFact', name: 'Cat Facts', class: 'fact-box' },
        { id: 'catPhoto', name: 'Cat Photos', class: 'photo-box' },
        { id: 'aqi', name: 'Air Quality', class: 'aqi-box' },
        { id: 'clock', name: 'Clock', class: 'clock-box' },
        { id: 'trivia', name: 'Trivia', class: 'trivia-box' },
        { id: 'weather', name: 'Weather', class: 'weather-box' }
      ],
      activeWidgets: [],
      catFact: '',
      catPicUrl: '',
      catFactLoading: false,
      catPicUrlLoading: false,
      catPicLoadError: false,
      catPicOriginalWidth: null, // Store original width from API
      catPicOriginalHeight: null, // Store original height from API
      weatherDataLoading: false, // Initial state can be false, will be set true in getWeatherData
      currentTime: "",
      triviaq: "",
      triviaa: "",
      falseButton: "",
      trueButton: "",
      triviaButtonDisabled: true,
      newQuestionLoading: true,
      weatherData: null,
    }
  },
  watch: {
    // Watch for changes in the editMode prop
    editMode(newValue, oldValue) {
      if (oldValue === true && newValue === false) {
        // Save layout when exiting edit mode
        this.saveLayout();
      }
    }
  },
  computed: { // New computed property section
    photoAreaStyle() {
      if (this.catPicOriginalWidth && this.catPicOriginalHeight) {
        return {
          aspectRatio: `${this.catPicOriginalWidth} / ${this.catPicOriginalHeight}`,
          // width: '100%', // This is already handled by CSS class
          // height will be determined by width and aspect-ratio
        };
      }
      // Fallback style if dimensions are not yet known
      return {
        height: '220px', // Default height
        // width: '100%', // This is already handled by CSS class
      };
    }
  },
  methods: {
    // toggleEditMode method is removed from here
    toggleWidget(widget) {
      const index = this.activeWidgets.findIndex(w => w.id === widget.id);
      if (index >= 0) {
        this.activeWidgets.splice(index, 1);
      } else {
        this.activeWidgets.push({ ...widget });
      }
    },
    removeWidget(index) {
      this.activeWidgets.splice(index, 1);
    },
    moveWidget(index, direction) {
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < this.activeWidgets.length) {
        const widget = this.activeWidgets.splice(index, 1)[0];
        this.activeWidgets.splice(newIndex, 0, widget);
      }
    },
    saveLayout() {
      localStorage.setItem('widgetLayout', JSON.stringify(this.activeWidgets.map(w => w.id)));
    },
    loadLayout() {
      const saved = localStorage.getItem('widgetLayout');
      if (saved) {
        const savedIds = JSON.parse(saved);
        this.activeWidgets = savedIds.map(id => 
          this.availableWidgets.find(w => w.id === id)
        ).filter(Boolean);
      } else {
        // Default layout
        this.activeWidgets = [...this.availableWidgets];
      }
    },
    getCatFact() {
      this.catFactLoading = true;
      fetch("https://catfact.ninja/fact")
        .then(responseFact => responseFact.json())
        .then(data => {
          this.catFact = data.fact;
          this.catFactLoading = false;
        })
        .catch(() => { // Handle fetch errors for cat fact
            this.catFact = "Could not fetch cat fact.";
            this.catFactLoading = false;
        });
    },
    getCatPhoto() {
      this.catPicUrlLoading = true;
      this.catPicLoadError = false; 
      this.catPicUrl = ""; // Clear previous image URL
      this.catPicOriginalWidth = null; // Reset dimensions
      this.catPicOriginalHeight = null;

      fetch("https://api.thecatapi.com/v1/images/search")
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          if (data && data[0] && data[0].url && data[0].width && data[0].height) {
            this.catPicOriginalWidth = data[0].width; // Store dimensions first
            this.catPicOriginalHeight = data[0].height;

            const url = data[0].url;
            const img = new window.Image();
            img.onload = () => {
              this.catPicUrl = url; // Set URL only after dimensions are set and image loaded
              this.catPicUrlLoading = false;
              // this.catPicLoadError = false; // Already false
            };
            img.onerror = () => {
              this.catPicUrlLoading = false;
              this.catPicLoadError = true; 
              // Keep original dimensions null or reset them if error means they are invalid
              // this.catPicOriginalWidth = null; 
              // this.catPicOriginalHeight = null;
            };
            img.src = url;
          } else {
            // API response missing data or dimensions
            this.catPicUrlLoading = false;
            this.catPicLoadError = true;
            this.catPicOriginalWidth = null; 
            this.catPicOriginalHeight = null;
          }
        })
        .catch((error) => {
            console.error("Failed to fetch cat photo:", error);
            this.catPicUrlLoading = false;
            this.catPicLoadError = true;
            this.catPicOriginalWidth = null;
            this.catPicOriginalHeight = null;
        });
    },
    getWeatherData() {
      this.weatherDataLoading = true;
      this.weatherData = null; // Reset data to show loading state

      const successCallback = (position) => {
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=d988d52d87f943079de64335230312&q=${position.coords.latitude},${position.coords.longitude}&aqi=yes&alerts=no`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            // Round PM2.5 if available
            if (data && data.current && data.current.air_quality && typeof data.current.air_quality.pm2_5 === 'number') {
              data.current.air_quality.pm2_5 = Math.round(data.current.air_quality.pm2_5);
            }

            // If fetch was successful and JSON parsed, store the data.
            // Widgets are responsible for handling missing fields within the data.
            this.weatherData = data;
            this.weatherDataLoading = false;
          })
          .catch(error => {
            console.error("Failed to fetch or parse weather data:", error); // Updated console message
            this.weatherData = { error: "Could not retrieve weather data. Please try again." };
            this.weatherDataLoading = false;
          });
      };

      const errorCallback = (error) => {
        console.error("Geolocation error:", error);
        let message = 'Failed to fetch location. Please enable location services.';
        if (error.code === error.PERMISSION_DENIED) {
            message = 'Location is turned off in your browser settings, enable it to access weather data';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
            message = 'The request to get user location timed out.';
        }
        this.weatherData = { error: message };
        this.weatherDataLoading = false;
        // alert(message); // Removed alert for geolocation specific errors
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, { timeout: 10000 }); // Added timeout
      } else {
        const message = "Geolocation is not supported by this browser.";
        this.weatherData = { error: message };
        this.weatherDataLoading = false;
      }
    },
    showTime() {
      let time = new Date();
      let hour = time.getHours();
      let min = time.getMinutes();
      let sec = time.getSeconds();
      let am_pm = "AM";
      if (hour >= 12) {
        if (hour > 12) hour -= 12;
        am_pm = "PM";
      } else if (hour == 0) {
        hour = 12;
      }
      hour = hour < 10 ? "0" + hour : hour;
      min = min < 10 ? "0" + min : min;
      sec = sec < 10 ? "0" + sec : sec;
      this.currentTime = hour + ":" + min + ":" + sec + am_pm;
    },
    getTriviaQuestion() {
      this.newQuestionLoading = true;
      this.triviaButtonDisabled = true;
      // Open Trivia DB, adds a cache-buster
      const url = "https://opentdb.com/api.php?amount=1&difficulty=easy&type=boolean&" + Math.random();
      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            // Decode HTML entities
            let q = data.results[0].question.replace(/&quot;/g, '"').replace(/&#039;/g, "'");
            q = q.replace(/&amp;/g, "&");
            this.triviaq = q;
            this.triviaa = data.results[0].correct_answer;
            this.falseButton = "";
            this.trueButton = "";
            this.triviaButtonDisabled = false;
            this.newQuestionLoading = false;
          } else {
            this.triviaq = "Couldn't fetch a question. This may be due to a rate limit. Try again!";
            this.triviaa = "";
            this.falseButton = "";
            this.trueButton = "";
            this.triviaButtonDisabled = false;
            this.newQuestionLoading = false;
          }
        });
    },
    falsePressed() {
      if (this.triviaa === "False") {
        this.falseButton = "correct";
        this.trueButton = "";
        this.triviaButtonDisabled = true;
      } else {
        this.falseButton = "wrong";
        this.trueButton = "";
        this.triviaButtonDisabled = true;
      }
    },
    truePressed() {
      if (this.triviaa === "True") {
        this.trueButton = "correct";
        this.falseButton = "";
        this.triviaButtonDisabled = true;
      } else {
        this.trueButton = "wrong";
        this.falseButton = "";
        this.triviaButtonDisabled = true;
      }
    }
  },
  mounted() {
    this.loadLayout();
    this.getCatFact();
    this.getCatPhoto();
    this.getWeatherData(); // This will now handle its loading and error states more gracefully
    this.getTriviaQuestion();
    setInterval(this.showTime, 1000);
  }
};
// --- About Page as Vue Component ---
const About = {
  template: `
    <div>
      <h1>About</h1>
      <p>Welcome to mateo.lol, your ultimate destination for fun facts, trivia, and cat photos!</p>
      <img class="faded" src="/Images/stackedcats.png" alt="Many Cats">
    </div>
  `
};

// --- Contact Page as Vue Component ---
const Contact = {
  data() {
    return {
      name: "",
      email: "",
      message: "",
      submitting: false,
      error: "",
    };
  },
  methods: {
    submitForm() {
      this.error = "";
      this.submitting = true;
      // You can add your access_key here!
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          access_key: "your-access-key-here", // replace with your actual access_key!
          name: this.name,
          email: this.email,
          message: this.message,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Go to thanks page!
            this.$router.push("/thanks");
          } else {
            this.error = "There was a problem submitting your form. Please try again.";
          }
          this.submitting = false;
        })
        .catch(() => {
          this.error = "Network error! Please try again.";
          this.submitting = false;
        });
    },
  },
  template: `
    <div>
      <h1>Contact us!</h1>
      <form @submit.prevent="submitForm">
        <input v-model="name" type="text" name="name" placeholder="Name" class="info" required><br>
        <input v-model="email" type="email" name="email" placeholder="Email" class="info" required><br>
        <textarea v-model="message" name="message" placeholder="Your message" required></textarea><br>
        <button type="submit" class="submit" :disabled="submitting">
          {{ submitting ? "Sending..." : "Send" }}
        </button>
      </form>
      <div v-if="error" style="color: red; margin-top: 1em">{{ error }}</div>
    </div>
  `,
};

// --- Thanks Page as Vue Component ---
const Thanks = {
  template: `
    <div>
      <h3>Thanks!</h3>
      <img src='thankyou.webp'>
      <h2>Your form was submitted successfully.</h2>
      <router-link to="/contact">Go back</router-link>
    </div>
  `
};

// --- 404 Page as Vue Component ---
const NotFound = {
  template: "<div><h1>404 - Not Found</h1></div>"
};

// --- Vue Router setup ---
const routes = [
  {path: '/', component: Home},
  {path: '/about', component: About},
  {path: '/contact', component: Contact},
  {path: '/thanks', component: Thanks},
  {path: '/:pathMatch(.*)*', component: NotFound}
];
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});

// --- Main Vue App ---
const app = Vue.createApp({
  data() {
    return {
      editMode: false // Manages the edit mode state globally
    }
  },
  methods: {
    toggleEditMode() {
      this.editMode = !this.editMode;
      // The Home component will watch for this change to save layout if needed
    }
  }
});
app.use(router);
app.mount('#app');

// --- Theme Switcher logic (unchanged) ---
const themeKey = 'theme';
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}
const savedTheme = localStorage.getItem(themeKey) || 'dark';
applyTheme(savedTheme);
// Ensure themeSwitcher element exists before trying to set its value or add event listener
// This is important because script.js might run before the full DOM is ready if not deferred properly
// or if elements are dynamically added.
document.addEventListener('DOMContentLoaded', () => {
  const themeSwitcher = document.getElementById('themeSwitcher');
  if (themeSwitcher) {
    themeSwitcher.value = savedTheme;
    themeSwitcher.addEventListener('change', function () {
      applyTheme(this.value);
      localStorage.setItem(themeKey, this.value);
    });
  }
});
