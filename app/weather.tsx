"use client";

import React, { useEffect } from "react";
import { WeatherData } from "./board";

export default function WeatherTable({ data }: {
    data: WeatherData
}) {
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
            <th className={`${elemsize} min-w-50`}>Time</th>
            <th className={`${elemsize} text-justify`}>Weather</th>
            <th className={`${elemsize} text-justify`}>Temp<br />(°C)</th>
            <th className={`${elemsize} text-darkblue-500`}>Hum<br />(%)</th>
            <th className={`${elemsize} text-gray-400`}>Wind<br />(km/h)</th>
            <th className={`${elemsize} text-blue-500`}>Rain<br />(mm)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td className={`border ${elemsize} text-right`}>{row.date}</td>
              <td className={`border ${elemsize} text-center`}>{row.weatherIcon}</td>
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

const temperatureLevels = [
  { maxTemp: 0, color: "text-purple-600" },
  { maxTemp: 10, color: "text-blue-500" },
  { maxTemp: 20, color: "text-cyan-500" },
  { maxTemp: 25, color: "text-green-500" },
  { maxTemp: 30, color: "text-yellow-500" },
  { maxTemp: 35, color: "text-orange-500" },
];

function temperatureColor(temperature: number): string {
  const level = temperatureLevels.find(l => temperature < l.maxTemp);
  return level ? level.color : "text-red-600"; // Default for temps >= 35
}