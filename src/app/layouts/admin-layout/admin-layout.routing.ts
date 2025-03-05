import { Routes } from '@angular/router';
import { AnimalsComponent }         from '../../pages/tables/animals/animals.component';
import { ClientsComponent }         from '../../pages/tables/clients/clients.component';
import { CommandesComponent }       from '../../pages/tables/commandes/commandes.component';



import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { UserComponent } from '../../pages/user/user.component';
import { TableComponent } from '../../pages/table/table.component';
import { TypographyComponent } from '../../pages/typography/typography.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { NotificationsComponent } from '../../pages/notifications/notifications.component';
import { UpgradeComponent } from '../../pages/upgrade/upgrade.component';
import { SignupComponent } from 'app/pages/authentification/signup/signup.component';


export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'user',           component: UserComponent },
    { path: 'table',          component: TableComponent },
    { path: 'animals',        component: AnimalsComponent },
    { path: 'clients',        component: ClientsComponent },
    { path: 'commandes',      component: CommandesComponent },
    { path: 'signup',           component: SignupComponent },
    { path: 'typography',     component: TypographyComponent },
    { path: 'icons',          component: IconsComponent },
    { path: 'maps',           component: MapsComponent },
    { path: 'notifications',  component: NotificationsComponent },
    { path: 'upgrade',        component: UpgradeComponent }
];
