<template>
  Some text right there
  <br />
  {{ user }}
  <br />
  <button>Add one</button>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
const DADATA_TOKEN: string = "7fda5aeb952635eb6b827e0d1e8a5d28713aab5f";
const WEATHER_TOKEN: string = "6e56f1241cca1b4833c6f6787535e97e";
type UserData = {
  ip: string | null;
  city: { name: string; geo_lat: string; geo_lon: string } | null;
};

const user = ref<UserData>({ ip: null, city: null });

onMounted(async () => {
  user.value.ip = (await getIP()) as string;
  user.value.city = await getUserCityParameters();

  getWeatherByCoordinates(user.value.city);
});

async function getWeatherByCoordinates<
  T extends { name: string; geo_lat: string; geo_lon: string }
>(city: T) {
  const {data: response_data} = await axios.get(
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
    // https://openweathermap.org/img/wn/10d@2x.png
  );

  return {
    name: response.data.location.data.city,
    geo_lon: response.data.location.data.geo_lon,
    geo_lat: response.data.location.data.geo_lat,
  };
}
</script>