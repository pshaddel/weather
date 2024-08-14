"use client";

import React, { useEffect } from "react";
import { WeatherData } from "./board";

// export type WeatherData = {
//   date: string,
//   temperature: number,
//   humidity: number,
//   windSpeed: number,
//   rain: number
// }[]

export default function WeatherTable({ data }: {
    data: WeatherData
}) {
  console.log(data);
  useEffect(() => {
    setTimeout(function() {
      console.log("Reloading page...");
      window.location.reload();
    }, 60000);
  }, []);
  const elemsize = "px-6 py-6"
  return (
    <div className="overflow-x-auto text-xl">
      <br/>
      <h1 className="text-2xl font-bold text-center">Elsbethen</h1>
      <table className="min-w-full table-auto p-2">
        <thead>
          <tr>
            <th className={`${elemsize} min-w-50`}>Date</th>
            <th className={`${elemsize} text-justify`}>Temp(°C)</th>
            <th className={`${elemsize} text-darkblue-500`}>Humidity(%)</th>
            <th className={`${elemsize} text-gray-400`}>Wind(km/h)</th>
            <th className={`${elemsize} text-blue-500`}>Rain (mm)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td className={`border ${elemsize} text-right`}>{row.date}</td>
              <td className={`border ${elemsize} ${temperatureColor(row.temperature)}`}>{row.temperature}</td>
              <td className={`border ${elemsize} text-darkblue-500 font-bold`}>{row.humidity}</td>
              <td className={`border ${elemsize} text-gray-400 font-bold`}>{row.windSpeed}</td>
              <td className={`border ${elemsize} text-blue-500 font-bold`}>{row.rain}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function temperatureColor(temperature: number) {
  if (temperature < 0) {
    return "text-blue-500";
  } else if (temperature < 10) {
    return "text-blue-400";
  } else if (temperature < 20) {
    return "text-green-500";
  } else if (temperature < 30) {
    return "text-yellow-500";
  } else {
    return "text-red-500";
  }
};