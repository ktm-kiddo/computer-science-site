//weather API login email: funding-retries-0j@icloud.com
// password: bykgUv-fuhpu9-diqded


const app = Vue.createApp({
  data() {
    return {
      catFact: '',
      catPicUrl: '',
      catFactLoading: true,
      catPicUrlLoading: true,
      weatherDataLoading: true,
      airQuality: 'Loading...',
      currentPlace: 'Loading...',
      currentCountry: '',
      currentTime: "",
      triviaq: "",
      triviaa: "",
      falseButton: "",
      trueButton: "",
      triviaButtonDisabled: true,
      newQuestionLoading: true,
    }
  },

  methods: {

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
      if (this.triviaa == "True") {
        this.trueButton = "correct";
        this.falseButton = "";
        this.triviaButtonDisabled = true;
      } else {
        this.trueButton = "wrong";
        this.falseButton = "";
        this.triviaButtonDisabled = true;
      }
    },

    getTriviaQuestion() {
      this.newQuestionLoading = true;
      this.triviaButtonDisabled = true;
      fetch("https://www.otriviata.com/api.php?amount=1&difficulty=easy&type=boolean")
        .then(response => response.json())
        .then(data => {
          this.triviaq = data.results[0].question;
          this.triviaa = data.results[0].correct_answer;
          this.falseButton = "";
          this.trueButton = "";
          this.triviaButtonDisabled = false;
          this.newQuestionLoading = false;
        })
    },

    getCatFact() {
      this.catFactLoading = true;
      fetch("https://catfact.ninja/fact")
        .then(responseFact => responseFact.json())
        .then(data => {
          this.catFact = data.fact
          this.catFactLoading = false;
        })
    },

    getCatPhoto() {
      this.catPicUrlLoading = true;
      fetch("https://api.thecatapi.com/v1/images/search")
        .then(response => response.json())
        .then(data => this.catPicUrl = data[0].url)
        .then(this.catPicUrlLoading = false)
    },

    showTime() {
      // Getting current time and date
      let time = new Date();
      let hour = time.getHours();
      let min = time.getMinutes();
      let sec = time.getSeconds();
      am_pm = "AM";

      // Setting time for 12 Hrs format
      if (hour >= 12) {
        if (hour > 12) hour -= 12;
        am_pm = "PM";
      } else if (hour == 0) {
        hr = 12;
        am_pm = "AM";
      }

      hour = hour < 10 ? "0" + hour : hour;
      min = min < 10 ? "0" + min : min;
      sec = sec < 10 ? "0" + sec : sec;

      this.currentTime =
        hour +
        ":" +
        min +
        ":" +
        sec +
        am_pm;
    },

    getWeatherData() {
      this.airQuality = 'Loading...',
        this.currentPlace = 'Loading...',
        this.weatherDataLoading = true;
      const successCallback = (position) => {
        console.log(position);
        fetch("https://api.weatherapi.com/v1/current.json?key=d988d52d87f943079de64335230312&q=" + position.coords.latitude + ", " + position.coords.longitude + "&aqi=yes")
          .then(response => response.json())
          .then(data => {
            console.log(data)
            this.airQuality = data.current.air_quality.pm2_5
            this.currentPlace = data.location.name
            this.currentCountry = data.location.country
            this.weatherDataLoading = false;
          })
      };
      const errorCallback = (error) => {
        console.log(error);
      };
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback)

    }

  },

  mounted() {
    this.getCatFact()
    this.getCatPhoto()
    this.getWeatherData()
    this.getTriviaQuestion()
    setInterval(this.showTime, 1000)
  }
})
app.mount('#app')