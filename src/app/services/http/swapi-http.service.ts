import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { PeopleProps } from 'src/app/models/people.model';
import { PlanetProps } from 'src/app/models/planet.model';

export interface PlanetsResponse {
  count: number,
  next: string,
  previous: string,
  results: Array<PlanetProps>
}

@Injectable({
  providedIn: 'root'
})
export class SwapiHttpService {

  constructor(private http: HttpClient){ }

  public getPlanets() {
    return this.http
      .get<PlanetsResponse>('https://swapi.dev/api/planets')
      .pipe(map((res) => res.results));
  }

  public getPeopleFromPlanet(residents: Array<string>) {
    let people: Array<Observable<PeopleProps>> = [];

    residents.forEach((url) => {
      people.push(this.http.get<PeopleProps>(url));
    })

    return forkJoin(people);
  }

}
