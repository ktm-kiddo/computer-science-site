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
      airQuality:'Loading...',
      currentPlace: 'Loading...',
      currentCountry: '',
    }
  },
  methods: {
    getCatFact() {
      this.catFactLoading = true;
      fetch("https://catfact.ninja/fact")
        .then(responsePhotoLink => responsePhotoLink.json())
        .then(data => {
          this.catFact = data.fact
          this.catFactLoading = false;
        })
    },
    getCatPhoto() {
      this.catPicUrlLoading = true;
      fetch("https://api.thecatapi.com/v1/images/search")
        .then(response => response.json())
        .then(data => {
          this.catPicUrl = data[0].url
          this.catPicUrlLoading = false;
        })
    },

    getWeatherData() {
      this.airQuality = 'Loading...',
      this.currentPlace = 'Loading...',
      this.weatherDataLoading = true;
      const successCallback = (position) => {
        console.log(position);
        fetch("https://api.weatherapi.com/v1/current.json?key=d988d52d87f943079de64335230312&q=" + position.coords.latitude + ", " + position.coords.longitude + "&aqi=yes")
          .then(response => response.json())
          .then (data => {
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
    console.log('mounted!')
    this.getCatFact()
    this.getCatPhoto()
    this.getWeatherData()
    this.startTime()
  }
})
app.mount('#app')
