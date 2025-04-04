import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

export interface Animal {
  id?: number;
  name: string;
  species: string;
  breed: string;
  birthdate: string;
  gender: string;
  price: number;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private apiUrl = 'http://localhost:8081/petshop/api/animals';
  private apiUrladd = 'http://localhost:8081/petshop/api/animals/add';
  private apiUrldelete = 'http://localhost:8081/petshop/api/animals/delete';
  private apiUrlupdate = 'http://localhost:8081/petshop/api/animals/update';
  private apiUrl1 = 'http://localhost:8081/petshop/api/animalsLibres';


  constructor(private http: HttpClient) {}

  getAllAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(this.apiUrl);
  }
  

  getAnimalById(id: number): Observable<Animal> {
    return this.http.get<Animal>(`${this.apiUrl}/${id}`);
  }

  addAnimal(animal: Animal): Observable<any> {
    return this.http.post<any>(this.apiUrladd, animal);
  }

  updateAnimal(animal: Animal): Observable<any> {
    return this.http.put<any>(`${this.apiUrlupdate}/${animal.id}`, animal);
  }

  deleteAnimal(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrldelete}/${id}`);
  }
  getAvailableAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.apiUrl1}/available`).pipe(
      catchError(this.handleError)
    );
  }

  getAnimalsForOrder(orderId: number): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.apiUrl1}/for-order/${orderId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('AnimalService error:', error);
    return throwError(() => new Error('Error fetching animals'));
  }
}
