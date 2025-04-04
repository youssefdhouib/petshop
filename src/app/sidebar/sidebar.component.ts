import { Component, OnInit } from '@angular/core';


export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

export const ROUTES: RouteInfo[] = [
    { path: '/dashboard',     title: 'Dashboard',         icon:'nc-bank',       class: '' },
   /*  { path: '/icons',         title: 'Icons',             icon:'nc-diamond',    class: '' },
    { path: '/maps',          title: 'Maps',              icon:'nc-pin-3',      class: '' }, */
    { path: '/notifications', title: 'Notifications',     icon:'nc-bell-55',    class: '' },
    { path: '/auth/signin',    title: 'Sign In',            icon:'nc-key-25',     class: '' },
    { path: '/auth/signup', title: 'Sign Up',         icon:'nc-badge',      class: '' },
  /*{ path: '/table',         title: 'Table List',        icon:'nc-tile-56',    class: '' }, */
    { path: '/animals',         title: 'Animals List',        icon:'nc-tile-56',    class: '' },
    { path: '/clients',         title: 'Clients List',        icon:'nc-single-02',    class: '' },
    { path: '/commandes',         title: 'Commandes List',        icon:'nc-tile-56',    class: '' },



   /*  { path: '/typography',    title: 'Typography',        icon:'nc-caps-small', class: '' }, */

];

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any[];
    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
}
