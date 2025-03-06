import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface User {
  id?: number;
  fullname: string;
  email: string;
  phone: string;
  password: string; // Note: Ne pas inclure dans les réponses API publiques
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:8081/petshop/api/users'; // URL de base pour les utilisateurs

  // Options HTTP pour les requêtes POST et PUT
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Récupérer tous les utilisateurs
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer un utilisateur par son ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/get/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer un utilisateur par son email
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/getByEmail?email=${email}`).pipe(
      catchError(this.handleError)
    );
  }

  // Ajouter un nouvel utilisateur
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/add`, user, this.httpOptions).pipe(
        catchError(this.handleError)
    );
}

  // Mettre à jour un utilisateur existant
  updateUser(id: number, user: User): Observable<any> {
    return this.http.put<User>(`${this.apiUrl}/update/${id}`, user, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Supprimer un utilisateur
  deleteUser(id: number): Observable<any> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Gestion des erreurs
  private handleError(error: HttpErrorResponse) {
    console.error('Une erreur s\'est produite :', error);
    return throwError(() => new Error('Une erreur s\'est produite. Veuillez réessayer plus tard.'));
  }
}
