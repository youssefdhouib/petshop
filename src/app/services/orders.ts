import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Animal } from './animals'; // Importez l'interface Animal si elle existe

export interface Order {
  id?: number;
  user_id: number;
  user_name?: string;
  total_amount: number;
  order_date: string;
  status: string;
  animals: AnimalOrder[];
}

export interface AnimalOrder {
  id: number;
  name: string;
  price?: number; // Ajouté pour le calcul du total
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = 'http://localhost:8081/petshop/api/orders';
  private animalsApiUrl = 'http://localhost:8081/petshop/api/animals'; // URL pour récupérer les animaux

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    return this.http.get<{data: Order[]}>(this.apiUrl, {
        withCredentials: false // Only set to true if your backend requires credentials
    }).pipe(
        map(response => response.data)
    );
}

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(orderData: Order): Observable<any> {
    // Validation des données avant envoi
    if (!orderData.user_id || !orderData.animals?.length) {
        throw new Error('Données de commande invalides');
    }

    const payload = {
        user_id: orderData.user_id,
        animal_ids: orderData.animals.map(a => a.id),
        total_amount: orderData.animals.reduce((sum, animal) => sum + (animal.price || 0), 0),
        order_date: orderData.order_date || new Date().toISOString().split('T')[0],
        status: orderData.status || 'Pending'
    };

    console.log('Envoi au backend:', payload); // Debug

    return this.http.post(`${this.apiUrl}/add`, payload, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    }).pipe(
        tap(response => console.log('Réponse du backend:', response)) // Debug
    );
}

  updateOrder(id: number, order: Order): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, order);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Nouvelle méthode pour récupérer les détails des animaux
  getAnimalDetails(animalId: number): Observable<Animal> {
    return this.http.get<Animal>(`${this.animalsApiUrl}/${animalId}`);
  }
}