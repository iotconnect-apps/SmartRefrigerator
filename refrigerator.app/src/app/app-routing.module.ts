import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { SelectivePreloadingStrategy } from './selective-preloading-strategy'
import { PageNotFoundComponent } from './page-not-found.component'
import {
  DynamicDashboardComponent,
  HomeComponent, UserListComponent, UserAddComponent, DashboardComponent,CallbackComponent,
  LoginComponent, RegisterComponent, MyProfileComponent, 
  ChangePasswordComponent, AdminLoginComponent, SubscribersListComponent, HardwareListComponent, HardwareAddComponent,
  UserAdminListComponent, AdminUserAddComponent, AdminDashboardComponent, SubscriberDetailComponent,
  BulkuploadAddComponent, RolesListComponent, RolesAddComponent, AlertsComponent,
  LocationsListComponent, AddLocationComponent, RefrigeratorsListComponent, AddRefrigeratorComponent,
  LocationDetailsComponent, MaintenanceListComponent, RefrigeratorDashboardComponent, ScheduleMaintenanceComponent
} from './components/index'

import { AuthService, AdminAuthGuard } from './services/index'

const appRoutes: Routes = [
  {
    path: 'admin',
    children: [
      {
        path: '',
        component: AdminLoginComponent
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        canActivate: [AuthService]
      },
      {
        path: 'subscribers/:email/:productCode/:companyId',
        component: SubscriberDetailComponent,
        canActivate: [AuthService]
      },
      {
        path: 'subscribers',
        component: SubscribersListComponent,
        canActivate: [AuthService]
      },
      {
        path: 'hardwarekits',
        component: HardwareListComponent,
        canActivate: [AuthService]
      },
      {
        path: 'hardwarekits/bulkupload',
        component: BulkuploadAddComponent,
        canActivate: [AuthService]
      },
      {
        path: 'hardwarekits/addhardwarekit',
        component: HardwareAddComponent,
        canActivate: [AuthService]
      },
      {
        path: 'hardwarekits/:hardwarekitGuid',
        component: HardwareAddComponent,
        canActivate: [AuthService]
      },
      {
        path: 'users',
        component: UserAdminListComponent,
        canActivate: [AuthService]
      },
      {
        path: 'users/adduser',
        component: AdminUserAddComponent,
        canActivate: [AuthService]
      },
      {
        path: 'users/:userGuid',
        component: AdminUserAddComponent,
        canActivate: [AuthService]
      }
    ]
  },
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'callback',
    component: CallbackComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  //App routes goes here 
  {
    path: 'my-profile',
    component: MyProfileComponent,
    //canActivate: [AuthService]
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    //canActivate: [AuthService]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'locations',
    component: LocationsListComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'locations/:locationGuid',
    component: AddLocationComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'locations/details/:locationGuid',
    component: LocationDetailsComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'locations/add',
    component: AddLocationComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'refrigerators',
    component: RefrigeratorsListComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'refrigerators/:refrigeratorGuid',
    component: AddRefrigeratorComponent,
     canActivate: [AdminAuthGuard]
  },
  {
    path: 'refrigerators/add',
    component: AddRefrigeratorComponent,
     canActivate: [AdminAuthGuard]
  },
  {
    path: 'refrigerators/dashboard/:refrigeratorGuid',
    component: RefrigeratorDashboardComponent,
     canActivate: [AdminAuthGuard]
  },
  {
    path: 'maintenance',
    component: MaintenanceListComponent,
     canActivate: [AdminAuthGuard]
  },
  {
    path: 'maintenance/:maintenanceGuid',
    component: ScheduleMaintenanceComponent,
     canActivate: [AdminAuthGuard]
  },
  {
    path: 'maintenance/add',
    component: ScheduleMaintenanceComponent,
     canActivate: [AdminAuthGuard]
  },
  {
    path: 'alerts',
    component: AlertsComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'alerts/location/:entityGuid',
    component: AlertsComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'alerts/refrigerator/:deviceGuid',
    component: AlertsComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'users',
    component: UserListComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'users/:userGuid',
    component: UserAddComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'users/add',
    component: UserAddComponent,
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'roles/:deviceGuid',
    component: RolesAddComponent,
    canActivate: [AdminAuthGuard]
  }, {
    path: 'roles',
    component: RolesListComponent,
    canActivate: [AdminAuthGuard]
  },
  {
		path: 'dynamic-dashboard',
		component: DynamicDashboardComponent,
		canActivate: [AdminAuthGuard]
	},
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes, {
      preloadingStrategy: SelectivePreloadingStrategy
    }
    )
  ],
  exports: [
    RouterModule
  ],
  providers: [
    SelectivePreloadingStrategy
  ]
})

export class AppRoutingModule { }
