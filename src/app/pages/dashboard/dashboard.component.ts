import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import { UsersService, User } from '../../services/users'; // Import the service
import { OrdersService, Order  } from '../../services/orders'; // Ajustez le chemin


@Component({
  selector: 'dashboard-cmp',
  moduleId: module.id,
  templateUrl: 'dashboard.component.html',
  styles: [`
    /* Styles globaux pour les cartes */
    .card {
      margin-bottom: 25px;
    }

    /* Carte des statistiques de commandes */
    #chartEmail-container {
      height: 350px !important;
      position: relative;
    }

    /* Carte des revenus mensuels */
    #revenueChart-container {
      height: 400px !important;
      position: relative;
    }

    /* Ajustements des graphiques */
    .card-body canvas {
      width: 100% !important;
      height: 100% !important;
      min-height: 300px;
    }

    /* Légendes améliorées */
    .chart-legend {
      font-size: 14px;
      margin-bottom: 10px;
    }

    /* Tooltips plus grands */
    .chartjs-tooltip {
      font-size: 14px !important;
      opacity: 1 !important;
    }
  `]
})
export class DashboardComponent implements OnInit {
  public chartHours: any;
  public chartEmail: any;
  public totalClients: number = 0;
  public ordersThisMonth: number = 0; // Nouvelle variable pour les commandes ce mois-ci
  currentYear = new Date().getFullYear(); // Pour l'affichage dans le titre
  public speedChart: any; // Déclaration publique pour le debug
  public revenueLastWeek: number = 0;
  public ordersStats = {
    confirmed: 0,
    pending: 0,
    cancelled: 0
  };
  public revenueChart: any;

  


  
  constructor(private usersService: UsersService , private ordersService: OrdersService) {}
  ngOnInit() {
    this.initChartHours();
    
    this.initChartStats();
    this.initSpeedChart();
    this.loadTotalClients();
    this.loadOrdersThisMonth();
    this.calculateRevenueLastWeek();
    this.calculateOrdersStats();
    this.initRevenueChart();  // Nouveau graphique



  }
  private initRevenueChart() {
    this.ordersService.getAllOrders().subscribe(orders => {
      const monthlyRevenue = this.calculateMonthlyRevenue(orders);
      
      const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      if (this.revenueChart) this.revenueChart.destroy();
  
      this.revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: monthlyRevenue.map(m => m.month),
          datasets: [{
            label: "Revenue (USD)",
            data: monthlyRevenue.map(m => m.revenue),
            borderColor: '#51CACF',
            backgroundColor: 'rgba(81, 202, 207, 0.1)',
            borderWidth: 3,
            pointRadius: 5, /* Points légèrement agrandis */
            pointBackgroundColor: '#51CACF',
            pointBorderColor: '#fff',
            pointHoverRadius: 7,
            tension: 0.3 /* Légèrement moins courbé pour plus de clarté */
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                callback: (value) => '$' + value,
                font: {
                  size: 12 /* Taille de police augmentée */
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 12 /* Taille de police augmentée */
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              bodyFont: {
                size: 14 /* Taille de tooltip augmentée */
              },
              callbacks: {
                label: (ctx) => 'Revenue: ' + ctx.raw.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0
                })
              }
            }
          }
        }
      });
    });
  }
  private calculateMonthlyRevenue(orders: Order[]): {month: string, revenue: number}[] {
    // 1. Créer un Map pour stocker le revenu par mois
    const revenueMap = new Map<string, number>();
    
    // 2. Récupérer les 10 derniers mois
    const months = this.getLast10Months();
    
    // 3. Initialiser le Map avec les 10 derniers mois
    months.forEach(month => revenueMap.set(month, 0));
    
    // 4. Calculer le revenu pour chaque commande
    orders.forEach(order => {
      if (order.status === 'Confirmed' || order.status === 'Pending') {

      const orderDate = new Date(order.order_date);
      const monthKey = `${orderDate.getFullYear()}-${(orderDate.getMonth()+1).toString().padStart(2, '0')}`;
      
      if (revenueMap.has(monthKey)) {
        revenueMap.set(monthKey, revenueMap.get(monthKey)! + order.total_amount);
      }}
    });
    
    // 5. Convertir en tableau et formater
    return Array.from(revenueMap.entries()).map(([month, revenue]) => ({
      month: this.formatMonth(month),
      revenue
    }));
  }
  
  private getLast10Months(): string[] {
    const months: string[] = [];
    const date = new Date();
    
    for (let i = 9; i >= 0; i--) {
      const tempDate = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const year = tempDate.getFullYear();
      const month = (tempDate.getMonth() + 1).toString().padStart(2, '0');
      months.push(`${year}-${month}`);
    }
    
    return months;
  }
  
  private formatMonth(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  
  public calculateOrdersStats(): void {
    this.ordersService.getAllOrders().subscribe((orders: Order[]) => {
      const currentYear = new Date().getFullYear();
      
      const thisYearOrders = orders.filter(order => 
        new Date(order.order_date).getFullYear() === currentYear
      );
  
      this.ordersStats = {
        confirmed: thisYearOrders.filter(order => order.status === 'Confirmed').length,
        pending: thisYearOrders.filter(order => order.status === 'Pending').length,
        cancelled: thisYearOrders.filter(order => order.status === 'Cancelled').length
      };
  
      // Mettez à jour le graphique
      this.updateOrdersStatsChart();
    });
  }
  private calculateRevenueLastWeek(): void {
  this.ordersService.getAllOrders().subscribe(
    (orders: Order[]) => {
      const today = new Date();
      const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
      
      this.revenueLastWeek = orders
        .filter(order => {
          const orderDate = new Date(order.order_date);
          const isValidStatus = order.status === 'Confirmed' || order.status === 'Pending';
          return orderDate >= lastWeek && 
                 orderDate <= today && 
                 isValidStatus &&
                 order.status !== 'Cancelled';
        })
        .reduce((sum, order) => sum + order.total_amount, 0);
    },
    error => {
      console.error('Erreur lors du calcul du revenu:', error);
    }
  );
}



  private loadOrdersThisMonth() {
    this.ordersService.getAllOrders().subscribe(
      (orders: Order[]) => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Filtre les commandes du mois en cours
        this.ordersThisMonth = orders.filter(order => {
          const orderDate = new Date(order.order_date);
          return (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear
          );
        }).length; // Compte le nombre de commandes
      },
      error => {
        console.error('Erreur lors du chargement des commandes:', error);
      }
    );
  }
  
  private loadTotalClients() {
    this.usersService.getAllUsers().subscribe(
      (users: User[]) => {
        // Filtrer les clients si nécessaire (par exemple, si certains utilisateurs ne sont pas des clients)
        this.totalClients = users.length;
      },
      error => {
        console.error('Erreur lors du chargement des clients:', error);
      }
    );
  }

 private initChartHours() {
    const canvas = document.getElementById("chartHours") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    this.chartHours = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        datasets: [
          {
            borderColor: "#6bd098",
            backgroundColor: "#6bd098",
            borderWidth: 3,
            data: [300, 310, 316, 322, 330, 326, 333, 345, 338, 354]
          },
          {
            borderColor: "#f17e5d",
            backgroundColor: "#f17e5d",
            borderWidth: 3,
            data: [320, 340, 365, 360, 370, 385, 390, 384, 408, 420]
          }
        ]
      },
      options: {
        legend: { display: false },
        tooltips: { enabled: false },
        scales: {
          yAxes: [{
            ticks: { fontColor: "#9f9f9f", beginAtZero: false, maxTicksLimit: 5 },
            gridLines: { drawBorder: false, zeroLineColor: "#ccc", color: 'rgba(255,255,255,0.05)' }
          }],
          xAxes: [{
            gridLines: { drawBorder: false, color: 'rgba(255,255,255,0.1)', zeroLineColor: "transparent", display: false },
            ticks: { padding: 20, fontColor: "#9f9f9f" }
          }]
        }
      }
    });
  }

  private updateOrdersStatsChart(): void {
    if (this.chartEmail) {
      this.chartEmail.data.datasets[0].data = [
        this.ordersStats.confirmed,
        this.ordersStats.pending,
        this.ordersStats.cancelled
      ];
      this.chartEmail.update();
    }
  }
  
  private initChartStats() {
    const canvas = document.getElementById("chartEmail") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    this.chartEmail = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ["Confirmed", "Pending", "Cancelled"],
        datasets: [{
          backgroundColor: ['#4acccd', '#fcc468', '#ef8157'],
          borderWidth: 0,
          data: [0, 0, 0]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, /* Important pour le redimensionnement */
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 12 /* Taille de légende augmentée */
              }
            }
          },
          tooltip: {
            bodyFont: {
              size: 14 /* Taille de tooltip augmentée */
            },
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  private initSpeedChart() {
    this.ordersService.getAllOrders().subscribe(orders => {
      const monthlyData = this.prepareMonthlyData(orders);
      
      // 1. Calcul des valeurs entières
      const maxValue = Math.max(...monthlyData, 0);
      const stepSize = this.calculateIntegerStepSize(maxValue);
      const adjustedMax = Math.ceil(maxValue / stepSize) * stepSize;
  
      // 2. Initialisation du canvas
      const canvas = document.getElementById("speedChart") as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
  
      // 3. Destruction de l'ancien graphique
      if (this.speedChart) this.speedChart.destroy();
  
      // 4. Création du nouveau graphique
      this.speedChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [{
            label: "Orders",
            data: monthlyData,
            borderColor: '#51CACF',
            borderWidth: 3,
            pointRadius: 5,
            tension: 0.4
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              min: 0,
              max: adjustedMax,
              ticks: {
                stepSize: stepSize,
                callback: function(value) {
                  return Math.floor(value); // Affiche uniquement la partie entière
                }              },
              grid: {
                color: 'rgba(0,0,0,0.05)'
              }
            },
            x: { grid: { display: false } }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.parsed.y} commandes` 
              }
            }
          }
        }
      });
    });
  }
  
  // Calcule un stepSize entier optimal
  private calculateIntegerStepSize(maxValue: number): number {
    if (maxValue <= 5) return 1;
    if (maxValue <= 10) return 2;
    if (maxValue <= 20) return 5;
    return Math.ceil(maxValue / 5);
  }

  private prepareMonthlyData(orders: Order[]): number[] {
    const monthlyCounts = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    orders.forEach(order => {
      try {
        const orderDate = new Date(order.order_date);
        if (orderDate.getFullYear() === currentYear) {
          const month = orderDate.getMonth(); // 0-11
          monthlyCounts[month]++;
        }
      } catch (e) {
        console.error("Erreur de traitement de date:", order.order_date);
      }
    });

    return monthlyCounts;
  }

}

