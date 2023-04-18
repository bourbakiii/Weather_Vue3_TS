<template>
  Some text right there
  <br />
  {{ user }}
  <br />
  <button>Add one</button>
 
  <br>


</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import type { City, UserData } from "./types";
import { computed } from "@vue/reactivity";
const DADATA_TOKEN: string = "7fda5aeb952635eb6b827e0d1e8a5d28713aab5f";
const DADATA_SECRET: string = "1daedeefd4a830570ab68aa596f23ef0f1bb13f2";
const WEATHER_TOKEN: string = "6e56f1241cca1b4833c6f6787535e97e";
const ICON_URL = ref<string>(String());
const founded_cities = ref<City[]>(Array());
const city_query = ref(String("В"));
const user = ref<UserData>({ ip: null, city: null });

const computed_founded_cities = computed(()=>founded_cities.value.map(({id,name})=>({value:id, text: name})));
const selected_city = {
          value: '',
          text: ''
        }

onMounted(async () => {
  user.value.ip = (await getIP()) as string;
  user.value.city = await getUserCityParameters();

  getWeatherByCoordinates(user.value.city);

  founded_cities.value = await getCitiesTimeoutHandler(city_query.value);
});

async function getWeatherByCoordinates<
  T extends { name: string; geo_lat: string; geo_lon: string }
>(city: T) {
  const { data: response_data } = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${city.geo_lat}&lon=${city.geo_lon}&appid=${WEATHER_TOKEN}`
  );
  console.log(response_data);
}

async function getIP(): Promise<string> {
  const response = await axios.get("https://www.cloudflare.com/cdn-cgi/trace");
  return response.data.split("\n")[2].substring(3, 1000);
}

async function getUserCityParameters() {
  const response = await axios.post(
    "https://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address",
    { ip: user.value.ip },
    { headers: { Authorization: `Token ${DADATA_TOKEN}` } }
  );
  return {
    id: response.data.location.data.fias_id,
    name: response.data.location.data.settlement,
    geo_lon: response.data.location.data.geo_lon,
    geo_lat: response.data.location.data.geo_lat,
  };
}

async function getCitiesTimeoutHandler(query:string) {
  const response = await axios
    .post(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
      {
        query: city_query.value,
        from_bound: { value: "city" },
        to_bound: { value: "city" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${DADATA_TOKEN}`,
          "X-Secret": DADATA_SECRET,
        },
      }
    )
    console.log("the data is:");
    console.log(response.data);
      return (response?.data.suggestions.map(
        ({ data: { fias_id, city, geo_lat, geo_lon } }: any) =>
          ({id: fias_id, name: city, geo_lat, geo_lon })
      )??[]) as City[];

}

 function debounce(fn: Function, delay: number): Function {
  let timeoutID:NodeJS.Timeout;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => fn.apply(this, args), delay);
  };
}

const getCitiesTimeout:any = debounce(getCitiesTimeoutHandler, 2500);

async function setFoundedCities(){
  founded_cities.value = await getCitiesTimeoutHandler(city_query.value);
  console.log(founded_cities);
}


function loggy(){
  console.log('here we go again');
}
</script>