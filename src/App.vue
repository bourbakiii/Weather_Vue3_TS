<template>
  Some text right there
  <br />
  {{ user }}
  <br />
  <button>Add one</button>

  <br>
  {{ selected_city }}
  <br>
  <search-and-select @input="getCitiesTimeout()" :options="founded_cities" placeholder="Some placeholder right here"
    v-model="city_query" @select="selectCity" />


    <br>
    {{ selected_city }}
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import type { City, UserData } from "./types";
import SearchAndSelect from "./components/SearchAndSelect.vue";
const DADATA_TOKEN: string = "7fda5aeb952635eb6b827e0d1e8a5d28713aab5f";
const DADATA_SECRET: string = "1daedeefd4a830570ab68aa596f23ef0f1bb13f2";
const WEATHER_TOKEN: string = "6e56f1241cca1b4833c6f6787535e97e";
const ICON_URL = ref<string>(String());
const founded_cities = ref<City[]>(Array());
const city_query = ref<string>(String("В"));
const user = ref<UserData>({ ip: null, city: null });

let selected_city = ref<City>({} as City);
const selectCity = (item:City) => selected_city.value = item;
onMounted(async () => {
  user.value.ip = (await getIP()) as string;
  user.value.city = await getUserCityParameters();
  selected_city.value = user.value.city;
  getWeatherByCoordinates(user.value.city);
  founded_cities.value = await getCitiesTimeoutHandler(city_query.value);
});

async function getWeatherByCoordinates<
  T extends { name: string; geo_lat: string; geo_lon: string }
>(city: T) {
  const { data: response_data } = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${city.geo_lat}&lon=${city.geo_lon}&appid=${WEATHER_TOKEN}`
  );
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
          Authorization: `Token ${DADATA_TOKEN}`,
          "X-Secret": DADATA_SECRET,
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