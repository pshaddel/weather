import Image from "next/image";
import { parse } from 'node-html-parser';
import WeatherTable from "./weather";

export async function Board() {
    const weather = await getWeather()

    return <WeatherTable data={formatWeather(weather)} />
}

/**
 * $ curl "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m"

{
  latitude: 52.52,
  longitude: 13.419998,
  generationtime_ms: 0.06604194641113281,
  utc_offset_seconds: 0,
  timezone: 'GMT',
  timezone_abbreviation: 'GMT',
  elevation: 38,
  current_units: {
    time: 'iso8601',
    interval: 'seconds',
    temperature_2m: '°C',
    wind_speed_10m: 'km/h'
  },
  current: {
    time: '2024-08-14T09:30',
    interval: 900,
    temperature_2m: 27,
    wind_speed_10m: 11.9
  },
  hourly_units: {
    time: 'iso8601',
    temperature_2m: '°C',
    relative_humidity_2m: '%',
    wind_speed_10m: 'km/h',
    rain: 'mm'
  },
  hourly: {
    time: [
      '2024-08-14T00:00', '2024-08-14T01:00',
      '2024-08-14T02:00', '2024-08-14T03:00',
      '2024-08-14T04:00', '2024-08-14T05:00',
      '2024-08-14T06:00', '2024-08-14T07:00',
      '2024-08-14T08:00', '2024-08-14T09:00',
      '2024-08-14T10:00', '2024-08-14T11:00',
      '2024-08-14T12:00', '2024-08-14T13:00',
      '2024-08-14T14:00', '2024-08-14T15:00',
      '2024-08-14T16:00', '2024-08-14T17:00',
      '2024-08-14T18:00', '2024-08-14T19:00',
      '2024-08-14T20:00', '2024-08-14T21:00',
      '2024-08-14T22:00', '2024-08-14T23:00'
    ],
    temperature_2m: [
      19.8, 19.1, 18.6, 18.4, 17.9,
      17.8,   19, 20.9, 23.1, 25.7,
        28, 29.9, 31.8, 33.2, 33.4,
      33.3, 32.7, 31.4, 28.2, 26.1,
      25.3, 24.4, 23.2, 22.9
    ],
    relative_humidity_2m: [
      52, 56, 58, 60, 61, 62, 60, 56,
      52, 47, 42, 38, 34, 31, 31, 30,
      30, 33, 59, 67, 73, 72, 81, 79
    ],
    wind_speed_10m: [
      12.3, 13.4, 12.6, 12.1, 11.3,
      10.9,  9.4, 10.9, 12.8, 11.8,
      12.3,   13, 13.5, 13.9, 14.5,
        14, 13.1, 11.2, 10.7,  4.6,
       0.8,  6.2,  5.9,    6
    ],
    rain: [
      0, 0, 0, 0, 0, 0,   0, 0,
      0, 0, 0, 0, 0, 0,   0, 0,
      0, 0, 0, 0, 0, 0, 0.1, 0
    ]
  }
}
 */
async function getWeather(): Promise<WeatherResponse> {
    // https://www.google.com/maps/place/47%C2%B046'03.0%22N+13%C2%B005'13.1%22E/@47.767505,13.0843931,17z/data=!3m1!4b1!4m4!3m3!8m2!3d47.767505!4d13.086968?entry=ttu
    const longitude = 13.086968;
    const latitude = 47.767505;
    // const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`)
    const urlParams = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: "temperature_2m,wind_speed_10m",
        hourly: "temperature_2m,relative_humidity_2m,wind_speed_10m,rain",
        forecast_days: "7",
        timezone: "Europe/Berlin"
    })
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${urlParams.toString()}`, {
      next: { revalidate: 55, tags: ["weather"] }
    })
    const data = await response.json();
    // format weather based on the data:
    // date, temperature, humidity, wind speed, rain

    return data
}

type WeatherResponse = {
  latitude: number,
  longitude: number,
  generationtime_ms: number,
  utc_offset_seconds: number,
  timezone: string,
  timezone_abbreviation: string,
  elevation: number,
  current_units: {
      time: string,
      interval: string,
      temperature_2m: string,
      wind_speed_10m: string
  },
  current: {
      time: string,
      interval: number,
      temperature_2m: number,
      wind_speed_10m: number
  },
  hourly_units: {
      time: string,
      temperature_2m: string,
      relative_humidity_2m: string,
      wind_speed_10m: string,
      rain: string
  },
  hourly: {
      time: string[],
      temperature_2m: number[],
      relative_humidity_2m: number[],
      wind_speed_10m: number[],
      rain: number[]
  }
}

export type WeatherData = {
  date: string,
  temperature: number,
  humidity: number,
  windSpeed: number,
  rain: number
}[]

function formatWeather(data: WeatherResponse): WeatherData {
  const hourlyData = data.hourly;
  let weatherData = hourlyData.time.map((time, index) => {
    return {
      date: time,
      temperature: hourlyData.temperature_2m[index],
      humidity: hourlyData.relative_humidity_2m[index],
      windSpeed: hourlyData.wind_speed_10m[index],
      rain: hourlyData.rain[index]
    }
  });
  // remove data of the past
  const now = new Date();
  const nowIndex = weatherData.findIndex((data) => new Date(data.date) > now);
  weatherData = weatherData.slice(nowIndex);
  // keep only next 10 hours
  weatherData = weatherData.slice(0, 10);
  // keep only hour from the data - without seconds
  weatherData = weatherData.map((data) => {
    return {
      ...data,
      date: data.date.split("T")[1].split(":").slice(0, 2).join(":")
    }
  });
  return weatherData
}