import {Component, NgModule, VERSION, Inject,Renderer2,ElementRef,ViewChild,  ComponentFactoryResolver, Injector,AfterViewInit} from '@angular/core'
import { DropDown } from './components/DropDown';
import {ComboBox} from './components/ComboBox';
@Component({
  selector: 'app-root',
  template: `
    <div #divNote >
     
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit{
    name = `Angular! v${VERSION.full}`;
    componentRef;
	 @ViewChild('divNote') input: ElementRef;
 private  combobox:ComboBox;
 
    constructor(private renderer: Renderer2) {
        //const someDOMElement = document.querySelector('.host');
      //  const f = r.resolveComponentFactory(AComponent);
      //  this.componentRef = f.create(i, [], someDOMElement);
		
    }

    ngDoCheck() {
      //  this.componentRef.changeDetectorRef.detectChanges();
    }
	public ngAfterViewInit(): void {
       // console.log(this.input.nativeElement);
		//new AComponent(this.input.nativeElement);
		//new ComboBox(this.input.nativeElement);
		//this.combobox = new ComboBox(this.input.nativeElement);
		
		//this.combobox.itemsSource = ['value1', 'value2', 'value3'];
		
		const combobox = new ComboBox(this.input.nativeElement);
		
		combobox.itemsSource = ['value1', 'value2', 'value3'];
	//	this.renderer.selectRootElement(this.input["nativeElement"]).focus();
		
		}
}