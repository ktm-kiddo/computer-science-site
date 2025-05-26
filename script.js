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

          <!-- Quote of the Day Widget -->
          <div v-if="widget.id === 'quote'">
            <h3>Quote of the Day</h3>
            <div v-if="quoteLoading" class="loading-indicator-wrapper">
              <div class="spinner"></div>
              <span class="placeholder-text">Loading quote...</span>
            </div>
            <div v-else-if="quoteText">
              <p><em>"{{ quoteText }}"</em></p>
              <p>- {{ quoteAuthor || 'Unknown' }}</p>
            </div>
            <div v-else>
              <p>Could not load today's quote.</p>
            </div>
            <!-- "New Quote" button removed -->
          </div>

          <!-- To-Do List Widget -->
          <div v-if="widget.id === 'todoList'">
            <h3>To-Do List</h3>
            <form @submit.prevent="addTodo" class="todo-form">
              <input type="text" v-model="newTodoText" placeholder="Add a new task" class="todo-input">
              <button type="submit" class="todo-add-btn">+</button>
            </form>
            <ul class="todo-list">
              <li v-for="todo in todos" :key="todo.id" :class="{ completed: todo.completed }" class="todo-item">
                <input type="checkbox" :checked="todo.completed" @change="toggleTodoCompletion(todo.id)" class="todo-checkbox">
                <span @click="toggleTodoCompletion(todo.id)" class="todo-text">{{ todo.text }}</span>
                <button @click="removeTodo(todo.id)" class="todo-remove-btn">×</button>
              </li>
            </ul>
            <p v-if="todos.length === 0" class="todo-empty-message">No tasks yet!</p>
          </div>

          <!-- This Day in History Widget -->
          <div v-if="widget.id === 'history'">
            <h3>On This Day...</h3>
            <div v-if="historyLoading" class="loading-indicator-wrapper">
              <div class="spinner"></div>
              <span class="placeholder-text">Loading history...</span>
            </div>
            <div v-else-if="historyFact">
              <p><strong>{{ historyDate }}</strong></p>
              <p>{{ historyFact }}</p>
            </div>
            <p v-else>Could not load historical fact.</p>
            <button @click="getHistoryFact" :disabled="historyLoading">Refresh History</button>
          </div>

          <!-- Calculator Widget -->
          <div v-if="widget.id === 'calculator'">
            <h3>Calculator</h3>
            <div class="calculator-grid">
              <div class="calculator-display">{{ calculatorDisplay || '0' }}</div>
              <button @click="clearCalculator" class="calc-btn span-two">C</button>
              <button @click="deleteCalculator" class="calc-btn">DEL</button>
              <button @click="chooseOperation('/')" class="calc-btn op-btn">/</button>
              <button @click="appendNumber('7')" class="calc-btn">7</button>
              <button @click="appendNumber('8')" class="calc-btn">8</button>
              <button @click="appendNumber('9')" class="calc-btn">9</button>
              <button @click="chooseOperation('*')" class="calc-btn op-btn">*</button>
              <button @click="appendNumber('4')" class="calc-btn">4</button>
              <button @click="appendNumber('5')" class="calc-btn">5</button>
              <button @click="appendNumber('6')" class="calc-btn">6</button>
              <button @click="chooseOperation('-')" class="calc-btn op-btn">-</button>
              <button @click="appendNumber('1')" class="calc-btn">1</button>
              <button @click="appendNumber('2')" class="calc-btn">2</button>
              <button @click="appendNumber('3')" class="calc-btn">3</button>
              <button @click="chooseOperation('+')" class="calc-btn op-btn">+</button>
              <button @click="appendNumber('0')" class="calc-btn span-two">0</button>
              <button @click="appendNumber('.')" class="calc-btn">.</button>
              <button @click="calculateResult" class="calc-btn op-btn">=</button>
            </div>
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
        { id: 'weather', name: 'Weather', class: 'weather-box' },
        { id: 'quote', name: 'Quote of the Day', class: 'quote-box' },
        { id: 'todoList', name: 'To-Do List', class: 'todo-box' },
        { id: 'history', name: 'On This Day', class: 'history-box' },
        { id: 'calculator', name: 'Calculator', class: 'calculator-box' }
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
      // Quote of the Day
      quoteText: '',
      quoteAuthor: '',
      quoteLoading: false,
      quoteDate: '', // To store the date of the fetched quote
      // To-Do List
      todos: [],
      newTodoText: '',
      // History Widget
      historyFact: '',
      historyDate: '',
      historyLoading: false,
      // Calculator Widget
      calculatorDisplay: '',
      currentOperand: '',
      previousOperand: '',
      selectedOperation: null,
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
          minHeight: '0' // Override CSS min-height to let aspect ratio dictate size
        };
      }
      // Fallback style if dimensions are not yet known
      // The CSS min-height: 150px will apply here if 220px is larger, which it is.
      return {
        height: '220px', // Default height
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
        ).filter(Boolean); // Filter out nulls if a widget ID was saved but no longer exists
      } else {
        // Default layout - include new widgets if desired, or keep it minimal
        this.activeWidgets = this.availableWidgets.filter(w => ['catFact', 'catPhoto', 'clock', 'quote', 'todoList', 'history'].includes(w.id));
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
    },
    // Quote of the Day Methods
    getQuote() {
      this.quoteLoading = true;
      // Using ZenQuotes API for today's quote via a CORS proxy
      fetch("https://api.allorigins.win/raw?url=https://zenquotes.io/api/today") 
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data && data[0] && data[0].q && data[0].a) {
            this.quoteText = data[0].q;
            this.quoteAuthor = data[0].a;
            const today = new Date().toDateString();
            this.quoteDate = today;
            localStorage.setItem('dailyQuote', JSON.stringify({ text: this.quoteText, author: this.quoteAuthor, date: today }));
          } else {
            this.quoteText = "Could not parse quote data.";
            this.quoteAuthor = "Unknown";
          }
          this.quoteLoading = false;
        })
        .catch(error => {
          console.error("Error fetching quote:", error);
          this.quoteText = "Could not fetch today's quote. Check console for errors.";
          this.quoteAuthor = "Error";
          this.quoteLoading = false;
        });
    },
    loadQuote() {
      const savedQuoteData = localStorage.getItem('dailyQuote');
      const today = new Date().toDateString();

      if (savedQuoteData) {
        const { text, author, date } = JSON.parse(savedQuoteData);
        if (date === today) {
          this.quoteText = text;
          this.quoteAuthor = author;
          this.quoteDate = date;
          return; // Quote is current, no need to fetch
        }
      }
      // If no saved quote, or saved quote is not from today, fetch a new one.
      this.getQuote();
    },

    // This Day in History Widget Methods
    getHistoryFact() {
      this.historyLoading = true;
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      // Format date for display
      this.historyDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

      fetch(`https://byabbe.se/on-this-day/${month}/${day}/events.json`)
        .then(response => response.json())
        .then(data => {
          if (data && data.events && data.events.length > 0) {
            // Pick a random event from the list
            const randomIndex = Math.floor(Math.random() * data.events.length);
            this.historyFact = `${data.events[randomIndex].year}: ${data.events[randomIndex].description}`;
          } else {
            this.historyFact = "No historical fact found for today.";
          }
          this.historyLoading = false;
        })
        .catch(error => {
          console.error("Error fetching history fact:", error);
          this.historyFact = "Could not fetch historical fact.";
          this.historyLoading = false;
        });
    },

    // Calculator Widget Methods
    clearCalculator() {
      this.calculatorDisplay = '';
      this.currentOperand = '';
      this.previousOperand = '';
      this.selectedOperation = null;
    },
    deleteCalculator() {
      this.calculatorDisplay = this.calculatorDisplay.slice(0, -1);
      if (this.currentOperand === this.calculatorDisplay) { // If we were deleting from currentOperand
          this.currentOperand = this.calculatorDisplay;
      }
    },
    appendNumber(number) {
      // If an operator was just pressed and display is empty, start new number
      if (this.selectedOperation && this.calculatorDisplay === '' && this.previousOperand !== '') {
        this.calculatorDisplay = number;
        this.currentOperand = this.calculatorDisplay;
        return;
      }
      if (number === '.' && this.calculatorDisplay.includes('.')) return;
      this.calculatorDisplay += number;
      this.currentOperand = this.calculatorDisplay; // Keep currentOperand in sync
    },
    chooseOperation(operation) {
      // If nothing entered, but display is not empty, allow chaining
      if (this.calculatorDisplay === '' && this.previousOperand === '') return; // Nothing to operate on
      if (this.calculatorDisplay !== '' && this.previousOperand !== '') {
        this.calculateResult();
      }
      // If display is not empty, set up for next operand (do not append operator to display)
      if (this.calculatorDisplay !== '') {
        this.selectedOperation = operation;
        this.previousOperand = this.calculatorDisplay;
        this.calculatorDisplay = '';
        this.currentOperand = '';
        return;
      }
      this.selectedOperation = operation;
      this.previousOperand = this.calculatorDisplay;
      this.calculatorDisplay = '';
      this.currentOperand = '';
    },
    calculateResult() {
      let result;
      const prev = parseFloat(this.previousOperand);
      const current = parseFloat(this.calculatorDisplay); // Use calculatorDisplay as current operand for calculation
      if (isNaN(prev) || isNaN(current)) return;
      switch (this.selectedOperation) {
        case '+':
          result = prev + current;
          break;
        case '-':
          result = prev - current;
          break;
        case '*':
          result = prev * current;
          break;
        case '/':
          if (current === 0) {
            this.calculatorDisplay = "Error";
            this.previousOperand = '';
            this.currentOperand = '';
            this.selectedOperation = null;
            return;
          }
          result = prev / current;
          break;
        default:
          return;
      }
      this.calculatorDisplay = result.toString();
      this.selectedOperation = null;
      this.previousOperand = ''; // Reset previousOperand
      this.currentOperand = result.toString(); // Store result as currentOperand
    },

    // To-Do List Methods
    loadTodos() {
      const savedTodos = localStorage.getItem('todos');
      if (savedTodos) {
        this.todos = JSON.parse(savedTodos);
      }
    },
    saveTodos() {
      localStorage.setItem('todos', JSON.stringify(this.todos));
    },
    addTodo() {
      if (this.newTodoText.trim() === '') return;
      this.todos.push({
        id: Date.now(),
        text: this.newTodoText.trim(),
        completed: false
      });
      this.newTodoText = '';
      this.saveTodos();
    },
    toggleTodoCompletion(todoId) {
      const todo = this.todos.find(t => t.id === todoId);
      if (todo) {
        todo.completed = !todo.completed;
        this.saveTodos();
      }
    },
    removeTodo(todoId) {
      this.todos = this.todos.filter(t => t.id !== todoId);
      this.saveTodos();
    }
  },
  mounted() {
    this.loadLayout();
    this.getCatFact();
    this.getCatPhoto();
    this.getWeatherData(); 
    this.getTriviaQuestion();
    this.loadQuote(); // Load quote
    this.loadTodos(); // Load todos
    this.getHistoryFact(); // Load initial history fact
    setInterval(this.showTime, 1000);

    // Inject CSS to fix to-do button hover issue
    const style = document.createElement('style');
    style.textContent = `
      .todo-add-btn, .todo-remove-btn {
        /* Ensure padding and border are included in the element's total width and height */
        box-sizing: border-box;
        /* Apply a transparent border by default to reserve space. */
        /* If your hover effect uses a border thicker than 1px, adjust this value. */
        border: 1px solid transparent;
      }
    `;
    document.head.appendChild(style);
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

// Loading Animation Logic
window.addEventListener('load', () => {
  const loadingAnimation = document.getElementById('loading-animation');
  if (loadingAnimation) {
    // Wait a bit for content to potentially render, then fade out
    setTimeout(() => {
      loadingAnimation.classList.add('hidden');
    }, 500); // Adjust delay as needed

    // Optional: Remove the loading animation from DOM after transition
    loadingAnimation.addEventListener('transitionend', () => {
      loadingAnimation.remove();
    });
  }
});

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
