import { Component, OnInit, ViewChild, ElementRef, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { compile, run } from '@mdx-js/mdx';
import * as jsxRuntime from 'preact/jsx-runtime';
import { render } from 'preact';
import rehypeHighlight from 'rehype-highlight';

export interface DocItem {
  title: string;
  id: string;
  path: string;
}

export interface DocCategory {
  category: string;
  items?: DocItem[];
  subcategories?: DocCategory[];
}

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      
      <!-- Top Navigation -->
      <header class="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <a routerLink="/" class="flex items-center gap-2">
                <mat-icon class="text-primary-600 dark:text-primary-500">send</mat-icon>
                <span class="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Telegrator</span>
              </a>
            </div>
            <div class="flex items-center gap-4">
              <!-- Search (Simple Visual) -->
              <div class="relative hidden sm:block">
                 <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event); onSearch()" placeholder="Search docs..." 
                        class="w-64 pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100 placeholder-slate-400">
                 <mat-icon class="absolute left-3 top-2.5 text-slate-400 text-sm" style="font-size: 18px; width: 18px; height: 18px;">search</mat-icon>
                 
                 @if (searchResults().length > 0 && searchQuery()) {
                   <div class="absolute top-12 left-0 w-[400px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden py-2" style="max-height: 400px; overflow-y: auto;">
                      @for (res of searchResults(); track res.item.id) {
                        <a [routerLink]="['/docs', res.item.id]"
                           (click)="clearSearch()"
                           class="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-0">
                          <div class="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">{{res.category}}</div>
                          <div class="text-sm font-medium text-slate-900 dark:text-slate-100">{{res.item.title}}</div>
                        </a>
                      }
                   </div>
                 }
              </div>

              <a href="https://github.com/Rikitav/Telegrator" target="_blank" rel="noopener noreferrer" class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
                </svg>
              </a>
              <button (click)="toggleTheme()" class="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full focus:outline-none">
                @if (!isDark()) {
                  <mat-icon>dark_mode</mat-icon>
                } @else {
                  <mat-icon>light_mode</mat-icon>
                }
              </button>
              
              <!-- Mobile menu button -->
              <button (click)="toggleMobileMenu()" class="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                <mat-icon>menu</mat-icon>
              </button>
            </div>
          </div>
          
          <!-- Mobile search -->
          @if (mobileMenuOpen()) {
            <div class="md:hidden py-4 border-t border-slate-100 dark:border-slate-800">
               <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event); onSearch()" placeholder="Search docs..." 
                      class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100">
            </div>
          }
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row">
          
          <!-- Sidebar Navigation -->
          <aside [class.hidden]="!mobileMenuOpen()" class="md:block w-full md:w-64 pt-8 pb-10 pr-8 border-r-0 md:border-r border-slate-200 dark:border-slate-800 h-screen md:sticky md:top-16 overflow-y-auto hidden-scrollbar transition-all">
            <nav class="space-y-8">
              <ng-template #categoryTemplate let-category="category" let-level="level">
                <div [class.mt-6]="level === 0" [class.mt-4]="level > 0">
                  <h3 [class.text-sm]="level === 0" [class.uppercase]="level === 0" [class.tracking-wide]="level === 0"
                      [class.text-xs]="level > 0" [class.text-slate-500]="level > 0" [class.dark:text-slate-400]="level > 0"
                      class="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {{category.category}}
                  </h3>
                  <ul class="space-y-2 border-l border-slate-200 dark:border-slate-800" [class.ml-2]="level > 0">
                    @if (category.items) {
                      @for (item of category.items; track item.id) {
                        <li>
                          <a [routerLink]="['/docs', item.id]"
                             (click)="mobileMenuOpen.set(false)"
                             routerLinkActive="text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400 font-medium bg-primary-50 dark:bg-primary-900/10"
                             class="-ml-[1px] block border-l pl-4 py-1.5 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                            {{item.title}}
                          </a>
                        </li>
                      }
                    }
                    @if (category.subcategories) {
                      @for (subcat of category.subcategories; track subcat.category) {
                        <li class="-ml-[1px] block border-l border-slate-200 dark:border-slate-800 pl-4 py-1">
                          <ng-container *ngTemplateOutlet="categoryTemplate; context: { category: subcat, level: level + 1 }"></ng-container>
                        </li>
                      }
                    }
                  </ul>
                </div>
              </ng-template>

              @for (cat of structure(); track cat.category) {
                <ng-container *ngTemplateOutlet="categoryTemplate; context: { category: cat, level: 0 }"></ng-container>
              }
            </nav>
          </aside>

          <!-- Main Content -->
          <main class="flex-1 min-w-0 md:pl-10 pt-8 pb-24" [class.hidden]="mobileMenuOpen()">
            @if (loading()) {
              <div class="animate-pulse space-y-4">
                <div class="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-8"></div>
                <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div>
              </div>
            }

            @if (error()) {
              <div class="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
                <strong class="font-bold">Error loading content.</strong>
                <p>{{ error() }}</p>
              </div>
            }

            @if (!loading() && !error()) {
              <article #mdxContainer 
                       class="markdown-body max-w-none">
              </article>
            }
          </main>
          
        </div>
      </div>
    </div>
  `
})
export class DocsComponent implements OnInit {
  private http = inject(HttpClient);

  private route = inject(ActivatedRoute);

  @ViewChild('mdxContainer', { static: false }) mdxContainer!: ElementRef;

  structure = signal<DocCategory[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  isDark = signal<boolean>(false);
  mobileMenuOpen = signal<boolean>(false);
  
  private platformId = inject(PLATFORM_ID);

  searchQuery = signal<string>('');
  searchResults = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];
    
    const res: {category: string, item: DocItem}[] = [];
    const searchRecursive = (categories: DocCategory[], prefix = '') => {
      for (const cat of categories) {
        if (cat.items) {
          for (const item of cat.items) {
            if (item.title.toLowerCase().includes(query)) {
              res.push({ category: prefix + cat.category, item });
            }
          }
        }
        if (cat.subcategories) {
          searchRecursive(cat.subcategories, prefix + cat.category + ' > ');
        }
      }
    };
    searchRecursive(this.structure());
    return res;
  });

  constructor() {
    // Initial check for dark mode
    if (isPlatformBrowser(this.platformId)) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
         this.isDark.set(true);
         document.documentElement.classList.add('dark');
      }
    }
  }

  ngOnInit() {
    this.http.get<DocCategory[]>('docs/structure.json').subscribe({
      next: (data) => {
        this.structure.set(data);
        this.handleRouteParams();
      },
      error: () => {
        this.error.set('Could not load documentation structure.');
        this.loading.set(false);
      }
    });

    this.route.paramMap.subscribe(() => {
      if (this.structure().length > 0) {
        this.handleRouteParams();
      }
    });
  }

  toggleTheme() {
    this.isDark.set(!this.isDark());
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDark()) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  onSearch() {
    // handled by computed signal implicitly 
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  private handleRouteParams() {
    const docId = this.route.snapshot.paramMap.get('id');
    if (!docId) return;

    const findDoc = (categories: DocCategory[]): string | undefined => {
      for (const category of categories) {
        if (category.items) {
          const item = category.items.find(i => i.id === docId);
          if (item) return item.path;
        }
        if (category.subcategories) {
          const found = findDoc(category.subcategories);
          if (found) return found;
        }
      }
      return undefined;
    };

    const filePath = findDoc(this.structure());

    if (filePath) {
      this.loadMarkdown(filePath);
    } else {
      this.error.set('Page not found.');
      this.loading.set(false);
    }
  }

  private async loadMarkdown(path: string) {
    this.loading.set(true);
    this.error.set(null);
    
    // Unmount previous content if any
    if (this.mdxContainer?.nativeElement) {
      render(null, this.mdxContainer.nativeElement);
    }
    
    this.http.get('docs/' + path, { responseType: 'text' }).subscribe({
      next: async (md) => {
        try {
          const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
          let codeContent = md;
          if (md.match(frontmatterRegex)) {
             codeContent = md.replace(frontmatterRegex, '');
          }

          const code = String(await compile(codeContent, {
            outputFormat: 'function-body',
            rehypePlugins: [rehypeHighlight]
          }));

          const { default: MDXContent } = await run(code, {
            ...jsxRuntime,
            useMDXComponents: () => ({})
          });

          this.loading.set(false);
          
          // Wait a tick for Angular to render the container if it was hidden
          setTimeout(() => {
            if (isPlatformBrowser(this.platformId) && this.mdxContainer?.nativeElement) {
               render(jsxRuntime.jsx(MDXContent, {}), this.mdxContainer.nativeElement);
               window.scrollTo(0, 0);
            }
          }, 0);
          
        } catch (e: unknown) {
          console.error(e);
          this.error.set('Error parsing MDX: ' + (e instanceof Error ? e.message : String(e)));
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Failed to load MDX content.');
        this.loading.set(false);
      }
    });
  }
}
