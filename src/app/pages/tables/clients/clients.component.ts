import { Component, OnInit } from '@angular/core';
import { UsersService, User } from '../../../services/users'; // Import the service

declare interface TableData {
  headerRow: string[];
  dataRows: User[];
}

@Component({
  selector: 'clients',
  moduleId: module.id,
  templateUrl: 'clients.component.html',
})
export class ClientsComponent implements OnInit {
  public tableData1: TableData;
  public isAddMode = false;
  public isEditMode = false;
  public formData: User = {
  fullname: '',
  email: '',
  phone: '',
  password: '',
  role: 'client' // Valeur par défaut
};
  public currentPage: number = 1;
  public itemsPerPage: number = 5;
  public searchText: string = '';

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.tableData1 = {
      headerRow: ['ID', 'Full Name', 'Email', 'Phone', 'Role'], // En-têtes mis à jour
      dataRows: []
    };
    this.getUsers(); // Fetch all clients when component loads
  }

  getUsers() {
    this.usersService.getAllUsers().subscribe(
      (users: User[]) => {
        console.log(users);
        this.tableData1.dataRows = users;
      },
      (error) => {
        console.error('Failed to fetch users', error);
      }
    );
  }

  // Pagination
  get paginatedRows() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredRows().slice(startIndex, endIndex);
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

  filteredRows() {
    return this.tableData1.dataRows.filter(row =>
      row.fullname.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Add New Client
  toggleAddForm() {
    this.isAddMode = true;
    this.isEditMode = false;
    this.formData = { fullname: '', email: '', phone: '', password: '', role: '' };
  }

  addRow() {
    this.usersService.createUser(this.formData).subscribe(
      () => {
        this.getUsers();
        this.cancelForm();
      },
      (error) => {
        console.error('Failed to add user', error);
      }
    );
  }

  editRow(index: number) {
    this.isEditMode = true;
    this.isAddMode = false;
    this.formData = { ...this.paginatedRows[index] };
  }

  updateRow() {
    const user = this.paginatedRows.find(u => u.id === this.formData.id);
  
    // Si le champ password est vide, conservez le mot de passe existant
    if (!this.formData.password) {
      this.formData.password = user?.password || '';
    }
  
    this.usersService.updateUser(this.formData.id!, this.formData).subscribe(
      (updatedUser) => {
        console.log('User updated:', updatedUser);
        this.getUsers(); // Rafraîchir la liste des utilisateurs
        this.cancelForm();
      },
      (error) => {
        console.error('Failed to update user', error);
      }
    );
  }

  deleteRow(index: number) {
    const user = this.paginatedRows[index];
    this.usersService.deleteUser(user.id!).subscribe(
      () => {
        console.log('User deleted');
        this.getUsers(); // Mettre à jour la liste des clients après la suppression
      },
      (error) => {
        console.error('Failed to delete user', error);
      }
    );
  }

  cancelForm() {
    this.isAddMode = false;
    this.isEditMode = false;
    this.formData = { fullname: '', email: '', phone: '', password: '', role: '' };
  }
}
