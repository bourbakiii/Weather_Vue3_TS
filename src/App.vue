<template>
  IP ---  {{ USER_IP }}
  <br />
  <br />
  <br />
  {{ selected_city }}


  <br />
  <br />
  <br />


  <search-and-select @focusout="city_query=selected_city.name" @input="getCitiesTimeout()" :options="founded_cities" placeholder="Some placeholder right here"
    v-model="city_query" @select="selectCity" />


</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import axios from "axios";
import type { City } from "./types";
import SearchAndSelect from "./components/SearchAndSelect.vue";
import { Weather } from './types';
const TOKENS:{ [key:string] :string } = {
  'DADATA': "7fda5aeb952635eb6b827e0d1e8a5d28713aab5f",
  'DADATA_SECRET': "1daedeefd4a830570ab68aa596f23ef0f1bb13f",
  'WEATHER': "6e56f1241cca1b4833c6f6787535e97e"
};
const ICON_URL = ref<string>(String());
const founded_cities = ref<City[]>(Array());
const city_query = ref<string>(String("В"));
let USER_IP: (string|null) = null;

let selected_city = ref<City>({} as City);
const selectCity = (item:City) => selected_city.value = item;
onMounted(async () => {
  USER_IP = (await getIP()) as string;
  selected_city.value = await getCityByIP();
  founded_cities.value = await getCitiesTimeoutHandler(city_query.value);
});


watch(selected_city, async (setted_city:City)=>{
  city_query.value = setted_city.name;
  setted_city.weather = await getWeather(setted_city)
});

async function getWeather<
  T extends { name: string; geo_lat: string; geo_lon: string }
>(city: T): Promise<Weather> {
  const { data: response_data } = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${city.geo_lat}&lon=${city.geo_lon}&appid=${TOKENS.WEATHER}`
  );
  
  const weather: Weather = {
    feels_like: response_data.main.feels_like,
    humidity: response_data.main.humidity,
    sea_level: response_data.main.sea_level,
    temperature:{
      current: response_data.main.temp,
      minimum: response_data.main.temp_min,
      maximum: response_data.main.temp_max,
    },
    pressure: response_data.main.pressure,

    sunset:  response_data.sys.sunset,
    sunrise: response_data.sys.sunrise,
    icon: response_data.weather[0].icon,
    description: response_data.weather[0].description, 
    main: response_data.weather[0].main,
    wind: response_data.wind
  };
  return weather;
}

async function getIP(): Promise<string> {
  const response = await axios.get("https://www.cloudflare.com/cdn-cgi/trace");
  return response.data.split("\n")[2].substring(3, 1000);
}

async function getCityByIP() {
  const response = await axios.post(
    "https://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address",
    { ip:USER_IP },
    { headers: { Authorization: `Token ${TOKENS.DADATA}` } }
  );
  console.log(response.data.location)
  return {
    id: response.data.location.data.fias_id,
    name: response.data.location.data.city||response.data.location.data.settlement,
    geo_lon: response.data.location.data.geo_lon,
    geo_lat: response.data.location.data.geo_lat,
  };
}

async function getCitiesTimeoutHandler(query: string = city_query.value) {
  const response = await axios
    .post(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
      {
        query,
        from_bound: { value: "city" },
        to_bound: { value: "city" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${TOKENS.DADATA}`,
          "X-Secret": TOKENS.DADATA_SECRET,
        },
      }
    )
  return (response?.data.suggestions.map(
    ({ data: { fias_id, city, geo_lat, geo_lon } }: any) =>
      ({ id: fias_id, name: city, geo_lat, geo_lon })
  ) ?? []) as City[];
}

function debounce(fn: Function, delay: number): Function {
  let timeoutID: NodeJS.Timeout;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => fn.apply(this, args), delay);
  };
}

const getCitiesTimeout: any = debounce(async ()=> founded_cities.value = await getCitiesTimeoutHandler(), 350);


</script>


<style lang="scss">
body {
  background-color: #fcfcfc;
}
</style>