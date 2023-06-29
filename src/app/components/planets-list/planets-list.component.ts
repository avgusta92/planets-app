import { Component, OnInit } from '@angular/core';
import { SwapiHttpService } from 'src/app/services/http/swapi-http.service';
import { ModalComponent } from '../modal/modal.component';
import { MatDialog } from '@angular/material/dialog';
import { PlanetProps } from 'src/app/models/planet.model';
import { PeopleProps } from 'src/app/models/people.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-planets-list',
  templateUrl: './planets-list.component.html',
  styleUrls: ['./planets-list.component.scss']
})
export class PlanetsListComponent implements OnInit {
  public showSpinner: boolean = true;
  public planets: Array<PlanetProps> | null = null;
  public displayedColumns: Array<string> = [
    'name',
    'diameter',
    'climate',
    'population'
  ];
  private planetResidenceSub: Subscription | null = null;

  constructor(
    private httpService: SwapiHttpService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar
    ) {}

  public ngOnInit() {
    this.showSpinner = true;
    this.httpService.getPlanets()
      .subscribe({
        next: (planets) => {
          this.planets = planets;
          this.showSpinner = false;
        },
        error: (error) => {
          if(error) {
            this.openSnackBar('Something is wrong. Please reload the page.');
          }
          this.showSpinner = false;
        }
      })
  }

  public onRowClick(row: PlanetProps) {
    this.showSpinner = true;

    if (row?.residents?.length > 0) {
      this.planetResidenceSub = this.httpService
        .getPeopleFromPlanet(row.residents)
        .subscribe({
          next: (people) => {
            this.cancelPlanetResidenceLoad();
            this.openModal(people);
          },
          error: (error) => {
            if(error) {
              this.cancelPlanetResidenceLoad();
              this.openSnackBar('Something is wrong. Please try again.');
            }
          }
        })

      // If the response is not coming so long
      setTimeout(() => {
        if (this.showSpinner) {
          this.cancelPlanetResidenceLoad();
          this.openSnackBar('Something is wrong. Please try again.')
        };
      }, 20000);

    } else {
      this.cancelPlanetResidenceLoad();
      this.openModal();
    }
  }

  private cancelPlanetResidenceLoad() {
    this.unSubscribePlanetResidence();
    this.showSpinner = false;
  }

  private unSubscribePlanetResidence() {
    if (this.planetResidenceSub) {
      this.planetResidenceSub.unsubscribe();
      this.planetResidenceSub = null;
    };
  }

  private openSnackBar(message: string) {
    this._snackBar.open(message, 'cancel');
  }

  private openModal(data: Array<PeopleProps> | null = null) {
    this.dialog.open(ModalComponent, { data });
  }
}
