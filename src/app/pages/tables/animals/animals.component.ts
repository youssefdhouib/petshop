import { Component, OnInit } from '@angular/core';
import { AnimalService, Animal } from '../../../services/animals'; // Import the service

declare interface TableData {
  headerRow: string[];
  dataRows: Animal[];
}

@Component({
  selector: 'animals',
  moduleId: module.id,
  templateUrl: 'animals.component.html',
})
export class AnimalsComponent implements OnInit {
  public tableData1: TableData;
  public isAddMode = false;
  public isEditMode = false;
  public formData: Animal = {
    name: '',
    species: '',
    breed: '',
    birthdate: '',
    gender: '',
    price: 0,
    imageUrl: ''
  };

  public currentPage: number = 1;
  public itemsPerPage: number = 5;
  public searchText: string = '';

  constructor(private animalService: AnimalService) {}

  ngOnInit() {
    this.tableData1 = {
      headerRow: ['ID', 'Name', 'Species', 'Breed', 'Birthdate', 'Gender', 'Price'],
      dataRows: []
    };
    this.getAnimals(); // Fetch all animals when component loads
  }

  getAnimals() {
    this.animalService.getAllAnimals().subscribe(
      (animals: Animal[]) => {
        console.log(animals)
        this.tableData1.dataRows = animals;
      },
      (error) => {
        console.error('Failed to fetch animals', error);
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
      row.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Add New Animal
  toggleAddForm() {
    this.isAddMode = true;
    this.isEditMode = false;
    this.formData = { name: '', species: '', breed: '', birthdate: '', gender: '', price: 0, imageUrl: '' };
  }

  addRow() {
    this.animalService.addAnimal(this.formData).subscribe(
      () => {
        this.getAnimals();
        this.cancelForm();
      },
      (error) => {
        console.error('Failed to add animal', error);
      }
    );
  }

  editRow(index: number) {
    this.isEditMode = true;
    this.isAddMode = false;
    this.formData = { ...this.paginatedRows[index] };
  }

  updateRow() {
    this.animalService.updateAnimal(this.formData).subscribe(
      () => {
        this.getAnimals();
        this.cancelForm();
      },
      (error) => {
        console.error('Failed to update animal', error);
      }
    );
  }

  deleteRow(index: number) {
    const animal = this.paginatedRows[index];
    this.animalService.deleteAnimal(animal.id!).subscribe(
      () => this.getAnimals(),
      (error) => console.error('Failed to delete animal', error)
    );
  }

  cancelForm() {
    this.isAddMode = false;
    this.isEditMode = false;
    this.formData = { name: '', species: '', breed: '', birthdate: '', gender: '', price: 0, imageUrl: '' };
  }
}
