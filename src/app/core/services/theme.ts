import { Service } from '@angular/core';
import {Injectable, signal, effect} from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class Theme {
    darkMode = signal<boolean>(
        localStorage.getItem('theme') === 'dark'
    );
    
    constructor(){
        effect(() => {
            const isDark= this.darkMode();
            if(isDark){
             document.documentElement.classList.add('dark');
            }else{
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme','light');
            }
        });
    }
    toggleTheme() {
        this.darkMode.update(dark=> !dark);
    }
}
