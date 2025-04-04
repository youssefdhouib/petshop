import { Component, OnInit } from '@angular/core';
import { OrdersService, Order, AnimalOrder } from '../../../services/orders';
import { Animal, AnimalService } from '../../../services/animals';
import { UsersService } from '../../../services/users'; // Ajoutez ce service
import { forkJoin } from 'rxjs';


declare interface TableData {
  headerRow: string[];
  dataRows: Order[];
}

@Component({
  selector: 'app-commandes',
  moduleId: module.id,
  templateUrl: 'commandes.component.html',
})
export class CommandesComponent implements OnInit {
  availableAnimals: Animal[] = [];
  currentOrderAnimals: Animal[] = [];
  public tableData1: TableData;
  public isAddMode = false;
  public isEditMode = false;
  public formData: Order = {
    user_id: 0,
    animals: [],
    total_amount: 0,
    order_date: '',
    status: 'Pending'
  };
  public allAnimals: any[] = [];
  public currentPage: number = 1;
  public itemsPerPage: number = 5;
  public searchText: string = '';
  public users: any[] = []; // Ajoutez cette propriété


  constructor(
    private ordersService: OrdersService,
    private animalService: AnimalService,
    private userService: UsersService // Ajoutez ce service

  ) {}

  ngOnInit() {
    this.tableData1 = {
      headerRow: ['ID', 'User', 'Animals', 'Status', 'Date', 'Total'],
      dataRows: []
    };
    this.getOrders();
    this.loadAnimals();
    this.loadUsers();
  }
  
  loadUsers() {
    this.userService.getAllUsers().subscribe(
      (users) => {
        this.users = users;
      },
      (error) => {
        console.error('Failed to fetch users', error);
      }
    );
  }
  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.fullname || user.email : `User #${userId}`;
  }

  getOrders() {
    this.ordersService.getAllOrders().subscribe(
      (orders: Order[]) => {
        this.tableData1.dataRows = orders;
      },
      (error) => {
        console.error('Failed to fetch orders', error);
      }
    );
  }

  loadAnimals() {
    this.animalService.getAllAnimals().subscribe(
      (animals) => {
        this.allAnimals = animals;
      },
      (error) => {
        console.error('Failed to fetch animals', error);
      }
    );
  }

  get paginatedRows() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRows().slice(startIndex, startIndex + this.itemsPerPage);
  }

  filteredRows() {
    return this.tableData1.dataRows.filter(row =>
      row.status.toLowerCase().includes(this.searchText.toLowerCase()) ||
      (row.user_name && row.user_name.toLowerCase().includes(this.searchText.toLowerCase())) ||
      row.animals.some(a => a.name.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  get totalPages() {
    return Math.ceil(this.filteredRows().length / this.itemsPerPage);
  }

  toggleAddForm() {
    this.isAddMode = true;
    this.isEditMode = false;
    this.formData = {
      user_id: 0,
      animals: [{ id: 0, name: '', price: 0 }],
      total_amount: 0,
      order_date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    this.loadAvailableAnimals();

  }
  addOrder() {
    console.log('Données avant envoi:', this.formData);
    
    this.ordersService.createOrder(this.formData).subscribe({
      next: (res) => console.log('Réponse du serveur:', res),
      error: (err) => {
        console.error('Erreur complète:', err);
        if (err.error) {
          console.error('Détails serveur:', err.error);
        }
      }
    });
  }

  addRow() {
    this.calculateTotal();
    
    const orderData = {
      user_id: this.formData.user_id,
      animals: this.formData.animals.filter(a => a.id > 0), // Ne garder que les animaux valides
      total_amount: this.formData.total_amount,
      order_date: this.formData.order_date,
      status: this.formData.status
    };
  
    this.ordersService.createOrder(orderData).subscribe({
      next: (response) => {
        console.log('Commande créée avec succès:', response);
        this.getOrders();
        this.cancelForm();
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        // Afficher un message d'erreur à l'utilisateur
      }
    });
  }

  editRow(index: number) {
    const order = this.paginatedRows[index];
    this.isEditMode = true;
    
    forkJoin([
      this.animalService.getAvailableAnimals(),
      this.animalService.getAnimalsForOrder(order.id)
    ]).subscribe({
      next: ([available, current]) => {
        this.availableAnimals = [...available, ...current];
        this.currentOrderAnimals = [...current];
        this.formData = { ...order };
      },
      error: (err) => console.error('Failed to load animals for edit', err)
    });
  }
  isAnimalAvailable(animalId: number, currentIndex: number): boolean {
    if (!this.isEditMode) return true;
    
    // Permettre de garder l'animal actuel sélectionné
    const currentAnimal = this.formData.animals[currentIndex];
    if (currentAnimal?.id === animalId) return true;
    
    // Vérifier si l'animal est disponible
    return this.availableAnimals.some(a => a.id === animalId);
  }
  loadAvailableAnimals() {
    this.animalService.getAvailableAnimals().subscribe({
      next: (animals) => this.availableAnimals = animals,
      error: (err) => console.error('Failed to load available animals', err)
    });
  }

  updateRow() {
    this.calculateTotal();
    
    const orderData = {
      user_id: this.formData.user_id,
      animals: this.formData.animals.filter(a => a.id > 0),
      total_amount: this.formData.total_amount,
      order_date: this.formData.order_date,
      status: this.formData.status
    };
  
    if (!this.formData.id) return;
  
    this.ordersService.updateOrder(this.formData.id, orderData).subscribe({
      next: () => {
        this.getOrders(); // Rafraîchir la liste
        this.cancelForm();
      },
      error: (error) => {
        console.error('Failed to update order', error);
      }
    });
  }

  deleteRow(index: number) {
    const order = this.paginatedRows[index];
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      this.ordersService.deleteOrder(order.id!).subscribe({
        next: () => {
          // Recharger les données après suppression
          this.getOrders();
        },
        error: (error) => {
          console.error('Failed to delete order:', error);
          // Afficher un message d'erreur à l'utilisateur
        }
      });
    }
  }

  cancelForm() {
    this.isAddMode = false;
    this.isEditMode = false;
  }

  addAnimal() {
    this.formData.animals.push({ id: 0, name: '', price: 0 });
  }

  removeAnimal(index: number) {
    this.formData.animals.splice(index, 1);
    this.calculateTotal();
  }

  onAnimalSelect(animalId: number, index: number) {
    const animal = this.allAnimals.find(a => a.id === animalId);
    if (animal) {
      this.formData.animals[index] = {
        id: animal.id,
        name: animal.name,
        price: animal.price
      };
      this.calculateTotal();
    }
  }

  calculateTotal() {
    this.formData.total_amount = this.formData.animals.reduce(
      (total, animal) => total + (animal.price || 0), 0
    );
  }

  getStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  }
}