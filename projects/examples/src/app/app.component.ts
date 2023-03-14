import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroup  } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  private _onDestroy = new Subject<void>();
  fillerNav = Array.from({ length: 50 }, (_, i) => `Nav Item ${i + 1}`);
  isDarkTheme$: BehaviorSubject<boolean>;

  themeForm = new FormGroup({
    theme: new FormControl('theme-default', { nonNullable: true }),
  });

  private _mobileQueryListener: () => void;

  constructor(
    @Inject(DOCUMENT) private _document: any,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

    this.isDarkTheme$ = new BehaviorSubject<boolean>(
      media.matchMedia('(prefers-color-scheme: dark)').matches
    );

    this.themeForm.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this._document.body.classList.remove(
          'theme-pink',
          'theme-default'
        );
        this._document.body.classList.add(val.theme);
      });

    this.isDarkTheme$.pipe(takeUntil(this._onDestroy)).subscribe((value) => {
      this._document.body.classList.remove(
        'light',
        'dark'
      );

      if (value) {

        this._document.body.classList.add('dark');
      } else {

        this._document.body.classList.add('light');
      }
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for current year
   */
  get currentYear(): number {
    return new Date().getFullYear();
  }

  toggleScheme(): void {
    this.isDarkTheme$.next(!this.isDarkTheme$.value);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {}
  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
