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
  public formData: any = {
    name: '',
    species: '',
    breed: '',
    birthdate: '',
    gender: '',
    price: 0,
    image: null,
    currentImageUrl: ''
  };
  public imagePreview: string | ArrayBuffer | null = null;
  public selectedFileName: string | null = null;
  public currentPage: number = 1;
  public itemsPerPage: number = 5;
  public searchText: string = '';
  public currentAnimalId: number | null = null;

  constructor(private animalService: AnimalService) {}

  ngOnInit() {
    this.tableData1 = {
      headerRow: ['ID', 'Name', 'Species', 'Breed', 'Birthdate', 'Gender', 'Price', 'Image', 'Actions'],
      dataRows: []
    };
    this.getAnimals();
  }

  getAnimals() {
    this.animalService.getAllAnimals().subscribe(
      (animals: Animal[]) => {
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
    this.currentAnimalId = null;
    this.resetForm();
  }

  editRow(index: number) {
    const animal = this.paginatedRows[index];
    this.currentAnimalId = animal.id!;
    this.isEditMode = true;
    this.isAddMode = false;

    this.formData = {
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      birthdate: animal.birthdate,
      gender: animal.gender,
      price: animal.price,
      image: null,
      currentImageUrl: animal.imageUrl
    };

    this.imagePreview = this.getFullImageUrl(animal.imageUrl);
    this.selectedFileName = animal.imageUrl ? animal.imageUrl.split('/').pop() : null;
  }

  submitForm() {
    const formData = new FormData();
    formData.append('name', this.formData.name);
    formData.append('species', this.formData.species);
    formData.append('breed', this.formData.breed);
    formData.append('birthdate', this.formData.birthdate);
    formData.append('gender', this.formData.gender);
    formData.append('price', this.formData.price.toString());

    if (this.formData.image) {
      formData.append('image', this.formData.image);
    }

    if (this.isEditMode && this.currentAnimalId) {
      formData.append('currentImage', this.formData.currentImageUrl);
      this.animalService.updateAnimal(this.currentAnimalId, formData).subscribe(
        () => {
          this.getAnimals();
          this.cancelForm();
        },
        (error) => {
          console.error('Failed to update animal', error);
        }
      );
    } else {
      this.animalService.addAnimal(formData).subscribe(
        () => {
          this.getAnimals();
          this.cancelForm();
        },
        (error) => {
          console.error('Failed to add animal', error);
        }
      );
    }
  }

  deleteRow(index: number) {
    const animal = this.paginatedRows[index];
    if (confirm(`Are you sure you want to delete ${animal.name}?`)) {
      this.animalService.deleteAnimal(animal.id!).subscribe(
        () => {
          this.getAnimals();
        },
        (error) => {
          console.error('Failed to delete animal', error);
        }
      );
    }
  }

  cancelForm() {
    this.isAddMode = false;
    this.isEditMode = false;
    this.currentAnimalId = null;
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      name: '',
      species: '',
      breed: '',
      birthdate: '',
      gender: '',
      price: 0,
      image: null,
      currentImageUrl: ''
    };
    this.imagePreview = null;
    this.selectedFileName = null;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.formData.image = file;
      this.selectedFileName = file.name;

      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/img/default-animal.jpg';
    return imagePath.startsWith('http') ? imagePath :
           `http://localhost:8081/petshop/${imagePath}`;
  }
}
