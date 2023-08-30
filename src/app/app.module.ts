import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { AppComponent } from './app.component';
import { DropDown } from './components/DropDown';
//https://stackoverflow.com/questions/45390312/can-one-render-angular-2-components-inside-dom-elements-from-third-party-librari
@NgModule({
 imports: [ BrowserModule,FormsModule ],
  declarations: [ AppComponent/*, AComponent */],
  entryComponents: [/* AComponent */],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
