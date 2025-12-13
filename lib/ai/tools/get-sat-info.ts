import { tool /*, type UIMessageStreamWriter */ } from "ai";
//import type { Session } from "next-auth";
import { z } from "zod";
//import type { ChatMessage } from "@/lib/types";
import {
  getSatelliteById,
  getSatHISTORICCachedData,
  getSatRecentCachedData,
  saveCacheData,
  //getSatRecentCachedData,
} from "@/lib/db/queries";
import type { New_Cached_Data, Satellite } from "@/lib/db/schema";

//import { generateUUID } from "@/lib/utils";
/*
type GetSatInfoProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};
*/
export const getSatInfo = tool({
  description: "Request satelite visual pass data",
  inputSchema: z.object({
    satellite_norad_id: z
      .number()
      .describe("Requested satellite's NORAD identification number."),
    observer_latitude: z.number().describe("Observer's location latitude."),
    observer_longitude: z.number().describe("Observer's location latitude."),
    observer_altitude: z.number().describe("Observer's location altitude."),
    prediction_days: z
      .number()
      .describe("Maximum prediction length in days. Default is 1.")
      .default(1),
    min_visibility: z
      .number()
      .describe(
        "How long should the satellite be visible for in seconds. Default is 120."
      )
      .default(120),
  }),
  execute: async ({
    satellite_norad_id,
    observer_altitude,
    observer_latitude,
    observer_longitude,
    prediction_days,
    min_visibility,
  }) => {
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    // biome-ignore lint/suspicious/noEvolvingTypes: <explanation>
    let data;
    try {
      const cachedData = await getSatRecentCachedData(
        satellite_norad_id,
        observer_altitude,
        observer_latitude,
        observer_longitude,
        prediction_days,
        min_visibility
      );

      console.log(
        `${satellite_norad_id}\n${observer_altitude}\n${observer_latitude}\n${observer_longitude}\n${prediction_days}\n${min_visibility}`
      );

      console.log(cachedData);

      if (cachedData === null || cachedData.length === 0) {
        const apiResponse = await fetch(
          `https://api.n2yo.com/rest/v1/satellite/visualpasses/${satellite_norad_id}/${observer_latitude}/${observer_longitude}/${observer_altitude}/${prediction_days}/${min_visibility}/&apiKey=${process.env.N2YO_API_KEY}`
        );

        const responseBody = await apiResponse.json();

        if (!responseBody || !apiResponse.ok) {
          const historicData = await getSatHISTORICCachedData(
            satellite_norad_id,
            observer_altitude,
            observer_latitude,
            observer_longitude,
            prediction_days,
            min_visibility
          );

          if (historicData.length === 0 || !historicData) {
            return { status: "Couldn't get data." };
          }

          const sat = getSatelliteById(historicData[0].sat_id);
          data = {
            info: sat,
            passes: historicData,
            source: "Historic Cache",
          };
          return data;
        }

        const sat: Satellite = {
          id: responseBody.info.satid,
          name: responseBody.info.satname,
        };
        const cache_insert_data: New_Cached_Data[] = [];

        for (const pass of responseBody.passes) {
          const insert = {
            eol: new Date(Date.now() + 30 * 60 * 1000),
            start_utc: new Date(pass.startUTC * 1000),

            start_az: pass.startAz,
            end_az: pass.endAz,
            start_elev: pass.startEl,
            end_elev: pass.endEl,

            latitude: observer_latitude,
            longitude: observer_longitude,
            altitude: observer_altitude,

            sat_id: sat.id,
            duration: pass.duration,
          };
          cache_insert_data.push(insert);

          saveCacheData(sat, insert);
        }

        data = {
          info: sat,
          passes: cache_insert_data,
          source: "N2YO API",
        };
        console.log(data);
      } else {
        console.log(cachedData);
        const sat = getSatelliteById(cachedData[0].sat_id);
        data = {
          info: sat,
          passes: cachedData,
          source: "Recent Cache",
        };
      }
    } catch (_error) {
      console.log(_error);
      const apiResponse = await fetch(
        `https://api.n2yo.com/rest/v1/satellite/visualpasses/${satellite_norad_id}/${observer_latitude}/${observer_longitude}/${observer_altitude}/${prediction_days}/${min_visibility}/&apiKey=${process.env.N2YO_API_KEY}`
      );

      data = await apiResponse.json();
    }
    console.log(data);
    return data;
  },
});
