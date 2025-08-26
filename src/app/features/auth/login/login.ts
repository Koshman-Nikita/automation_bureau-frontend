import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {}
