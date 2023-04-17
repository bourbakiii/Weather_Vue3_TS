export type City = {name:string, geo_lat: string, geo_lon: string};


export type UserData = {
    ip: string | null;
    city: City | null;
  };
  