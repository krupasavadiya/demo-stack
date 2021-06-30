import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChartComponent } from './chart/chart.component'

const routes: Routes = [

  {
    path: 'chart/:query',
    component: ChartComponent
  },
  {
    path: '',
    redirectTo: 'chart/India',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'chart/India'
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
